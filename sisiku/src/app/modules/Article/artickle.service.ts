import { Article, Post } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../utils/uploadFileOnDigitalOcean";
import path from "path";
import { paginationHelpers } from "../../../helpars/paginationHelper";

const createArticle = async (
  articleImage: string,
  payload: Partial<Article>
) => {
  let imageUrl = "";
  // Upload image to DigitalOcean Spaces and get the cloud URL
  if (articleImage) {
    try {
      const uploadResponse = await fileUploader.uploadToDigitalOcean({
        path: articleImage,
        originalname: path.basename(articleImage),
        mimetype: "image/jpeg", // Adjust this if needed (e.g., dynamically detect the type)
      } as Express.Multer.File);
      imageUrl = uploadResponse.Location; // Cloud URL returned from DigitalOcean
    } catch (error) {
      console.error("Failed to upload image to DigitalOcean:", error);
      throw new ApiError(500, "Failed to upload image to DigitalOcean");
    }
  }

  const newArticle = await prisma.article.create({
    data: {
      content: payload.content as string,
      title: payload.title as string,
      authorId: payload.authorId as string,
      image: imageUrl,
    },
    include: {
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!newArticle) {
    throw new ApiError(500, "Failed to create article");
  }
  return newArticle;
};

const getAllArticle = async (options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const articles = await prisma.article.findMany({
    include: {
      comments: {
        include: {
          author: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  const total = await prisma.article.count();

  if (!articles) {
    throw new ApiError(500, "Failed to fetch articles");
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: articles,
  };
};


const updateArticle = async (
  payload: Partial<Article>,
  articleImage: string
) => {
  const isArticleExist = await prisma.article.findUnique({
    where: { id: payload.id },
  });
  // if post not exist
  if (!isArticleExist) {
    throw new ApiError(404, "Article not found");
  }
  // upload image
  let imageUrl = "";
  // Upload image to DigitalOcean Spaces and get the cloud URL
  if (articleImage) {
    try {
      const uploadResponse = await fileUploader.uploadToDigitalOcean({
        path: articleImage,
        originalname: path.basename(articleImage),
        mimetype: "image/jpeg", // Adjust this if needed (e.g., dynamically detect the type)
      } as Express.Multer.File);
      imageUrl = uploadResponse.Location; // Cloud URL returned from DigitalOcean
    } catch (error) {
      console.error("Failed to upload image to DigitalOcean:", error);
      throw new ApiError(500, "Failed to upload image to DigitalOcean");
    }
  }
  const updatedArticle = await prisma.article.update({
    where: { id: payload.id },
    data: {
      title: payload.title || undefined,
      content: payload.content || undefined,
      image: imageUrl || undefined,
    },
  });

  if (!updatedArticle) {
    throw new ApiError(500, "Failed to update post");
  }
  return updatedArticle;
};

const deleteArticle = async (articleId: string) => {
  const isArticleExist = await prisma.article.findUnique({ where: { id: articleId } });
  if (!isArticleExist) {
    throw new ApiError(400, "article does not exist with this id!");
  }
  // check if any comment in this comment
  const hasComment = await prisma.comment.findFirst({
    where: {
      postId: articleId,
    },
  });
  // delete the comment
  if (hasComment) {
    prisma.comment.delete({
      where: {
        id: hasComment.id,
      },
    });
  }
  const deletedArticle = await prisma.article.delete({ where: { id: articleId } });
  if (!deletedArticle) {
    throw new ApiError(500, "Failed to delete post!");
  }
  return true;
};

const addOrRemoveLike = async (payload: Partial<Post>) => {
  // check for user validation
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.authorId,
    },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }
  // check for post validation
  const article = await prisma.article.findUnique({
    where: { id: payload.id },
  });
  if (!article) {
    throw new ApiError(404, "article not found");
  }
  // define userid and is liked already or not
  const userId = payload.authorId as string;
  const isLiked = article.likers.includes(userId);

  // Update post like status
  const updatedArticle = await prisma.article.update({
    where: { id: payload.id },
    data: {
      likers: isLiked
        ? { set: article.likers.filter((likerId) => likerId !== userId) }
        : { push: userId },
      likeCount: isLiked ? article.likeCount - 1 : article.likeCount + 1,
    },
  });

  if (!updatedArticle) {
    throw new ApiError(500, "Error while updating article");
  }

  return updatedArticle;
};

const getSingleArticle = async (articleId: string) => {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!article) {
    throw new ApiError(404, "article not found");
  }
  return article;
};

export const ArticleServices = {
  createArticle,
  getAllArticle,
  addOrRemoveLike,
  getSingleArticle,
  updateArticle,
  deleteArticle
};
