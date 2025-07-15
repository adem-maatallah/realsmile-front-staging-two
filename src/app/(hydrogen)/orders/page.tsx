'use client';

import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import OrdersTable from '@/app/shared/ecommerce/order/order-list/table';
import { PiPlusBold } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ExportButton from '@/app/shared/export-button';
import { metaObject } from '@/config/site.config';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

const pageHeader = {
  title: 'Orders',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Realsmile Shop',
    },
    {
      href: routes.eCommerce.orders,
      name: 'Orders',
    },
    {
      name: 'List',
    },
  ],
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/orders`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.data;
        setOrders(data);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={orders}
            fileName="order_data"
            header="Order ID,Customer Name,Items,Price,Status,Created At,Updated At"
          />
        </div>
      </PageHeader>

      <OrdersTable data={orders} isLoading={isLoading} />
    </>
  );
}
