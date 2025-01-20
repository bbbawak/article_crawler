import { z } from "zod";

const createShibaBurnSchema = z.object({
  date: z.string(),
  burnCount: z.number().nonnegative(),
  transactionRef: z.string(),
});

//update shiba burn
const updateShibaBurnSchema = z.object({
  date: z.string().optional(),
  burnCount: z.number().nonnegative().optional(),
  transactionRef: z.string().optional(),
});

export const shibaBurnValidation = {
  createShibaBurnSchema,
  updateShibaBurnSchema,
};
