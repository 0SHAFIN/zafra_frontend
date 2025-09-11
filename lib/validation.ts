import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string()
      .min(1, "Password is required")
  });

  export const signupSchema = z.object({
    fullName: z.string().min(1, "Full name is required").trim(),
    phone: z.string()
      .min(1, "Phone number is required")
      .regex(/^\d+$/, "Phone number must contain only digits")
      .refine((val) => val.length >= 9 && val.length <= 15, {
        message: "Phone number must be between 9 and 15 digits"
      }),
    email: z.string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    address: z.string().min(1, "Address is required").trim(),
    password: z.string()
      .min(1, "Password is required"),
    role: z.string().default("user")
  });

  export type LoginFormData = z.infer<typeof loginSchema>;
  export type SignupFormData = z.infer<typeof signupSchema>;