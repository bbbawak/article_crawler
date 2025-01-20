import { Topic, User } from "@prisma/client";

export interface IPost {
  id: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  authorId: string;
  author: User;
  image?: string;
  likers?: string[];
  comments?: Comment[];
  topicId?: string;
  topic?: Topic;
}

export default IPost;
