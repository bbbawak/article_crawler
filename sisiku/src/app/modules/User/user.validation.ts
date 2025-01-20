import z from "zod";

const createUserSchema = z.object({
  firstName: z.string({
    required_error: "First name is required.",
  }),
  lastName: z
    .string({
      required_error: "Last name is required.",
    })
    .optional(),
  email: z.string().email({
    message: "Valid email is required.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
  role: z.enum(["ADMIN"]).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string({
    required_error: "First name is required.",
  }),
  lastName: z
    .string({
      required_error: "Last name is required.",
    })
    .optional(),
  email: z.string().email({
    message: "Valid email is required.",
  }),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
  role: z.enum(["ADMIN","USER"]).optional(),
});



export const userValidation = {
  createUserSchema,
  updateUserSchema,
};
