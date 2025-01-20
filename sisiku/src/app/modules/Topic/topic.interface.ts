import { ObjectId } from "mongodb";

interface ITopic {
  id: string;
  title: string;
  description?: string;
  image?: string;
  topicAuthor: string;
  posts: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export default ITopic;
