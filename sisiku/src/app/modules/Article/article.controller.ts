import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ArticleServices } from "./artickle.service";
import {
  addOrRemoveLikeSchema,
  CreateArticleSchema,
  UpdateArticleSchema,
} from "./article.validation";

const createArticle = catchAsync(async (req: Request, res: Response) => {
  const payload = CreateArticleSchema.parse(req.body);
  const imageUrl = req.file?.path || "";

  const newArticle = await ArticleServices.createArticle(imageUrl, payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "article created successfully",
    data: newArticle,
  });
});

const getAllArticle = catchAsync(async (req: Request, res: Response) => {
  const options = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  };

  const result = await ArticleServices.getAllArticle(options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Articles fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateArticle = catchAsync(async (req: Request, res: Response) => {
  const payload = UpdateArticleSchema.parse(req.body);
  const postImage = req.file?.path || "";
  const updatePost = await ArticleServices.updateArticle(payload, postImage);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post updated successfully",
    data: updatePost,
  });
});

const deleteArticle = catchAsync(async (req, res) => {
  const articleId = req.params.articleId;
  const deletedArticle = await ArticleServices.deleteArticle(articleId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "article deleted successfully",
    data: {},
  });
});

const addOrRemoveLike = catchAsync(async (req, res) => {
  const payload = addOrRemoveLikeSchema.parse(req.body);
  const addOrRemoveLike = await ArticleServices.addOrRemoveLike(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post updated successfully.",
    data: addOrRemoveLike,
  });
});

// get single post by postId

const getSingleArticle = catchAsync(async (req, res) => {
  const articleId = req.params.articleId;
  const article = await ArticleServices.getSingleArticle(articleId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "article fetched successfully",
    data: article,
  });
});

export const articleControllers = {
  createArticle,
  getAllArticle,
  // updatePost,
  // deletePost,
  addOrRemoveLike,
  getSingleArticle,
  updateArticle,
  deleteArticle
};
