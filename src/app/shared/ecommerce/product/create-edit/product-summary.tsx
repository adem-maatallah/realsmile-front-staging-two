import { Controller, useFormContext } from 'react-hook-form';
import { Input, Checkbox } from 'rizzui';
import cn from '@/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Dynamically load the ReactQuill component (WYSIWYG editor)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

import 'react-quill/dist/quill.snow.css'; // Import Quill styles

export default function ProductSummary({
  className,
  categories,
  product,
}: {
  className?: string;
  categories?: any[];
  product?: any; // The product being edited, if available
}) {
  const {
    register,
    control,
    setValue, // Hook form function to set the value of fields
    getValues,
    formState: { errors },
  } = useFormContext();

  // Pre-select categories if editing a product
  useEffect(() => {
    if (product?.categories && categories) {
      const selectedCategoryIds = product.categories.map((cat: any) =>
        String(cat.id)
      ); // Cast to string
      console.log(
        'Pre-selecting categories in ProductSummary: ',
        selectedCategoryIds
      ); // Debug log
      setValue('categories', selectedCategoryIds);
    }
  }, [product, categories, setValue]);

  return (
    <FormGroup
      title="Summary"
      description="Edit your product description and necessary information here"
      className={cn(className)}
    >
      {/* Title Field */}
      <Input
        label="Title"
        placeholder="Product title"
        {...register('title')}
        error={errors.title?.message as string}
      />

      {/* WYSIWYG Editor for Description */}
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <ReactQuill
              theme="snow"
              value={value || ''}
              onChange={onChange}
              placeholder="Product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Checkbox Group for Categories */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Categories
        </label>
        <Controller
          name="categories"
          control={control}
          render={({ field: { onChange, value } }) => {
            const selectedCategories = getValues('categories') || [];

            const handleCheckboxChange = (categoryId: string) => {
              const updatedCategories = selectedCategories.includes(categoryId)
                ? selectedCategories.filter((id: string) => id !== categoryId)
                : [...selectedCategories, categoryId];

              console.log(
                'Updated categories after change: ',
                updatedCategories
              ); // Debug
              onChange(updatedCategories);
            };

            return (
              <div className="space-y-2">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(String(category.id))} // Ensure it's string comparison
                      onChange={() => handleCheckboxChange(String(category.id))} // Cast to string for consistency
                    />
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600">
            {errors.categories.message}
          </p>
        )}
      </div>

      {/* Reference Field */}
      <Input
        label="Reference"
        placeholder="Product reference"
        {...register('reference')}
        error={errors.reference?.message as string}
      />
    </FormGroup>
  );
}
