import { NotificationType, Role, User } from "@prisma/client";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import IUser from "./user.interface";
import path from "path";
import { fileUploader } from "../../../utils/uploadFileOnDigitalOcean";

import { sendNotification } from "../../../helpars/socketIo";
import emailSender from "../../../helpars/emailSender";

// Assuming your server instance is available for passing to socketIo functio

// create user
const createUser = async (payload: Partial<IUser>) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (existingUser) {
    throw new ApiError(400, "User already exists with this email address");
  }
  const userRole = (payload.role as Partial<Role>) || Role.USER;
  const hashedPassword: string = await bcrypt.hash(
    payload.password as string,
    12
  );
  const user = await prisma.user.create({
    data: {
      firstName: payload.firstName as string,
      lastName: payload.lastName || "",
      email: payload.email as string,
      password: hashedPassword,
      role: userRole,
      profileImage: payload.profileImage ?? "",
      isDeleted: false,
      refreshToken: "",
      verified: false,
      otp: null,
      otpExpiry: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
      verified: true,
    },
  });
  return user;
};

// login user
const loginUser = async (payload: Partial<IUser>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }
  const isBlocked = await prisma.user.findUnique({
    where: {
      email: payload.email,
      isDeleted: true,
    },
  });
  if (isBlocked) {
    throw new ApiError(403, "User is blocked!");
  }

  if (!payload.password) {
    throw new ApiError(400, "Password is required");
  }
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // if user is not verified
  if (!user.verified) {
    // User is not verified, send OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Send OTP via email
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
        </div>
        <div style="padding: 20px 12px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${randomOtp}</p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    await emailSender("OTP Verification", user.email, html);

    // Store OTP and expiry in database
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: randomOtp, otpExpiry },
    });

    throw new ApiError(
      400,
      "User not verified. Please check your email for OTP verification."
    );
  }

  // get access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  // get refresh token
  const refreshToken = jwtHelpers.generateToken(
    {
      id: user.id,
    },
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );
  // update db with access token
  const loggedInUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      role: true,
      coverImage: true,
      followers: true,
      following: true,
      createdAt: true,
      updatedAt: true,
      verified: true,
    },
    data: {
      refreshToken: refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
    loggedInUser,
  };
};

// verify otp
const verifyOtp = async (payload: { otp: string; email: string }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otp !== payload.otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  // OTP is correct and valid, mark user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, otp: null, otpExpiry: null },
  });

  // Generate tokens after OTP verification
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user.id,
    },
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );

  const loggedInUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      role: true,
      coverImage: true,
      followers: true,
      following: true,
      createdAt: true,
      updatedAt: true,
      verified: true,
    },
    data: {
      refreshToken: refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
    loggedInUser,
  };
};

// forgot password
const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Generate new password
  if (user) {
    // User is not verified, send OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Send OTP via email
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
        </div>
        <div style="padding: 20px 12px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for Forget your password is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${randomOtp}</p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    await emailSender("OTP Verification", user.email, html);

    // Store OTP and expiry in database
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: randomOtp, otpExpiry },
    });
  }
  return { message: "OTP sent successfully" };
};

// const setNewPassword\
const setNewPassword = async (payload: Partial<User>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.otp !== payload.otp) {
    throw new ApiError(400, "Invalid OTP");
  }
  if (user.otpExpiry && new Date() > user.otpExpiry) {
    throw new ApiError(400, "OTP has expired");
  }
  // Hash new password
    const hashedPassword: string = await bcrypt.hash(
      payload.password as string,
      12
    );
  // Update user with new password and remove OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    },
  });
  return { message: "Password updated successfully" };
};

// refresh access token
const refreshAccessToken = async (refreshToken: string) => {
  const decodedToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_token_secret as string
  );
  if (!decodedToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.id,
    },
  });
  // check for user
  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }
  // check for refresh token validation
  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh Token has expired or used!");
  }
  // generate new access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  return accessToken;
};

// logout user
const logoutUser = async (id: string) => {
  const user = prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }
  prisma.user.update({
    where: {
      id,
    },
    data: {
      refreshToken: null,
    },
  });
  return true;
};

// get user by email
const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
// get user by id
const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
      createdAt: true,
      updatedAt: true,
      recommended: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
// get all user
const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
  });
  return users;
};

// all Recommended users
const getAllRecommendedUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      recommended: true,
      isDeleted: false,
      // verified: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
  });
  return users;
};

const getAllVerifiedUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      recommended: false,
      verified: true,
      isDeleted: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
  });
  return users;
};

const getAllBlockedUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: true,
      // verified: true,
      // recommended: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
  });
  return users;
};

const toggleVerifyAndRecommendedUser = async (payload: Partial<User>) => {
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isRecommendedUser = user.recommended;
  const updatedUsr = await prisma.user.update({
    where: { id: payload.id },
    data: {
      recommended: !isRecommendedUser,
    },
  });
};

const toggleDeleteUser = async (payload: Partial<User>) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isDeleted = user.isDeleted;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isDeleted: !isDeleted,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,

      coverImage: true,
      role: true,
    },
  });
  return updatedUser;
};

const deleteUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //   check if user has been deleted already
  if (user.isDeleted) {
    throw new ApiError(400, "User has already been deleted");
  }
  const deletedUser = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      isDeleted: true,
    },
  });
  return deletedUser;
};

// update user
const updateUser = async (
  email: string,
  payload: Partial<IUser>,
  profileImageLocalPath: string | undefined,
  coverImageLocalPath: string | undefined
) => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // upload profile image
  // upload image
  let profileImageUrl = "";
  // Upload image to DigitalOcean Spaces and get the cloud URL
  if (profileImageLocalPath) {
    try {
      const uploadResponse = await fileUploader.uploadToDigitalOcean({
        path: profileImageLocalPath,
        originalname: path.basename(profileImageLocalPath),
        mimetype: "image/jpeg", // Adjust this if needed (e.g., dynamically detect the type)
      } as Express.Multer.File);
      profileImageUrl = uploadResponse.Location; // Cloud URL returned from DigitalOcean
    } catch (error) {
      console.error("Failed to upload image to DigitalOcean:", error);
      throw new ApiError(500, "Failed to upload image to DigitalOcean");
    }
  }

  // upload profile image
  // upload image
  let coverImageUrl = "";
  // Upload image to DigitalOcean Spaces and get the cloud URL
  if (coverImageLocalPath) {
    try {
      const uploadResponse = await fileUploader.uploadToDigitalOcean({
        path: coverImageLocalPath,
        originalname: path.basename(coverImageLocalPath),
        mimetype: "image/jpeg", // Adjust this if needed (e.g., dynamically detect the type)
      } as Express.Multer.File);
      coverImageUrl = uploadResponse.Location; // Cloud URL returned from DigitalOcean
    } catch (error) {
      console.error("Failed to upload image to DigitalOcean:", error);
      throw new ApiError(500, "Failed to upload image to DigitalOcean");
    }
  }

  // Update the user
  const updatedUser = await prisma.user.update({
    where: { email: email },
    data: {
      firstName: payload?.firstName || undefined,
      lastName: payload.lastName || undefined,
      profileImage: profileImageUrl || undefined,
      coverImage: coverImageUrl || undefined,
    },
  });

  return updatedUser;
};

// delete user

const toggleFollow = async (payload: {
  followerId: string;
  followedId: string;
}) => {
  const { followerId, followedId } = payload;
  // Check for required fields
  if (!followerId || !followedId) {
    throw new ApiError(400, "FollowerId and FollowedId are required!");
  }

  // Prevent user from following themselves
  if (followerId === followedId) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  // Check if the follower exists
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
  });
  if (!follower) {
    throw new Error("Follower does not exist");
  }

  // Check if the followed user exists
  const followed = await prisma.user.findUnique({
    where: { id: followedId },
  });

  if (!followed) {
    throw new Error("User to be followed or unfollowed does not exist");
  }

  const isFollowing = follower.following.includes(followedId);

  if (isFollowing) {
    // If currently following, unfollow the user
    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: follower.following.filter((id) => id !== followedId),
      },
    });

    await prisma.user.update({
      where: { id: followedId },
      data: {
        followers: followed.followers.filter((id) => id !== followerId),
      },
    });

    if (sendNotification) {
      await sendNotification(
        followedId,
        followerId,
        `${follower.firstName + " " + follower.lastName} has unfollow you`,
        NotificationType.FOLLOW
      );
    } else {
      console.error("sendNotification is not available.");
    }

    return { message: "Successfully unfollowed the user." };
  } else {
    // If not following, follow the user
    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          push: followedId,
        },
      },
    });

    await prisma.user.update({
      where: { id: followedId },
      data: {
        followers: {
          push: followerId,
        },
      },
    });

    if (sendNotification) {
      await sendNotification(
        followedId,
        followerId,
        `${follower.firstName + " " + follower.lastName} has following you`,
        NotificationType.FOLLOW
      );
    } else {
      console.error("sendNotification is not available.");
    }

    return { message: "Successfully followed the user." };
  }
};

// const toggleFollow = async (
//   payload: { followerId: string; followedId: string },
//   socket: Socket
// ) => {
//   const { followerId, followedId } = payload;

//   // Follow or unfollow logic (simplified here)
//   const isFollowing = await prisma.user.findUnique({
//     where: { id: followerId },
//     select: { following: true },
//   });

//   if (isFollowing?.following.includes(followedId)) {
//     // Unfollow logic...
//   } else {
//     // Follow logic
//     await prisma.user.update({
//       where: { id: followerId },
//       data: {
//         following: { push: followedId },
//       },
//     });

//     await prisma.user.update({
//       where: { id: followedId },
//       data: {
//         followers: { push: followerId },
//       },
//     });

//     // Emit notification
//     socket.data.sendNotification(
//       followedId,
//       followerId,
//       "Someone followed you.",
//       "FOLLOW"
//     );
//   }

//   return { message: isFollowing ? "Unfollowed" : "Followed" };
// };

// recommended user
const recommendedUser = async () => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      isDeleted: true,
      posts: {
        include: {
          comments: true,
        },
      },
      coverImage: true,
      role: true,
      followers: true,
      following: true,
      comments: true,
    },
    orderBy: {
      followers: "desc",
    },
  });
  return users;
};

const getNotificationByUserId = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!notifications.length) {
    throw new ApiError(404, "No notifications found for the given user");
  }
  return notifications;
};

export const UserService = {
  createUser,
  loginUser,
  logoutUser,
  getUserByEmail,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUser,
  toggleFollow,
  refreshAccessToken,
  recommendedUser,
  getNotificationByUserId,
  verifyOtp,
  toggleVerifyAndRecommendedUser,
  toggleDeleteUser,
  getAllBlockedUsers,
  getAllRecommendedUsers,
  getAllVerifiedUsers,
  setNewPassword,
  forgotPassword,
};
