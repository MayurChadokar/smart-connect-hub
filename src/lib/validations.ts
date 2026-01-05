import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  department: z.string().min(1, "Please select a department"),
  address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Research & Development",
  "Legal",
  "Other",
] as const;

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
