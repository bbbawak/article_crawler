// import { Router } from "express";
// import { CommentControllers } from "./comment.controller";
// import { verifyUser } from "../../middlewares/auth";

// const router = Router();
// // create a new comment
// router.post("/create-comment", verifyUser, CommentControllers.createComment);
// // update the comment
// router.patch("/update-comment", verifyUser, CommentControllers.updateComment);
// // add or remove like on comment
// router.patch(
//   "/add-remove-like",
//   verifyUser,
//   CommentControllers.addOrRemoveLike
// );
// // add or remove dislike on comment
// router.patch(
//   "/add-remove-dislike",
//   verifyUser,
//   CommentControllers.addOrRemoveDislike
// );
// // delete the comment
// router.delete("/delete-comment", verifyUser, CommentControllers.deleteComment);

// export const commentRoutes = router;

import { Router } from "express";
import { CommentControllers } from "./comment.controller";
import { verifyUser } from "../../middlewares/auth";
// import { verifyUser } from "../../middlewares/auth";

const router = Router();
// create a new comment
router.post(
  "/create-comment",
  //  verifyUser,
  CommentControllers.createComment
);
// update the comment
router.patch("/update-comment", CommentControllers.updateComment);
// add or remove like on comment
router.patch(
  "/add-remove-like",

  CommentControllers.addOrRemoveLike
);
// add or remove dislike on comment
router.patch(
  "/add-remove-dislike",

  CommentControllers.addOrRemoveDislike
);
// delete the comment
router.delete(
  "/delete-comment",
  // verifyUser,
  CommentControllers.deleteComment
);

// add reply to the comment
router.post("/reply/:commentId", verifyUser, CommentControllers.replyOnComment);

export const commentRoutes = router;
