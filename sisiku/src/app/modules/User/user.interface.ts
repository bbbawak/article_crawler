import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";

interface IUser {
  id: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  profileImage?: string;
  coverImage?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  followers?: ObjectId[];
  role: Role;
  refreshToken?: string;
  posts: ObjectId[];
  comments: ObjectId[];
}

export default IUser;
