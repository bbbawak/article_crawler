import { CurrencyName, ShibaBurn, ShibaBurnArchive } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { Request } from "express";
import normalizeDate from "../../../utils/normalizeDate";
import { paginationHelpers } from "../../../helpars/paginationHelper";

//create main archive
const createShibaBurnArchiveIntoDB = async () => {
  const result = await prisma.shibaBurnArchive.create({
    data: {
      name: CurrencyName.SHIBA,
    },
  });
  if (!result) {
    throw new ApiError(500, "Failed to create ShibaBurnArchive record");
  }
  return result;
};

//create burn data for each date
const createShibaBurnIntoDB = async (payload: Partial<ShibaBurn>) => {
  const date = normalizeDate(payload.date as string);
  const isExistThisDate = await prisma.shibaBurn.findUnique({
    where: {
      date: date,
    },
  });
  if (isExistThisDate) {
    throw new ApiError(400, "data with This date already exist");
  }
  const result = await prisma.shibaBurn.create({
    data: {
      shibaBurnArchiveId: payload.shibaBurnArchiveId as string,
      date: date as string,
      burnCount: payload.burnCount as number,
      transactionRef: payload.transactionRef as string,
    },
  });
  if (!result) {
    throw new ApiError(500, "Failed to create ShibaBurn record");
  }
  return result;
};

//update shiba burn data
const updateShibaBurnIntoDB = async (
  payload: Partial<ShibaBurn>,
  shibaBurnId: string
) => {
  let date;
  // check if this date already exist
  if (payload.date) {
    date = normalizeDate(payload.date as string);
    const isExistThisDate = await prisma.shibaBurn.findFirst({
      where: {
        date: date,
      },
    });
    if (isExistThisDate) {
      throw new ApiError(400, "data with This date already exist");
    }
  }
  const result = await prisma.shibaBurn.update({
    where: { id: shibaBurnId },
    data: payload,
  });

  if (!result) {
    throw new ApiError(500, "Failed to update ShibaBurn record");
  }
  return result;
};

//delete shiba burn
const deleteShibaBurnFromDB = async (id: string) => {
  const result = await prisma.shibaBurn.delete({
    where: { id },
  });
  if (!result) {
    throw new ApiError(500, "Failed to delete ShibaBurn record");
  }
  return result;
};

//get shiba burn data by month and year
const getShibaBurnByMonthAndYear = async (req: Request) => {
  const { year, month } = req.query;
  const parsedYear = parseInt(year as string, 10);
  const parsedMonth = parseInt(month as string, 10);

  // Create the date range as strings
  // Start of the month
  const startDate = new Date(parsedYear, parsedMonth - 1, 1).toISOString();
  // Start of the next month
  const endDate = new Date(parsedYear, parsedMonth, 1).toISOString();

  const burns = await prisma.shibaBurn.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  return burns;
};

//get all shiba burn
// const getAllShibaBurn = async (req: Request) => {
//   //paginate options
//   const options = {
//     page: Number(req.query.page),
//     limit: Number(req.query.limit) || 31,
//     sortBy: req.query.sortBy as string,
//     sortOrder: req.query.sortOrder as string,
//   };

//   //get month and year
//   const { year, month } = req.query;
//   const parsedYear = parseInt(year as string, 10);
//   const parsedMonth = parseInt(month as string, 10);

//   //initialize start and end date
//   let startDate;
//   let endDate;
//   let whereCondition = {};

//   // if (parsedMonth && parsedYear) {
//   //   // Start of the month
//   //   startDate = new Date(parsedYear, parsedMonth - 1, 1).toISOString();
//   //   // Start of the next month
//   //   endDate = new Date(parsedYear, parsedMonth, 1).toISOString();
//   //   whereCondition = {
//   //     date: {
//   //       gte: startDate,
//   //       lt: endDate,
//   //     },
//   //   };
//   // }

//   if (parsedMonth && parsedYear) {
//     // Set startDate to the start of the month at midnight UTC
//     startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1)).toISOString(); // Convert to ISO string
//     // Set endDate to the first day of the next month at midnight UTC
//     endDate = new Date(Date.UTC(parsedYear, parsedMonth, 1)); // Start of the next month
  
//     // Adjust endDate to the start of the next month, e.g., 2025-02-01T00:00:00.000Z
//     endDate = endDate.toISOString(); // Convert to ISO string
  
//     // Log the start and end dates for debugging
//     console.log("Start Date: ", startDate);
//     console.log("End Date: ", endDate);
  
//     whereCondition = {
//       date: {
//         gte: startDate, // From the start of the month
//         lt: endDate, // Up to the start of the next month
//       },
//     };
//   }

//   //calculate pagination
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelpers.calculatePagination(options);

//   const result = await prisma.shibaBurn.findMany({
//     where: whereCondition,
//     skip,
//     take: limit,
//     orderBy: {
//       date: "desc",
//     },
//   });
//   console.log({result})
//   if (!result) {
//     throw new ApiError(500, "Failed to get ShibaBurn record");
//   }
//   console.log({result})
//   return result;
// };

const getAllShibaBurn = async (req: Request) => {
  // Pagination options
  const options = {
    page: Number(req.query.page),
    limit: Number(req.query.limit) || 31,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  };

  // Get month and year from query params
  const { year, month } = req.query;
  const parsedYear = parseInt(year as string, 10);
  const parsedMonth = parseInt(month as string, 10);

  // Initialize start and end date
  let startDateStr;
  let endDateStr;
  let whereCondition = {};

  if (parsedMonth && parsedYear) {
    // Format startDate to 'YYYY-MM-DD'
    startDateStr = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`; // '2025-01-01'
    
    // Format endDate to the first day of the next month (exclusive)
    endDateStr = `${parsedYear}-${String(parsedMonth + 1).padStart(2, '0')}-01`; // '2025-02-01'


    // Build the where condition for the query
    whereCondition = {
      date: {
        gte: startDateStr, // From the start of the month (inclusive)
        lt: endDateStr,    // Up to the start of the next month (exclusive)
      },
    };
  }

  // Pagination calculation
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);

  // Execute the query to fetch ShibaBurn records
  const result = await prisma.shibaBurn.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      date: "desc",
    },
  });

  // Check if result is empty or null
  if (!result || result.length === 0) {
    throw new ApiError(500, "Failed to get ShibaBurn record");
  }

  return result;
};




export const ShibaBurnServices = {
  createShibaBurnArchiveIntoDB,
  createShibaBurnIntoDB,
  updateShibaBurnIntoDB,
  deleteShibaBurnFromDB,
  getShibaBurnByMonthAndYear,
  getAllShibaBurn,
};
