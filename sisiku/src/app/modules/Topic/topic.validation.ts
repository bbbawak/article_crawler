import { z } from "zod";

const CreateTopicSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional().optional(),
  image: z.string().optional(),
  topicAuthor: z.string().nonempty(),
});

const UpdateTopicSchema = z.object({
  id:z.string(),
  title: z.string().optional(),
  description: z.string().optional().optional(),
  image: z.string().optional(),
});


export { CreateTopicSchema ,UpdateTopicSchema};
