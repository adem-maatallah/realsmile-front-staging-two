'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Text } from 'rizzui';
import cn from '@/utils/class-names';
import FormNav, {
  formParts,
} from '@/app/shared/ecommerce/product/create-edit/form-nav';
import ProductSummary from '@/app/shared/ecommerce/product/create-edit/product-summary';
import ProductMedia from '@/app/shared/ecommerce/product/create-edit/product-media';
import PricingInventory from '@/app/shared/ecommerce/product/create-edit/pricing-inventory';
import ShippingInfo from '@/app/shared/ecommerce/product/create-edit/shipping-info';
import FormFooter from '@/components/form-footer';
import {
  CreateProductInput,
  productFormSchema,
} from '@/utils/validators/create-product.schema';
import { useLayout } from '@/hooks/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';
import useSWR from 'swr';
import axiosInstance from '@/utils/axiosInstance'; // Make sure this path is correct!

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

const MAP_STEP_TO_COMPONENT = {
  [formParts.summary]: ProductSummary,
  [formParts.media]: ProductMedia,
  [formParts.pricingInventory]: PricingInventory,
  [formParts.shipping]: ShippingInfo,
};

interface IndexProps {
  slug?: string;
  className?: string;
  product?: CreateProductInput;
}

export default function CreateEditProduct({
  slug,
  product,
  className,
}: IndexProps) {
  const { layout } = useLayout();
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const {
    data: categories,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useSWR(`/categories`, fetcher);

  const methods = useForm<CreateProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product?.name || '',
      description: product?.description || '',
      priceTnd: product?.priceTnd || '',
      priceMar: product?.priceMar || '',
      priceEur: product?.priceEur || '',
      currentStock: product?.stock || '',
      availableDate: product?.availableDate
        ? new Date(product.availableDate)
        : null,
      endDate: product?.endDate ? new Date(product.endDate) : null,
      isLimitDate: product?.isLimitDate || false,
      categories: product?.categories?.map((cat) => cat.id) || [],
      productImages: product?.imageUrls || [],
      reference: product?.reference || '',
      discount: product?.discount?.toString() || '0', // Ensure discount is a string
    },
  });

  // Fix category pre-selection
  useEffect(() => {
    if (!isLoadingCategories && categories && product?.categories) {
      const selectedCategoryIds = product.categories.map(
        (prodCat: any) => prodCat.id
      );
      console.log('Pre-selecting categories: ', selectedCategoryIds);
      methods.setValue('categories', selectedCategoryIds);
    }
  }, [categories, isLoadingCategories, product, methods]);

  const onSubmit: SubmitHandler<CreateProductInput> = async (data) => {
    setLoading(true);
    try {
      const url = slug ? `/products/${slug}` : `/products`;

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priceTnd', data.priceTnd);
      formData.append('priceMar', data.priceMar);
      formData.append('priceEur', data.priceEur);
      formData.append('currentStock', data.currentStock);
      formData.append('availableDate', data.availableDate?.toISOString() || '');
      formData.append('endDate', data.endDate?.toISOString() || '');
      formData.append('isLimitDate', String(data.isLimitDate));
      formData.append('discount', data.discount || '0');
      formData.append('reference', data.reference || '');

      data.categories.forEach((category: any) => {
        formData.append('categories[]', category);
      });

      if (data.productImages && data.productImages.length > 0) {
        Array.from(data.productImages).forEach((image) => {
          // Check if the image is a File object before appending
          if (image instanceof File) {
            formData.append('productImages', image);
          } else {
            // Handle existing image URLs (if your backend expects them separately)
            // For now, if it's not a File, we assume it's an existing URL and don't re-upload
            // You might need a separate field for `existingImageUrls` or similar
          }
        });
      }

      let response;
      if (slug) {
        // Update existing product
        response = await axiosInstance.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Axios handles this for FormData, but explicit can be good
          },
        });
      } else {
        // Create new product
        response = await axiosInstance.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(
          <Text as="b">Product successfully {slug ? 'updated' : 'created'}</Text>
        );
        methods.reset();
        router.push('/products');
      } else {
        throw new Error(response.data?.message || 'Failed to submit the product');
      }
    } catch (error: any) {
      toast.error(<Text as="b">{error.message || 'An unknown error occurred.'}</Text>);
    } finally {
      setLoading(false);
    }
  };

  // Add debug logs for validation errors
  console.log('Form validation errors: ', methods.formState.errors);

  if (isLoadingCategories) {
    return <div>Loading categories...</div>;
  }

  if (categoriesError) {
    return <div>Error loading categories.</div>;
  }

  return (
    <div className="@container">
      <FormNav
        className={cn(
          layout === LAYOUT_OPTIONS.BERYLLIUM && 'z-[999] 2xl:top-[72px]'
        )}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn(
            'relative z-[19] [&_label.block>span]:font-medium',
            className
          )}
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => (
              <Element
                key={key}
                name={formParts[key as keyof typeof formParts]}
              >
                <Component
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                  categories={categories}
                  product={product}
                />
              </Element>
            ))}
          </div>
          <FormFooter
            isLoading={isLoading}
            submitBtnText={slug ? 'Update Product' : 'Create Product'}
          />
        </form>
      </FormProvider>
    </div>
  );
}