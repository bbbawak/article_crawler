import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TopicServices } from "./topic.service";
import { UpdateTopicSchema } from "./topic.validation";

const createTopic = catchAsync(async (req, res) => {
  const image = req.file?.path || "";
  const payload = req.body;

  const newTopic = await TopicServices.createTopic(image, payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Topic created successfully",
    data: newTopic,
  });
});

const getAllTopics = catchAsync(async (req, res) => {
  const allTopics = await TopicServices.getAllTopics();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All topics retrieved successfully",
    data: allTopics,
  });
});

const getTopicById = catchAsync(async (req, res) => {
  const topicId = req.params.topicId;
  const topic = await TopicServices.getTopicById(topicId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "topic retrieved successfully",
    data: topic,
  });
});

const getTopicsByAuthor = catchAsync(async (req, res) => {
  const authorId = req.params.authorId;
  const topicsByAuthor = await TopicServices.getTopicsByAuthor(authorId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Topics retrieved by author successfully",
    data: topicsByAuthor,
  });
});

const updateTopic = catchAsync(async (req, res) => {
  const image = req.file?.path || "";
  const payload = UpdateTopicSchema.parse(req.body);
  const updateTopic = await TopicServices.updateTopic(payload, image);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Topic updated successfully",
    data: updateTopic,
  });
});

const deleteTopic = catchAsync(async (req, res) => {
  const topicId = req.params.topicId;
  const deleteTopic = await TopicServices.deleteTopic(topicId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Topic deleted successfully",
    data: {},
  });
});

export const TopicControllers = {
  createTopic,
  getAllTopics,
  getTopicById,
  getTopicsByAuthor,
  updateTopic,
  deleteTopic,
};
