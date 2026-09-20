import { z } from "zod";

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    email: z.string().trim().email(),

    password: z.string().min(8).max(72),

    confirmPassword: z.string(),
  })
    // ensures the user typed the exact same password twice.
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export type RegisterFormData = z.infer<
  typeof registerFormSchema
>;

export const loginFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginFormData = z.infer<
  typeof loginFormSchema
>;