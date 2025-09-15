import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine((val) => val.length >= 9 && val.length <= 15, {
      message: "Phone number must be between 9 and 15 digits",
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  address: z.string().min(1, "Address is required").trim(),
  password: z.string().min(1, "Password is required"),
  role: z.string().default("user"),
});

export const userManagementSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters long")
    .max(50, "Password cannot exceed 50 characters"),
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  role: z.enum(["admin", "manager"]),
});

// Perfume / Product schemas
export const perfumeBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .max(100000, "Price seems unrealistically high"),
  category: z
    .string()
    .min(1, "Category is required")
    .refine(
      (val) => ["Men", "Women", "Unisex"].includes(val),
      "Category must be one of Men, Women, or Unisex"
    ),
  stock: z.coerce
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .max(100000, "Stock is too large"),
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(100, "Brand cannot exceed 100 characters")
    .trim(),
  image: z
    .string()
    .url("Image must be a valid URL")
    .max(500, "Image URL too long"),
  discount: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
});

// Separate create & update if update could allow partial fields later
export const perfumeCreateSchema = perfumeBaseSchema;
export const perfumeUpdateSchema = perfumeBaseSchema.partial();

export type PerfumeCreateInput = z.infer<typeof perfumeCreateSchema>;
export type PerfumeUpdateInput = z.infer<typeof perfumeUpdateSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type UserManagementFormData = z.infer<typeof userManagementSchema>;
export type PerfumeFormData = PerfumeCreateInput;
