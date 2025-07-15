import { z } from 'zod';

export const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
});

export type FileSchema = z.infer<typeof fileSchema>;

export const validateEmail = z
  .string()
  .min(1, { message: "L'Email est Obligatoire" })
  .email({ message: "L'Email est Invalide" });

export const validatePassword = z
  .string()
  .min(1, { message: 'Le mot de passe est requis.' })
  .min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  .regex(new RegExp('.*[A-Z].*'), {
    message: 'Le mot de passe doit contenir au moins une majuscule.',
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: 'Le mot de passe doit contenir au moins une minuscule.',
  })
  .regex(new RegExp('.*\\d.*'), {
    message: 'Le mot de passe doit contenir au moins un chiffre.',
  });

export const validateNewPassword = z
  .string()
  .min(1, { message: 'Le nouveau mot de passe est requis.' })
  .min(6, {
    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
  })
  .regex(new RegExp('.*[A-Z].*'), {
    message: 'Le nouveau mot de passe doit contenir au moins une majuscule.',
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: 'Le nouveau mot de passe doit contenir au moins une minuscule.',
  })
  .regex(new RegExp('.*\\d.*'), {
    message: 'Le nouveau mot de passe doit contenir au moins un chiffre.',
  });

export const validateConfirmPassword = z
  .string()
  .min(1, { message: 'La confirmation du mot de passe est requise.' })
  .min(6, {
    message:
      'La confirmation du mot de passe doit contenir au moins 6 caractères.',
  })
  .regex(new RegExp('.*[A-Z].*'), {
    message:
      'La confirmation du mot de passe doit contenir au moins une majuscule.',
  })
  .regex(new RegExp('.*[a-z].*'), {
    message:
      'La confirmation du mot de passe doit contenir au moins une minuscule.',
  })
  .regex(new RegExp('.*\\d.*'), {
    message:
      'La confirmation du mot de passe doit contenir au moins un chiffre.',
  });
