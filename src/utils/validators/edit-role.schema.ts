import { z } from 'zod';

// form zod validation schema
export const rolePermissionSchema = z.object({
  administrateur: z.array(z.string()).optional(),
  praticien: z.array(z.string()).optional(),
  labo: z.array(z.string()).optional(),
  patient: z.array(z.string()).optional(),
  financier: z.array(z.string()).optional(),
  agent: z.array(z.string()).optional()
});

// generate form types from zod validation schema
export type RolePermissionInput = z.infer<typeof rolePermissionSchema>;
