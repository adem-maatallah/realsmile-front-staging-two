import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, Input, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';

interface ProductShippingAndDateSelectionProps {
  items: any[]; // Assuming the items array contains product details from the cart
}

export default function ProductShippingAndDateSelection({
  items,
}: ProductShippingAndDateSelectionProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4">
          <Title as="h5" className="mb-3 font-semibold">
            {item.name}
          </Title>

          {/* Checkbox for shipping */}
          {item.hasShipping && (
            <div className="mb-4">
              <Controller
                name={`items[${index}].hasShipping`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    value={value}
                    onChange={onChange}
                    label={`Add Shipping for ${item.name}`}
                    className="mb-2"
                  />
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
