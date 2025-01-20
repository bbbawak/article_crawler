// import { PrismaClient, Lunc } from "@prisma/client";
// import ApiError from "../../../errors/ApiErrors";

// const prisma = new PrismaClient();

// const createLunc = async (payload: Partial<Lunc>) => {
//   const newLunc = await prisma.lunc.create({
//     data: {
//       visits: payload.visits || "0",
//       revenue: payload.revenue || "0",
//       burns: payload.burns || "0",
//     },
//   });

//   if (!newLunc) {
//     throw new ApiError(500, "Failed to create Lunc record");
//   }

//   return newLunc;
// };

// const updateLunc = async (payload: Partial<Lunc>) => {
//   if (!payload.id) {
//     throw new ApiError(400, "Lunc ID is required for updating");
//   }

//   const existingLunc = await prisma.lunc.findUnique({
//     where: { id: payload.id },
//   });

//   if (!existingLunc) {
//     throw new ApiError(404, "Lunc record not found");
//   }

//   const updatedLunc = await prisma.lunc.update({
//     where: { id: payload.id },
//     data: {
//       visits: payload.visits ?? existingLunc.visits,
//       revenue: payload.revenue ?? existingLunc.revenue,
//       burns: payload.burns ?? existingLunc.burns,
//     },
//   });

//   if (!updatedLunc) {
//     throw new ApiError(500, "Failed to update Lunc record");
//   }

//   return updatedLunc;
// };

// const getLuncInformation = async () => {
//   const lunc = await prisma.lunc.findUnique({
//     where: { id: "67387c1944be92e6a601fd35" },
//   });
//   if (!lunc) {
//     throw new ApiError(404, "Shiba record not found");
//   }
//   return lunc;
// };

// export const LuncServices = {
//   createLunc,
//   updateLunc,
//   getLuncInformation,
// };










import { PrismaClient, Lunc } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";

const prisma = new PrismaClient();

const createLunc = async (payload: Partial<Lunc>) => {
  const newLunc = await prisma.lunc.create({
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

  if (!newLunc) {
    throw new ApiError(500, "Failed to create Lunc record");
  }

  return newLunc;
};

const updateLunc = async (payload: Partial<Lunc>) => {
  if (!payload.id) {
    throw new ApiError(400, "Lunc ID is required for updating");
  }

  const existingLunc = await prisma.lunc.findUnique({
    where: { id: payload.id },
  });

  if (!existingLunc) {
    throw new ApiError(404, "Lunc record not found");
  }

  const updatedLunc = await prisma.lunc.update({
    where: { id: payload.id },
    data: {
      visits: payload.visits ?? existingLunc.visits,
      revenue: payload.revenue ?? existingLunc.revenue,
      burns: payload.burns ?? existingLunc.burns,
      visits7Day: payload.visits7Day ?? existingLunc.visits7Day, // Update manually
      revenue7Day: payload.revenue7Day ?? existingLunc.revenue7Day,
      burns7Day: payload.burns7Day ?? existingLunc.burns7Day,
      visits30Day: payload.visits30Day ?? existingLunc.visits30Day, // Update manually
      revenue30Day: payload.revenue30Day ?? existingLunc.revenue30Day,
      burns30Day: payload.burns30Day ?? existingLunc.burns30Day,
    },
  });

  if (!updatedLunc) {
    throw new ApiError(500, "Failed to update Lunc record");
  }

  return updatedLunc;
};

const getLuncInformation = async () => {
  const lunc = await prisma.lunc.findUnique({
    where: { id: "6741740ab13d20efff68527f" },
  });

  if (!lunc) {
    throw new ApiError(404, "Lunc record not found");
  }

  return lunc;
};

export const LuncServices = {
  createLunc,
  updateLunc,
  getLuncInformation,
};
