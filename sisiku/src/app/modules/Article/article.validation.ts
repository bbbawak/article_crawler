import { z } from "zod";

const CreateArticleSchema = z.object({
  content: z.string().nonempty("Content is required"),
  title: z.string().nonempty("Title is required"),
  authorId: z.string().nonempty("Author id can't be empty").optional(),
  image: z.string().optional(),
});

const UpdateArticleSchema = z
  .object({
    id: z.string().nonempty("article ID is required"),
    title: z.string().optional(),
    content: z.string().optional(),
    authorId: z.string().nonempty("Author ID is required"),
    image: z.string().optional(),
  })
  .strict();

const addOrRemoveLikeSchema = z.object({
  id: z.string(),
  authorId: z.string(),
});
export { CreateArticleSchema, UpdateArticleSchema , addOrRemoveLikeSchema };
