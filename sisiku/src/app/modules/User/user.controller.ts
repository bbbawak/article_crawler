import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";
import { userValidation } from "./user.validation";

const createUser = catchAsync(async (req, res) => {
  // zod validation
  const payload = userValidation.createUserSchema.parse(req.body);
  const result = await UserService.createUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully!",
    data: result,
  });
});

const getUserByEmail = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await UserService.getUserByEmail(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found by email!",
    data: result,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await UserService.getUserById(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found by email!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users fetched successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const payload = req.body;

  // typescript type check
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  const profileImageLocalPath = files?.profileImage?.[0]?.path;
  const coverImageLocalPath = files?.coverImage?.[0]?.path;

  const result = await UserService.updateUser(
    email,
    payload,
    profileImageLocalPath,
    coverImageLocalPath
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserService.deleteUser(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: {},
  });
});

const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const { refreshToken, accessToken, loggedInUser } =
    await UserService.loginUser(payload);
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.cookie("accessToken", accessToken, options).status(200).json({
    success: true,
    message: "user loged in successfully",
    token: { accessToken, refreshToken },
    data: loggedInUser,
  });
});

const verityOtp = catchAsync(async (req, res) => {
  const payload = req.body;
  const { refreshToken, accessToken, loggedInUser } =
    await UserService.verifyOtp(payload);
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.cookie("refreshToken", refreshToken, options).status(200).json({
    success: true,
    message: "user loged in successfully",
    token: { accessToken },
    data: loggedInUser,
  });
});

const refreshAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const accessToken = await UserService.refreshAccessToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: { accessToken },
  });
});

const logoutUser = catchAsync(async (req, res) => {
  const user = req.user;
  const loggedOutUer = await UserService.logoutUser(user.id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.clearCookie("accessToken", options).status(200).json({
    success: true,
    message: "User logged out successfully",
    data: {},
  });
});

const toggleFollow = catchAsync(async (req, res) => {
  const payload = req.body;
  const follower = UserService.toggleFollow(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User followed successfully!",
    data: follower,
  });
});

// const recommendedUser = catchAsync(async (req, res) => {
//   const result = await UserService.getAllUsers();
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "All users fetched successfully!",
//     data: result,
//   });
// });

const getNotificationByUserId = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const notifications = await UserService.getNotificationByUserId(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications fetched successfully!",
    data: notifications,
  });
});

const toggleVerifyAndRecommendedUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const toggleUserStatus = await UserService.toggleVerifyAndRecommendedUser(
    payload
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Update user Status.",
    data: toggleUserStatus,
  });
});

const toggleDeleteUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const toggleUserStatus = await UserService.toggleDeleteUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Update user Status.",
    data: toggleUserStatus,
  });
});

const getAllVerifiedUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllVerifiedUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Verified users fetched successfully!",
    data: result,
  });
});

const getAllBlockedUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllBlockedUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Blocked users fetched successfully!",
    data: result,
  });
});

const getAllRecommendedUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllRecommendedUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Recommended users fetched successfully!",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const sendOtp = await UserService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Otp sent successfully",
    data: sendOtp,
  });
});

const setNewPassword = catchAsync(async (req, res) => {
  const payload = req.body;
  const sendOtp = await UserService.setNewPassword(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Otp sent successfully",
    data: sendOtp,
  });
});

export const UserController = {
  createUser,
  loginUser,
  logoutUser,
  getUserByEmail,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  toggleFollow,
  refreshAccessToken,
  // recommendedUser,
  getNotificationByUserId,
  verityOtp,
  toggleVerifyAndRecommendedUser,
  toggleDeleteUser,
  getAllBlockedUsers,
  getAllRecommendedUsers,
  getAllVerifiedUsers,
  forgotPassword,
  setNewPassword,
};
