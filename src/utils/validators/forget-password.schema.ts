import { z } from 'zod';
import { validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const forgetPasswordSchema = z.object({
  email: validateEmail,
});

// generate form types from zod validation schema
export type ForgetPasswordSchema = z.infer<typeof forgetPasswordSchema>;

// form zod validation schema
export const resetPasswordSchema = z.object({
  token: z.string(),
  email: validateEmail,
  password: z.string().min(6),
  password_confirm: z.string().min(6),
});

// generate form types from zod validation schema
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
