import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CommentServices } from "./comment.service";
import {
  addOrRemoveLikeSchema,
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "./comment.validation";

const createComment = catchAsync(async (req, res) => {
  const payload = createCommentSchema.parse(req.body);
  const newComment = await CommentServices.createComment(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment created successfully",
    data: newComment,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const payload = updateCommentSchema.parse(req.body);
  const updatedComment = await CommentServices.updateComment(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully",
    data: updatedComment,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const payload = deleteCommentSchema.parse(req.body);
  const deletedComment = await CommentServices.deleteComment(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment deleted successfully",
    data: {},
  });
});

const addOrRemoveLike = catchAsync(async (req, res) => {
  const payload = addOrRemoveLikeSchema.parse(req.body);
  const addOrRemoveLike = await CommentServices.addOrRemoveLike(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully.",
    data: addOrRemoveLike,
  });
});

const addOrRemoveDislike = catchAsync(async (req, res) => {
  const payload = addOrRemoveLikeSchema.parse(req.body);
  const addOrRemoveLike = await CommentServices.addOrRemoveDisike(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully.",
    data: addOrRemoveLike,
  });
});

const replyOnComment = catchAsync(async (req, res) => {
  const addOrRemoveLike = await CommentServices.replyOnComment(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully.",
    data: addOrRemoveLike,
  });
});

export const CommentControllers = {
  createComment,
  updateComment,
  deleteComment,
  addOrRemoveLike,
  addOrRemoveDislike,
  replyOnComment
};
