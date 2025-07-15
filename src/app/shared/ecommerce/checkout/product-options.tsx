'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from 'rizzui';
import cn from '@/utils/class-names';
import { useCart } from '@/store/quick-cart/cart.context';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';

export default function ProductOptions() {
  const { items } = useCart();
  const { control } = useFormContext();

  return (
    <div className="mt-8">
      <h4 className="mb-3 text-lg font-semibold">Product Options</h4>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="border-b pb-6">
            <h5 className="text-md mb-2 font-semibold">{item.name}</h5>
            {/* Shipping option for each product */}
            <Controller
              name={`items.${index}.hasShipping`}
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label="Add Shipping for this product"
                  checked={value}
                  onChange={onChange}
                  className="mb-4"
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
