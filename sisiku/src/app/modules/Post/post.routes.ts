
import { Router } from "express";
import { PostControllers } from "./post.controller";
import { fileUploader } from "../../../helpars/fileUploader";
import { verifyUser } from "../../middlewares/auth";

const router = Router();

// create post
router.post(
  "/create-post",
  verifyUser,
  fileUploader.upload.fields([
    { name: "image", maxCount: 1 }, 
    { name: "video", maxCount: 1 }, 
  ]),
  PostControllers.createPost
);

// get all posts
router.get("/all-post", PostControllers.getAllPost);

// get all image post
router.get("/image-post", PostControllers.getAllImagePost);

//get all video post
router.get("/video-post", PostControllers.getAllVideoPost);

// all posts by topic id
router.get("/all-posts/:topicId", PostControllers.getAllPostsByTopicId);

// update post
router.patch(
  "/update-post",
  // verifyUser,
  fileUploader.upload.single("image"),
  PostControllers.updatePost
);

// delete post
router.delete("/delete-post/:postId", PostControllers.deletePost);

// add or remove like
router.patch("/add-remove-like", verifyUser,PostControllers.addOrRemoveLike);

// get post by id
router.get("/:id", PostControllers.getPostById);

// get post by author id
router.get("/author/:authorId", PostControllers.getPostByAuthorId);

export const postRoutes = router;
