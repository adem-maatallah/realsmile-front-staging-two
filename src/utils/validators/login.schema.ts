import { z } from 'zod';

// form zod validation schema
export const loginSchema = z.object({
  email: z.string().email('Adresse Email Invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
  rememberMe: z.boolean().optional(),
  otp: z.string().optional(),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;

// form zod validation schema
export const phoneSchema = z.object({
  phone: z.string(),
});

// generate form types from zod validation schema
export type PhoneSchema = z.infer<typeof phoneSchema>;
