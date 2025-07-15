import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox } from 'rizzui';
import cn from '@/utils/class-names';

export default function DifferentBillingAddress({
  className,
}: {
  className?: string;
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name="sameShippingAddress"
      control={control}
      render={({ field: { value, onChange } }) => (
        <Checkbox
          value={value}
          defaultChecked={value}
          onChange={onChange}
          label="Use a different shipping address"
          className={cn('mt-4', className)}
        />
      )}
    />
  );
}
