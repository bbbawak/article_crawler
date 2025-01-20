import { CurrencyName, LuncBurn, LuncBurnArchive } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { Request } from "express";
import normalizeDate from "../../../utils/normalizeDate";
import { paginationHelpers } from "../../../helpars/paginationHelper";

//create main archive
const createLuncBurnArchiveIntoDB = async () => {
  const result = await prisma.luncBurnArchive.create({
    data: {
      name: CurrencyName.LUNC,
    },
  });
  if (!result) {
    throw new ApiError(500, "Failed to create LuncBurnArchive record");
  }
  return result;
};

//create burn data for each date
const createLuncBurnIntoDB = async (payload: Partial<LuncBurn>) => {
  const date = normalizeDate(payload.date as string);
  const isExistThisDate = await prisma.luncBurn.findUnique({
    where: {
      date: date,
    },
  });
  if (isExistThisDate) {
    throw new ApiError(400, "data with This date already exist");
  }
  const result = await prisma.luncBurn.create({
    data: {
      luncBurnArchiveId: payload.luncBurnArchiveId as string,
      date: date as string,
      transactionRef: payload.transactionRef as string,
      burnCount: payload.burnCount as number,
    },
  });
  if (!result) {
    throw new ApiError(500, "Failed to create LuncBurn record");
  }
  return result;
};

//update lunc burn data
const updateLuncBurnIntoDB = async (
  payload: Partial<LuncBurn>,
  luncBurnId: string
) => {
  let date;
  // check if this date already exist
  if (payload.date) {
    date = normalizeDate(payload.date as string);
    const isExistThisDate = await prisma.luncBurn.findFirst({
      where: {
        date: date,
      },
    });
    if (isExistThisDate) {
      throw new ApiError(400, "data with This date already exist");
    }
  }
  const result = await prisma.luncBurn.update({
    where: { id: luncBurnId },
    data: payload,
  });

  if (!result) {
    throw new ApiError(500, "Failed to update LuncBurn record");
  }
  return result;
};

//delete lunc burn
const deleteLuncBurnFromDB = async (id: string) => {
  const result = await prisma.luncBurn.delete({
    where: { id },
  });
  if (!result) {
    throw new ApiError(500, "Failed to delete LuncBurn record");
  }
  return result;
};

//get lunc burn data by month and year
const getLuncBurnByMonthAndYear = async (req: Request) => {
  const { year, month } = req.query;
  const parsedYear = parseInt(year as string, 10);
  const parsedMonth = parseInt(month as string, 10);

  // Create the date range as strings
  // Start of the month
  const startDate = new Date(parsedYear, parsedMonth - 1, 1).toISOString();
  // Start of the next month
  const endDate = new Date(parsedYear, parsedMonth, 1).toISOString();

  const burns = await prisma.luncBurn.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  return burns;
};

//get both shiba burn and lunc archive main model
const getShibAndLuncBurnArchive = async () => {
  const shibaBurnArchive = await prisma.shibaBurnArchive.findFirst({
    where: { name: CurrencyName.SHIBA },
  });
  const luncBurnArchive = await prisma.luncBurnArchive.findFirst({
    where: { name: CurrencyName.LUNC },
  });
  if (!shibaBurnArchive || !luncBurnArchive) {
    throw new ApiError(
      500,
      "Failed to get ShibaBurnArchive or LuncBurnArchive record"
    );
  }
  return [shibaBurnArchive, luncBurnArchive];
};

//get all lunc burn

// const getAllLuncBurn = async (req: Request) => {
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

//   if (parsedMonth && parsedYear) {
//     // Start of the month
//     startDate = new Date(parsedYear, parsedMonth - 1, 1).toISOString();
//     // Start of the next month
//     endDate = new Date(parsedYear, parsedMonth, 1).toISOString();
//     whereCondition = {
//       date: {
//         gte: startDate,
//         lt: endDate,
//       },
//     };
//   }

//   //calculate pagination
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelpers.calculatePagination(options);

//   const result = await prisma.luncBurn.findMany({
//     where: whereCondition,
//     skip,
//     take: limit,
//     orderBy: {
//       date: "desc",
//     },
//   });
//   if (!result) {
//     throw new ApiError(500, "Failed to get LuncBurn record");
//   }
//   console.log({result})
//   return result;
// };

const getAllLuncBurn = async (req: Request) => {
  // Pagination options
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 31,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  };

  // Get year and month
  const { year, month } = req.query;
  const parsedYear = parseInt(year as string, 10);
  const parsedMonth = parseInt(month as string, 10);

  // Validate year and month
  if (!parsedYear || !parsedMonth || isNaN(parsedYear) || isNaN(parsedMonth)) {
    throw new ApiError(400, "Invalid or missing 'year' or 'month' query parameters");
  }

  // Format start and end dates to 'YYYY-MM-DD' (without time)
  const startDateStr = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`; // '2025-01-01'
  
  // Set end date to the first day of the next month (exclusive)
  const endDateStr = `${parsedYear}-${String(parsedMonth + 1).padStart(2, '0')}-01`; // '2025-02-01'

  const whereCondition = {
    date: {
      gte: startDateStr, // From the start of the month (inclusive)
      lt: endDateStr,    // Up to the start of the next month (exclusive)
    },
  };

  // Pagination calculation
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);

  // Validate sorting fields
  const validSortFields = ["date", "burnAmount", "name"]; // Example fields
  const sortField = validSortFields.includes(sortBy) ? sortBy : "date";

  try {
    // Query for full date range
    const result = await prisma.luncBurn.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        [sortField]: sortOrder === "asc" ? "asc" : "desc",
      },
    });

    // Check if result is empty and return an empty array if no data found
    if (result.length === 0) {
      return [];
    }

    return result;
  } catch (error) {
    console.error("Error fetching LuncBurn records:", error);
    throw new ApiError(500, "Failed to get LuncBurn record");
  }
};



export const LuncBurnServices = {
  createLuncBurnArchiveIntoDB,
  createLuncBurnIntoDB,
  updateLuncBurnIntoDB,
  deleteLuncBurnFromDB,
  getLuncBurnByMonthAndYear,
  getShibAndLuncBurnArchive,
  getAllLuncBurn,
};
