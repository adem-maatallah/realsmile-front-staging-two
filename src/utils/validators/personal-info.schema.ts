import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const personalInfoFormSchema = z.object({
  first_name: z.string().min(1, { message: messages.firstNameRequired }),
  last_name: z.string().min(1),
  user_name: z.string().min(1),
  email: validateEmail,
  phone: z.string(),
  country: z.string().min(1),
  profile_pic: z.any(),
  speciality: z.any(),
  office_phone: z.string(),
  address: z.string(),
  address_2: z.string(),
  city: z.string(),
  zip: z.string(),
});

// generate form types from zod validation schema
export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;
