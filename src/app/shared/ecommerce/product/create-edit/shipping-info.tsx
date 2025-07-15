import { Controller, useFormContext } from 'react-hook-form';
import { Input, Switch } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { DatePicker } from '@/components/ui/datepicker';

export default function ShippingInfo({ className }: { className?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup
      title="Shipping & Availability"
      description="Add your product shipping and availability info here"
      className={cn(className)}
    >
      <Controller
        name="isLimitDate"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Switch
            label="Limit date range for availability"
            className="col-span-full"
            value={value}
            checked={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        name="availableDate"
        control={control}
        render={({ field: { value, onChange, onBlur } }) => (
          <DatePicker
            inputProps={{ label: 'Available from' }}
            placeholderText="Select Date"
            dateFormat="dd/MM/yyyy"
            onChange={onChange}
            onBlur={onBlur}
            selected={value}
          />
        )}
      />

      <Controller
        name="endDate"
        control={control}
        render={({ field: { value, onChange, onBlur } }) => (
          <DatePicker
            inputProps={{ label: 'Available until' }}
            placeholderText="Select Date"
            dateFormat="dd/MM/yyyy"
            onChange={onChange}
            onBlur={onBlur}
            selected={value}
          />
        )}
      />
    </FormGroup>
  );
}
