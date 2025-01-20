// import { NextFunction, Request, Response } from "express";

// import { Secret } from "jsonwebtoken";
// import config from "../../config";

// import httpStatus from "http-status";
// import ApiError from "../../errors/ApiErrors";
// import { jwtHelpers } from "../../helpars/jwtHelpers";
// import prisma from "../../shared/prisma";

// const auth = (...roles: string[]) => {
//   return async (
//     req: Request & { user?: any },
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const token = req.headers.authorization;

//       if (!token) {
//         throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
//       }

//       const verifiedUser = jwtHelpers.verifyToken(
//         token,
//         config.jwt.jwt_secret as Secret
//       );

//       const user = await prisma.user.findUnique({
//         where: {
//           email: verifiedUser.email,
//         },
//       });

//       if (!user) {
//         throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
//       }

//       // const userStatus = user?.userStatus;

//       // if (userStatus === "BLOCKED") {
//       //   throw new ApiError(httpStatus.FORBIDDEN, "This user is blocked ! !");
//       // }

//       if (roles.length && !roles.includes(verifiedUser.role)) {
//         throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
//       }

//       req.user = verifiedUser;

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// export default auth;

import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import catchAsync from "../../shared/catchAsync";
import ApiError from "../../errors/ApiErrors";
import config from "../../config";
import prisma from "../../shared/prisma";

export const verifyUser = catchAsync(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken: JwtPayload | any = jwt.verify(
      token,
      config.jwt.jwt_secret as Secret
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id as string,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    const isBlocked = await prisma.user.findUnique({
      where: {
        id: user.id,
        isDeleted: true,
      },
    });
    if (isBlocked) {
      throw new ApiError(403, "User is blocked!");
    }

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
