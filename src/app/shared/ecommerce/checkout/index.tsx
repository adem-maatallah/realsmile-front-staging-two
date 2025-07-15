'use client';

import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import AddressInfo from '@/app/shared/ecommerce/order/order-form/address-info';
import OrderSummery from '@/app/shared/ecommerce/checkout/order-summery';
import OrderNote from '@/app/shared/ecommerce/checkout/order-note';
import {
  CreateOrderInput,
  orderFormSchema,
} from '@/utils/validators/create-order.schema';
import { useEffect, useState } from 'react';
import cn from '@/utils/class-names';
import axiosInstance from '@/utils/axiosInstance';

export default function CheckoutPageWrapper({
  reference,
  className,
}: {
  reference: string;
  className?: string;
}) {
  const router = useRouter();
  const {user} = useAuth()
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const methods = useForm<CreateOrderInput>({
    mode: 'onChange',
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      billingAddress: {
        customerName: `${user?.first_name || ''} ${user?.last_name || ''}`,
        phoneNumber: user?.phone || '',
        country: user?.country || '',
        state: user?.state || '',
        city: user?.city || '',
        zip: user?.zip || '',
        street: user?.address || '',
        address2: user?.address_2 || '',
      },
      products: [],
      note: '', // Add orderNote to default values
    },
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/orders/reference/${reference}`
        );

        if (!response) {
          router.push('/shop');
          return;
        }

        const data = response.data;

        if (response) {
          // Redirect if the order status is not "draft"
          if (data.status !== 'draft') {
            router.push(`/orders/${reference}`);
            return;
          }

          setOrderData(data);
          methods.reset({
            billingAddress: {
              customerName:
                data.customerName ||
                `${user?.first_name || ''} ${user?.last_name || ''}`,
              phoneNumber: data.phoneNumber || user?.phone || '',
              country: data.country || user?.country || '',
              state: data.state || '',
              city: data.city || user?.city || '',
              zip: data.zip || user?.zip || '',
              street: data.streetAddress || user?.address || '',
              address2: data.address2 || user?.address_2 || '',
            },
            products: data.products || [],
            note: data.note || '', // Prefill order note from the fetched data
          });
        } else {
          toast.error('Failed to fetch order details.');
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    if (reference && user) {
      fetchOrderData();
    }
  }, [reference, methods, user, router]);

  const onSubmit: SubmitHandler<CreateOrderInput> = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/orders/${reference}`,
        JSON.stringify({
            status: 'pending',
            ...data.billingAddress,
            orderNote: data.note, // Include orderNote in the request
          }),
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response) {
        throw new Error('Failed to update order.');
      }

      toast.success('Order updated successfully!');
      router.push(`/orders/${reference}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn(
          'isomorphic-form mx-auto flex w-full max-w-[1536px] flex-grow flex-col @container [&_label.block>span]:font-medium',
          className
        )}
      >
        <div className="items-start @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
          <div className="gap-4 border-muted @container @5xl:col-span-8 @5xl:border-e @5xl:pb-12 @5xl:pe-7 @6xl:col-span-7 @7xl:pe-12">
            <div className="flex flex-col gap-4 @xs:gap-7 @5xl:gap-9">
              <AddressInfo
                type="billingAddress"
                title="Billing Information"
                isReadOnly
              />
              <OrderNote />
            </div>
          </div>

          <OrderSummery data={orderData} isLoading={isLoading} />
        </div>
      </form>
    </FormProvider>
  );
}
