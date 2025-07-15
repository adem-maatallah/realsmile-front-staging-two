import { z } from 'zod';
import { messages } from '@/config/messages';

const addressSchema = z.object({
  customerName: z.string().min(1, { message: messages.customerNameIsRequired }),
  phoneNumber: z
    .string({
      required_error: messages.phoneNumberIsRequired,
    })
    .min(2, { message: messages.phoneNumberIsRequired }),
  country: z.string().min(1, { message: messages.countryIsRequired }),
  state: z.string().min(1, { message: messages.stateIsRequired }),
  city: z.string().min(1, { message: messages.cityIsRequired }),
  zip: z.string().min(1, { message: messages.zipCodeRequired }),
  street: z.string().min(1, { message: messages.streetIsRequired }),
  address2: z.string().optional(), // Add optional address line 2
});

// form zod validation schema
export const orderFormSchema = z.object({
  billingAddress: addressSchema,
  note: z.string().optional(),
  products: z.array(z.any()),
});

export type CreateOrderInput = z.infer<typeof orderFormSchema>;
