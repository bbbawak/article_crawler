// import { Router } from "express";
// import { fileUploader } from "../../../helpars/fileUploader";
// import { TopicControllers } from "./topic.controller";

// const router = Router();

// // create topic
// router.post(
//   "/create-topic",
//   fileUploader.upload.single("image"),
//   TopicControllers.createTopic
// );

// // get all topics
// router.get("/topics", TopicControllers.getAllTopics);
// // get topic by id
// router.get("/:topicId", TopicControllers.getTopicById);

// // get topic by author
// router.get("/author-topics/:authorId", TopicControllers.getTopicsByAuthor);

// // update topic
// router.patch(
//   "/update-topic",
//   fileUploader.upload.single("image"),
//   TopicControllers.updateTopic
// );

// // delete topic
// router.delete("/delete-topic/:topicId", TopicControllers.deleteTopic);

// export const topicRoutes = router;

import { Router } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { TopicControllers } from "./topic.controller";
import { verifyUser } from "../../middlewares/auth";

const router = Router();

// create topic
router.post(
  "/create-topic",
  verifyUser,
  fileUploader.upload.single("image"),
  TopicControllers.createTopic
);

// get all topics
router.get("/topics", TopicControllers.getAllTopics);
// get topic by id
router.get("/:topicId", TopicControllers.getTopicById);

// get topic by author
router.get("/author-topics/:authorId", TopicControllers.getTopicsByAuthor);

// update topic
router.patch(
  "/update-topic",
  verifyUser,
  fileUploader.upload.single("image"),
  TopicControllers.updateTopic
);

// delete topic
router.delete("/delete-topic/:topicId", TopicControllers.deleteTopic);

export const topicRoutes = router;
