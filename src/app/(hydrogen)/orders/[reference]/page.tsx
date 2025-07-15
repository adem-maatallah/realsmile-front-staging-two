'use client';

import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import OrderView from '@/app/shared/ecommerce/order/order-view';
import ShippingModal from '@/app/shared/ecommerce/shipping-modal';
import ConfirmShipmentModal from '@/app/shared/ecommerce/confirm-shipment-modal';
import ApproveOrderModal from '@/app/shared/ecommerce/approve-order-modal';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';

// SWR fetcher function that accepts URL and options
const fetcher = (url: string) =>
  axiosInstance(url).then((res) => res.data);

export default function OrderDetailsPage({ params }: any) {
  const { user } = useAuth();

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isConfirmShipmentModalOpen, setIsConfirmShipmentModalOpen] =
    useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false); // State for the approve modal

  const {
    data: orderData,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `/orders/reference/${params.reference}`,
    (url) => fetcher(url)
  );

  const pageHeader = {
    title: `Order #${params.reference}`,
    breadcrumb: [
      { name: 'Realsmile Shop' },
      { name: 'Orders' },
      { name: params.reference },
    ],
  };

  if (error) {
    toast.error('Error fetching order details');
    return <p>Error fetching order details</p>;
  }

  if (isValidating) {
    return <p>Loading...</p>;
  }

  if (!orderData) {
    return <p>Order not found.</p>;
  }

  // Determine user role for action buttons
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* Buttons for Admins and Doctors */}
        {isAdmin && orderData.status === 'pending' && (
          <Button
            className="mt-4 w-full @lg:mt-0 @lg:w-auto"
            onClick={() => setIsApproveModalOpen(true)}
          >
            Approve Order
          </Button>
        )}

        {isAdmin && orderData.status === 'approved' && (
          <Button
            className="mt-4 w-full @lg:mt-0 @lg:w-auto"
            onClick={() => setIsShippingModalOpen(true)}
          >
            Change to Shipping
          </Button>
        )}

        {isDoctor && orderData.status === 'shipping' && (
          <Button
            className="mt-4 w-full @lg:mt-0 @lg:w-auto"
            onClick={() => setIsConfirmShipmentModalOpen(true)}
          >
            Confirm Shipment
          </Button>
        )}
      </PageHeader>

      <OrderView
        order={orderData}
        openShippingModal={() => setIsShippingModalOpen(true)}
        openConfirmShipmentModal={() => setIsConfirmShipmentModalOpen(true)}
        openApproveModal={() => setIsApproveModalOpen(true)}
        isAdmin={isAdmin}
        isDoctor={isDoctor}
        mutate={mutate} // Pass SWR's mutate function to trigger revalidation after actions
      />

      {/* Admin - Approve Modal */}
      <ApproveOrderModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        orderReference={orderData.reference}
        mutate={mutate} // Mutate to refresh data after action
      />

      {/* Admin - Change to Shipping Modal */}
      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        orderReference={orderData.reference}
        mutate={mutate} // Mutate to refresh data after action
      />

      {/* Doctor - Confirm Shipment Modal */}
      <ConfirmShipmentModal
        isOpen={isConfirmShipmentModalOpen}
        onClose={() => setIsConfirmShipmentModalOpen(false)}
        orderReference={orderData.reference}
        mutate={mutate} // Mutate to refresh data after action
      />
    </>
  );
}
