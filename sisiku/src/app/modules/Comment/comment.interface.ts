import { User } from "@prisma/client";
import { Post } from "@prisma/client";

export interface IComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  postId: string;
  post: Post;
  likers: string[];
  likeCount: number;
  dislikeCount: number;
}

export enum ReactionType {
  ADD_LIKE = "add-like",
  REMOVE_LIKE = "remove-like",
  ADD_DISLIKE = "add-dislike",
  REMOVE_DISLIKE = "remove-dislike",
}

export default IComment;
