import { Controller, useFormContext } from 'react-hook-form';
import cn from '@/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';

// Dynamically load the FileInput component
const FileInput = dynamic(() => import('rizzui').then((mod) => mod.FileInput), {
  ssr: false,
  loading: () => <SelectLoader />,
});

export default function ProductMedia({ className }: { className?: string }) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  // Watch the existing product images
  const existingImages = watch('productImages') || [];

  return (
    <FormGroup
      title="Product Media"
      description="Upload product images or files"
      className={cn(className)}
    >
      {/* Show existing media */}
      {existingImages.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-4">
          {Array.isArray(existingImages) &&
            existingImages.map((img, index) => (
              <div key={index} className="h-32 w-32">
                <img
                  src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                  alt={`Product Image ${index + 1}`}
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
            ))}
        </div>
      )}

      {/* File Upload using Rizzui FileInput */}
      <Controller
        name="productImages"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FileInput
            label="Upload Product Media"
            placeholder="Upload multiple files"
            multiple={true} // Allow multiple files
            onChange={(e) => onChange(e.target.files)} // Handle file selection
            error={errors.productImages?.message as string}
            clearable={true} // Allow clearing of the file input
          />
        )}
      />
    </FormGroup>
  );
}
