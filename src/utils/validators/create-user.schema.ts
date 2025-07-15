import { z } from 'zod';
import { messages } from '@/config/messages';
import { validateEmail } from '@/utils/validators/common-rules';

// Define schemas for each role based on Prisma schema attributes
export const createUserSchema = z.object({
  first_name: z.string().min(1, { message: messages.firstNameIsRequired }),
  last_name: z.string().min(1, { message: messages.lastNameIsRequired }),
  email: validateEmail,
  user_name: z.string().optional(),
  password: z.string(),
  role: z.string().optional(),
  phone: z.string().optional(),
  profile_pic: z.string().optional(),
  grade: z.string().default('bronze'),
  admin_verified: z.number().default(0),
  status: z.string().min(1, { message: messages.statusIsRequired }),
  speciality: z.string().optional(),
  office_phone: z.string().optional(),
  address: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  doctor_id: z.number().optional(),
  lab_name: z.string().min(1, { message: 'Lab name is required.' }),
});

// TypeScript type from Zod schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
