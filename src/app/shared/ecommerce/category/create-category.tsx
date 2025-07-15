'use client';

import { useState } from 'react';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { Button, Input, Title } from 'rizzui';
import Upload from '@/components/ui/file-upload/upload';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { useModal } from '@/app/shared/modal-views/use-modal';
import dynamic from 'next/dynamic';

// Lazy load the Quill Editor for better performance
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <div className="col-span-full h-[168px]" />,
});

export default function CreateCategory({ id, category }) {
  const { closeModal } = useModal();
  const { mutate } = useSWRConfig();
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: category || {
      name: '',
      description: '',
      images: '',
    },
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    setLoading(true);
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description); // Description HTML content

    // Append image file if it exists
    if (data.images && data.images.length > 0) {
      formData.append('file', data.images[0]);
    }

    try {
      const url = id
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const method = id ? 'put' : 'post';

      await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Revalidate the SWR cache
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/categories`);

      toast.success(`Category ${id ? 'updated' : 'created'} successfully!`);

      // Close modal after success
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit the category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <Input
        label="Category Name"
        placeholder="Category name"
        {...register('name', { required: 'Category name is required' })}
        error={errors.name?.message}
      />

      <div className="col-span-2">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <QuillEditor
              {...field}
              defaultValue={field.value} // Pre-fill editor with HTML content
              label="Description"
              className="[&>.ql-container_.ql-editor]:min-h-[100px]"
            />
          )}
        />
      </div>

      {/* Thumbnail label */}
      <label className="mb-1.5 block font-semibold text-gray-900">
        Thumbnail {id ? '(Optional)' : '(Required)'}
      </label>
      <Controller
        name="images"
        control={control}
        rules={{
          validate: (value) =>
            id || (value && value.length > 0) || 'Thumbnail is required',
        }}
        render={({ field }) => (
          <Upload
            {...field}
            getValues={getValues}
            setValue={setValue}
            className="col-span-full"
            initialImage={category?.thumbnail} // Display existing thumbnail if available
            error={errors.images?.message} // Display validation error for image
          />
        )}
      />

      <div className="mt-4">
        <Button type="submit" isLoading={isLoading}>
          {id ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
}
