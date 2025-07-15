import { Button, Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import OrderProducts from './order-products';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function OrderSummery({
  isLoading,
  className,
  data,
}: {
  className?: string;
  isLoading?: boolean;
  data: any;
}) {
  const totalPrice = data?.totalAmount + ' ' + data?.currency;

  return (
    <div
      className={cn(
        'mt-8 @5xl:col-span-4 @5xl:mt-0 @6xl:col-span-3',
        className
      )}
    >
      <Title as="h4" className="mb-3 font-semibold">
        Your Order
      </Title>
      <div className="rounded-lg border border-muted p-4 @xs:p-6">
        <div className="pt-4">
          <OrderProducts
            items={data?.orderItems}
            className="mb-5 border-b border-muted pb-5"
            currency={data?.currency}
          />
          <div className="mb-4 flex items-center justify-between">
            Subtotal
            <Text as="span" className="font-medium text-gray-900">
              {data?.totalAmount} {data?.currency}
            </Text>
          </div>
          <div className="mb-4 flex items-center justify-between">
            Shipping
            <Text as="span" className="font-medium text-gray-900">
              0 {data?.currency}
            </Text>
          </div>
          <div className="flex items-center justify-between border-t border-muted py-4 text-base font-bold text-gray-1000">
            Total
            <Text>{totalPrice}</Text>
          </div>
        </div>
        <Button
          type="submit"
          isLoading={isLoading}
          className="mt-3 w-full text-base"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
