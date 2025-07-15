import { Input } from 'rizzui';
import { useFormContext } from 'react-hook-form';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';

export default function PricingInventory({
  className,
}: {
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <FormGroup
        title="Pricing"
        description="Add your product pricing here"
        className={cn(className)}
      >
        <Input
          label="Price in TND"
          placeholder="Price in TND"
          {...register('priceTnd')}
          error={errors.priceTnd?.message as string}
          type="number"
        />

        <Input
          label="Price in MAR"
          placeholder="Price in MAR"
          {...register('priceMar')}
          error={errors.priceMar?.message as string}
          type="number"
        />

        <Input
          label="Price in EUR"
          placeholder="Price in EUR"
          {...register('priceEur')}
          error={errors.priceEur?.message as string}
          type="number"
        />
        <Input
          label="Discount"
          placeholder="Discount percentage"
          {...register('discount')}
          error={errors.discount?.message as string}
          type="number"
          min={0}
          max={100}
          suffix="%"
          defaultValue={0}
        />
      </FormGroup>

      <FormGroup
        title="Inventory"
        description="Add your product stock here"
        className={cn(className)}
      >
        <Input
          label="Stock"
          placeholder="Stock"
          {...register('currentStock')}
          error={errors.currentStock?.message as string}
          type="number"
        />
      </FormGroup>
    </>
  );
}
