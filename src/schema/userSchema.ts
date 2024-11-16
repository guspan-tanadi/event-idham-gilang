// schemas/userSchema.ts
import { z } from "zod";

// Define the registration schema
export const registerSchema = z.object({
  username: z
    .string()
    .max(50, "Username must be at most 50 characters")
    .nonempty("Username is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters")
    .nonempty("Password is required"),
  email: z
    .string()
    .email("Invalid email address")
    .max(50, "Email must be at most 50 characters")
    .nonempty("Email is required"),
  fullname: z
    .string()
    .max(50, "Full Name must be at most 50 characters")
    .nonempty("Full Name is required"),
});

// Infer the TypeScript type from the schema
export type RegisterFormData = z.infer<typeof registerSchema>;