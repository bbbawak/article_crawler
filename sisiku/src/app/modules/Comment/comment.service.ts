import { Comment, NotificationType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { Socket } from "socket.io";
import { sendNotification } from "../../../helpars/socketIo";
import { Request } from "express";

// const createComment = async (payload: Partial<Comment>) => {
//   // Check for user validation
//   const isUserExist = await prisma.user.findUnique({
//     where: { id: payload.authorId },
//   });
//   if (!isUserExist) {
//     throw new ApiError(400, "User does not exist with this ID");
//   }
//   // Ensure either postId or articleId is provided, but not both
//   if (
//     (!payload.postId && !payload.articleId) ||
//     (payload.postId && payload.articleId)
//   ) {
//     throw new ApiError(
//       400,
//       "Provide either postId or articleId, but not both."
//     );
//   }

//   // Validate the referenced parent (Post or Article)
//   if (payload.postId) {
//     const isPostExist = await prisma.post.findUnique({
//       where: { id: payload.postId },
//     });
//     if (!isPostExist) {
//       throw new ApiError(400, "Post does not exist");
//     }
//   } else if (payload.articleId) {
//     const isArticleExist = await prisma.article.findUnique({
//       where: { id: payload.articleId },
//     });
//     if (!isArticleExist) {
//       throw new ApiError(400, "Article does not exist");
//     }
//   }

//   // Create the comment
//   const newComment = await prisma.comment.create({
//     data: {
//       content: payload.content as string,
//       authorId: payload.authorId as string,
//       postId: payload.postId || null,
//       articleId: payload.articleId || null,
//     },
//     include: {
//       author: true,
//     },
//   });

//   if (!newComment) {
//     throw new ApiError(500, "Error creating comment");
//   }

//   // Send notification
//   if (payload.postId) {
//     const post = await prisma.post.findUnique({
//       where: { id: payload.postId },
//     });
//     if (post && sendNotification) {
//       await sendNotification(
//         post.authorId,
//         isUserExist.id,
//         `${isUserExist.firstName} ${isUserExist.lastName} has commented on your post.`,
//         NotificationType.COMMENT
//       );
//     }
//   } else if (payload.articleId) {
//     const article = await prisma.article.findUnique({
//       where: { id: payload.articleId },
//     });
//     if (article && sendNotification) {
//       await sendNotification(
//         article.authorId,
//         isUserExist.id,
//         `${isUserExist.firstName} ${isUserExist.lastName} has commented on your article.`,
//         NotificationType.COMMENT
//       );
//     }
//   }

//   return newComment;
// };

const createComment = async (payload: Partial<Comment>) => {
  // Validate user existence
  const isUserExist = await prisma.user.findUnique({
    where: { id: payload.authorId },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }

  // Ensure either postId or articleId is provided, but not both
  if (
    (!payload.postId && !payload.articleId) ||
    (payload.postId && payload.articleId)
  ) {
    throw new ApiError(
      400,
      "Provide either postId or articleId, but not both."
    );
  }

  // Validate the referenced parent (Post or Article)
  let parent;
  if (payload.postId) {
    parent = await prisma.post.findUnique({
      where: { id: payload.postId },
    });
    if (!parent) {
      throw new ApiError(400, "Post does not exist");
    }
  } else if (payload.articleId) {
    parent = await prisma.article.findUnique({
      where: { id: payload.articleId },
    });
    if (!parent) {
      throw new ApiError(400, "Article does not exist");
    }
  }

  // Create the comment
  const newComment = await prisma.comment.create({
    data: {
      content: payload.content as string,
      authorId: payload.authorId as string,
      postId: payload.postId || null,
      articleId: payload.articleId || null,
    },
    include: {
      author: true,
    },
  });

  // Send notification
  if (payload.postId) {
    if (parent && sendNotification) {
      await sendNotification(
        parent.authorId,
        isUserExist.id,
        `${isUserExist.firstName} ${isUserExist.lastName} has commented on your post.`,
        NotificationType.COMMENT,
        parent?.id
      );
    }
  } else if (payload.articleId) {
    if (parent && sendNotification) {
      await sendNotification(
        parent.authorId,
        isUserExist.id,
        `${isUserExist.firstName} ${isUserExist.lastName} has commented on your article.`,
        NotificationType.COMMENT
      );
    }
  }

  return newComment;
};

const updateComment = async (payload: Partial<Comment>) => {
  // check for comment validation
  const isCommentExist = await prisma.comment.findUnique({
    where: { id: payload.id },
  });
  if (!isCommentExist) {
    throw new ApiError(404, "Comment not found");
  }
  const updatedComment = await prisma.comment.update({
    where: { id: payload.id },
    data: {
      content: payload.content,
    },
  });
  if (!updatedComment) {
    throw new ApiError(500, "Error updating comment");
  }
  return updatedComment;
};
// delete comment
const deleteComment = async (payload: Partial<Comment>) => {
  // check for user validation
  const isUserExist = await prisma.comment.findFirst({
    where: {
      authorId: payload.authorId,
    },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }
  // check for comment validation
  const isCommentExist = await prisma.comment.findUnique({
    where: { id: payload.id },
  });
  if (!isCommentExist) {
    throw new ApiError(404, "Comment not found");
  }
  const deletedComment = await prisma.comment.delete({
    where: { id: payload.id },
  });
  if (!deletedComment) {
    throw new ApiError(500, "Error deleting comment");
  }
  return true;
};

// add or remove like
const addOrRemoveLike = async (payload: Partial<Comment>) => {
  // check for user validation
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.authorId,
    },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }
  // check for comment validation
  const comment = await prisma.comment.findUnique({
    where: { id: payload.id },
  });
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  // increase comment like
  if (!comment.likers.includes(payload.authorId as string)) {
    const updatedComment = await prisma.comment.update({
      where: {
        id: payload.id,
      },
      data: {
        likers: {
          push: payload.authorId,
        },
        likeCount: {
          increment: 1,
        },
      },
    });
    if (!updatedComment) {
      throw new ApiError(500, "Error updating comment");
    }
    return updatedComment;
  }
  // decrease comment like
  if (comment.likers.includes(payload.authorId as string)) {
    const updatedComment = await prisma.comment.update({
      where: {
        id: payload.id,
      },
      data: {
        likers: comment.likers.filter(
          (likerId) => likerId !== payload.authorId
        ),
        likeCount: {
          decrement: 1,
        },
      },
    });
    if (!updatedComment) {
      throw new ApiError(500, "Error updating comment");
    }
    return updatedComment;
  }
};

// add or remove dislike
const addOrRemoveDisike = async (payload: Partial<Comment>) => {
  // check for user validation
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.authorId,
    },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }
  // check for comment validation
  const comment = await prisma.comment.findUnique({
    where: { id: payload.id },
  });
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  // increase comment like
  if (!comment.dislikers.includes(payload.authorId as string)) {
    const updatedComment = await prisma.comment.update({
      where: {
        id: payload.id,
      },
      data: {
        dislikers: {
          push: payload.authorId,
        },
        dislikeCount: {
          increment: 1,
        },
      },
    });
    if (!updatedComment) {
      throw new ApiError(500, "Error updating comment");
    }
    return updatedComment;
  }
  // decrease comment like
  if (comment.dislikers.includes(payload.authorId as string)) {
    const updatedComment = await prisma.comment.update({
      where: {
        id: payload.id,
      },
      data: {
        dislikers: comment.dislikers.filter(
          (dislikerId) => dislikerId !== payload.authorId
        ),
        dislikeCount: {
          decrement: 1,
        },
      },
    });
    if (!updatedComment) {
      throw new ApiError(500, "Error updating comment");
    }
    return updatedComment;
  }
};

//reply on comment
const replyOnComment = async (req: Request) => {
  //user id
  const user: any = req.user;
  const userId = user.id;
  //comment id
  const commentId = req.params.commentId;
  const payload = req.body;
  // check for user validation
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!isUserExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }
  // check for comment validation
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  //create reply to a comment
  const newComment = await prisma.comment.create({
    data: {
      content: payload.content as string,
      authorId: userId,
      postId: comment.postId || null,
      articleId: comment.articleId || null,
      replyToId: commentId,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });
  return newComment;
};

export const CommentServices = {
  createComment,
  updateComment,
  deleteComment,
  addOrRemoveLike,
  addOrRemoveDisike,
  replyOnComment,
};
