'use client';

import Image from 'next/image';
import OrderViewProducts from '@/app/shared/ecommerce/order/order-products/order-view-products';
import { Title, Text, Button } from 'rizzui';
import cn from '@/utils/class-names';
import { formatDate } from '@/utils/format-date';
import WidgetCard from '@/components/cards/widget-card';
import { PiCheckBold } from 'react-icons/pi';
import { useAuth } from '@/context/AuthContext';

let orderStatus = [
  { id: 1, label: 'draft' },
  { id: 2, label: 'pending' },
  { id: 3, label: 'approved' },
  { id: 4, label: 'shipping' },
  { id: 5, label: 'completed' },
  { id: 6, label: 'cancelled' },
];

export default function OrderView({ order }: any) {
  const {user} = useAuth()
  const { totalItems, orderNote } = order;
  const price = order.totalAmount + ' ' + order.currency;

  const currentOrderStatus =
    order.status === 'cancelled'
      ? orderStatus.length
      : orderStatus.findIndex((status) => status.label === order.status) + 1;

  // Filter statuses to exclude "cancelled" unless the order is cancelled
  if (currentOrderStatus !== 6) {
    orderStatus = orderStatus.filter((status) => status.label !== 'cancelled');
  }

  return (
    <div className="@container">
      <div className="flex flex-wrap justify-center border-b border-t border-gray-300 py-4 font-medium text-gray-700 @5xl:justify-start">
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          {formatDate(new Date(order.createdAt), 'MMMM D, YYYY')} at{' '}
          {formatDate(new Date(order.createdAt), 'h:mm A')}
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          {totalItems} Items
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Total {price}
        </span>
        <span className="my-2 ms-5 rounded-3xl border-r border-muted bg-green-lighter px-2.5 py-1 text-xs capitalize text-green-dark first:ps-0 last:border-r-0 ">
          {order.status}
        </span>
      </div>

      {/* Display shipping link for doctors */}
      {order.status === 'shipping' && (
        <div className="my-4">
          <a
            href={order.trackingUrl}
            className="text-primary hover:underline"
            target="_blank"
          >
            Shipment Tracking Link
          </a>
        </div>
      )}

      <div className="items-start pt-10 @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
        <div className="space-y-7 @5xl:col-span-8 @5xl:space-y-10 @6xl:col-span-7">
          <div className="pb-5">
            <OrderViewProducts
              items={order.orderItems}
              currency={order.currency}
            />
            <div className="border-t border-muted pt-7 @5xl:mt-3">
              <div className="ms-auto max-w-lg space-y-6">
                <div className="flex justify-between font-medium">
                  Subtotal <span>{price}</span>
                </div>
                <div className="flex justify-between border-t border-muted pt-5 text-base font-semibold">
                  Total <span>{price}</span>
                </div>
              </div>
            </div>
          </div>

          {orderNote && (
            <div className="">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes About Order
              </span>
              <div className="rounded-xl border border-muted px-5 py-3 text-sm leading-[1.85]">
                {orderNote}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-7 pt-8 @container @5xl:col-span-4 @5xl:space-y-10 @5xl:pt-0 @6xl:col-span-3">
          <WidgetCard
            title="Order Status"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="ms-2 w-full space-y-7 border-s-2 border-gray-100">
              {orderStatus.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative ps-6 text-sm font-medium capitalize before:absolute before:-start-[9px] before:top-px before:h-5 before:w-5 before:-translate-x-px before:rounded-full before:bg-gray-100 before:content-[''] after:absolute after:-start-px after:top-5  after:h-10 after:w-0.5  after:content-[''] last:after:hidden",
                    currentOrderStatus > item.id
                      ? 'before:bg-primary after:bg-primary'
                      : 'after:hidden',
                    currentOrderStatus === item.id && 'before:bg-primary'
                  )}
                >
                  {currentOrderStatus >= item.id ? (
                    <span className="absolute -start-1.5 top-1 text-white">
                      <PiCheckBold className="h-auto w-3" />
                    </span>
                  ) : null}

                  {item.label}
                </div>
              ))}
            </div>
          </WidgetCard>

          {/* Customer Details */}
          <WidgetCard title="Customer Details">
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16">
                <Image
                  fill
                  alt="avatar"
                  className="rounded-full object-cover"
                  sizes="(max-width: 768px) 100vw"
                  src={
                    user?.role == 'doctor'
                      ? user?.profile_pic
                      : 'https://storage.googleapis.com/realsmilefiles/staticFolder/doctorCompress.png'
                  }
                />
              </div>
              <div>
                <Title as="h3" className="text-base font-semibold">
                  {order.customerName}
                </Title>
                <Text as="p">{order.phoneNumber}</Text>
              </div>
            </div>
          </WidgetCard>

          {/* Shipping Address */}
          <WidgetCard title="Shipping Address">
            <Title as="h3" className="mb-2.5 text-base font-semibold">
              {order.customerName}
            </Title>
            <Text as="p">
              {order.streetAddress}, {order.city}, {order.state}, {order.zip},{' '}
              {order.country}
            </Text>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
