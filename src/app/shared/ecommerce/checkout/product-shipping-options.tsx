'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from 'rizzui';
import cn from '@/utils/class-names';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';

export default function ProductShippingOptions() {
  const { control, register } = useFormContext();

  // Assuming 'products' is an array of items in the cart, each having shipping options.
  const products = useWatch({
    name: 'products',
    control,
  });

  return (
    <div className="mb-6">
      <h4 className="mb-4 font-semibold">Product Options</h4>
      {products.map((product, index) => (
        <div key={product.id} className="mb-4">
          <h5 className="mb-2 font-medium">{product.name}</h5>
          {/* Enable Shipping for this product */}
          <Controller
            name={`products.${index}.hasShipping`}
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Add Shipping for this product"
                {...field}
                className="mb-3"
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}
