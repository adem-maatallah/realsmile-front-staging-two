import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema } from '@/utils/validators/common-rules';

export const productFormSchema = z.object({
  title: z.string().min(1, { message: messages.productNameIsRequired }),
  categories: z.any(),
  description: z.string().min(1, { message: 'Description is required' }),

  // Multiple product images
  productImages: z.any(),

  // Price fields for different currencies
  priceTnd: z.coerce.number().min(0, { message: messages.priceIsRequired }),
  priceMar: z.coerce.number().min(0, { message: messages.priceIsRequired }),
  priceEur: z.coerce.number().min(0, { message: messages.priceIsRequired }),

  currentStock: z.number().or(z.string()).optional(),

  // Shipping information
  isLimitDate: z.boolean().optional(),
  availableDate: z.any(),
  endDate: z.any(),
  discount: z.string(),
  reference: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof productFormSchema>;
