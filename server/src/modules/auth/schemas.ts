import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  name: z.string().min(1).max(120).trim(),
  password: z.string().min(8).max(200),
  companyName: z.string().min(1).max(200).trim(),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
