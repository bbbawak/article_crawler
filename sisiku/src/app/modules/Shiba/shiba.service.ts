// import { PrismaClient, Shiba } from "@prisma/client";
// import ApiError from "../../../errors/ApiErrors";

// const prisma = new PrismaClient();

// const createShib = async (payload: Partial<Shiba>) => {
//   const newShib = await prisma.shiba.create({
//     data: {
//       visits: payload.visits || "0",
//       revenue: payload.revenue || "0",
//       burns: payload.burns || "0",
//     },
//   });

//   if (!newShib) {
//     throw new ApiError(500, "Failed to create Shiba record");
//   }

//   return newShib;
// };

// const updateShib = async (payload: Partial<Shiba>) => {
//   if (!payload.id) {
//     throw new ApiError(400, "Shiba ID is required for updating");
//   }

//   const existingShib = await prisma.shiba.findUnique({
//     where: { id: payload.id },
//   });
//   if (!existingShib) {
//     throw new ApiError(404, "Shiba record not found");
//   }

//   const updatedShib = await prisma.shiba.update({
//     where: { id: payload.id },
//     data: {
//       visits: payload.visits ?? existingShib.visits,
//       revenue: payload.revenue ?? existingShib.revenue,
//       burns: payload.burns ?? existingShib.burns,
//     },
//   });

//   if (!updatedShib) {
//     throw new ApiError(500, "Failed to update Shiba record");
//   }

//   return updatedShib;
// };

// const getShibInformation = async () => {
//   const shib = await prisma.shiba.findUnique({
//     where: { id: "67387bd644be92e6a601fd33" },
//   });
//   if (!shib) {
//     throw new ApiError(404, "Shiba record not found");
//   }
//   return shib;
// };

// export const ShibServices = {
//   createShib,
//   updateShib,
//   getShibInformation
// };



import { PrismaClient, Shiba } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";

const prisma = new PrismaClient();

const createShib = async (payload: Partial<Shiba>) => {
  const newShib = await prisma.shiba.create({
    data: {
      visits: payload.visits || "0",
      revenue: payload.revenue || "0",
      burns: payload.burns || "0",
      visits7Day: payload.visits7Day || "0", // Initialize 7-day manually
      revenue7Day: payload.revenue7Day || "0",
      burns7Day: payload.burns7Day || "0",
      visits30Day: payload.visits30Day || "0", // Initialize 30-day manually
      revenue30Day: payload.revenue30Day || "0",
      burns30Day: payload.burns30Day || "0",
    },
  });

  if (!newShib) {
    throw new ApiError(500, "Failed to create Shiba record");
  }

  return newShib;
};

const updateShib = async (payload: Partial<Shiba>) => {
  if (!payload.id) {
    throw new ApiError(400, "Shiba ID is required for updating");
  }

  const existingShib = await prisma.shiba.findUnique({
    where: { id: payload.id },
  });

  if (!existingShib) {
    throw new ApiError(404, "Shiba record not found");
  }

  const updatedShib = await prisma.shiba.update({
    where: { id: payload.id },
    data: {
      visits: payload.visits ?? existingShib.visits,
      revenue: payload.revenue ?? existingShib.revenue,
      burns: payload.burns ?? existingShib.burns,
      visits7Day: payload.visits7Day ?? existingShib.visits7Day, // Update manually
      revenue7Day: payload.revenue7Day ?? existingShib.revenue7Day,
      burns7Day: payload.burns7Day ?? existingShib.burns7Day,
      visits30Day: payload.visits30Day ?? existingShib.visits30Day, // Update manually
      revenue30Day: payload.revenue30Day ?? existingShib.revenue30Day,
      burns30Day: payload.burns30Day ?? existingShib.burns30Day,
    },
  });

  if (!updatedShib) {
    throw new ApiError(500, "Failed to update Shiba record");
  }

  return updatedShib;
};

const getShibInformation = async () => {
  const shib = await prisma.shiba.findUnique({
    where: { id: "674171abb13d20efff68527e" },
  });


  if (!shib) {
    throw new ApiError(404, "Shiba record not found");
  }

  return shib;
};

export const ShibServices = {
  createShib,
  updateShib,
  getShibInformation,
};
