import { z } from "zod";

const createLuncBurnSchema = z.object({
  date: z.string(),
  burnCount: z.number().nonnegative(),
  transactionRef: z.string(),
});

//update lunc burn
const updateLuncBurnSchema = z.object({
  date: z.string().optional(),
  burnCount: z.number().nonnegative().optional(),
  transactionRef: z.string().optional(),
});

export const luncBurnValidation = {
  createLuncBurnSchema,
  updateLuncBurnSchema,
};
