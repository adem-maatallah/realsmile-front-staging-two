import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validators/common-rules';

// form zod validation schema
export const signUpSchema = z.object({
  first_name: z.string().min(1, { message: messages.firstNameRequired }),
  last_name: z.string().min(1, { message: messages.lastNameRequired }),
  email: validateEmail,
  password: validatePassword,
  password_confirm: validateConfirmPassword,
  phone: z.string().min(1, { message: 'Le numéro de téléphone est requis.' }),
  office_phone: z.string(),
  speciality: z.string().min(1, { message: 'La spécialité est requise.' }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  address_2: z.string(),
  city: z.string().min(1, { message: 'La ville est requise.' }),
  zip: z.string().min(1, { message: 'Le code postal est requis.' }),
  country: z.string().min(1, { message: 'Le pays est requis.' }),
  profile_picture: z
    .any()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true; // It's optional
        const file = val[0];
        const maxSize = 5 * 1024 * 1024; // 5 MB
        return file.size <= maxSize;
      },
      { message: 'La photo de profil doit être inférieure à 5 Mo.' }
    ),
  is_agreed: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions.',
  }),
});

// generate form types from zod validation schema
export type SignUpSchema = z.infer<typeof signUpSchema>;
