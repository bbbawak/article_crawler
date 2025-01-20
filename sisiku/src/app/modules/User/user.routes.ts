import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../../helpars/fileUploader";
// import { verifyUser } from "../../middlewares/auth";

const router = Router();

// create user
router.post("/create-user", UserController.createUser);
// login user
router.post("/login", UserController.loginUser);
router.post("/verify-otp", UserController.verityOtp);
// refresh accessToken with refresh token
router.post("/access-token", UserController.refreshAccessToken);
// logout user
router.get(
  "/logout",
  //  verifyUser,
  UserController.logoutUser
);
// get single user by email
router.post("/get-user", UserController.getUserByEmail);
// get single user by id
router.get("/singleUser/:userId", UserController.getUserById);
// get all users
router.get("/all-users", UserController.getAllUsers);
// router.get("/recommended-users", UserController.recommendedUser);
// update user
router.patch(
  "/update-user/:email",
  // fileUploader.upload.single("profileImage"),
  fileUploader.upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  UserController.updateUser
);
// delete user
router.patch("/delete-user/:email", UserController.deleteUser);
// follow user
router.patch("/follow-user", UserController.toggleFollow);
// get all notifications by userId
router.get("/notifications/:userId", UserController.getNotificationByUserId);
// toggle recommend user
router.patch(
  "/toggle-recommend",
  UserController.toggleVerifyAndRecommendedUser
);
// toggle block user
router.patch("/toggle-blocked", UserController.toggleDeleteUser);
// get all verified user
router.get("/verified-users", UserController.getAllVerifiedUsers);
router.get("/recommended-users", UserController.getAllRecommendedUsers);
router.get("/blocked-users", UserController.getAllBlockedUsers);
router.post("/forgot-password", UserController.forgotPassword);
router.patch("/new-password", UserController.setNewPassword);

export const userRoutes = router;
