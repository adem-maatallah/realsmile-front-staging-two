'use client';

import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CheckoutPageWrapper from '@/app/shared/ecommerce/checkout';
import { metaObject } from '@/config/site.config';
import { useParams } from 'next/navigation';

const pageHeader = {
  title: 'Checkout',
  breadcrumb: [
    {
      name: 'Home',
    },
    {
      href: routes.eCommerce.dashboard,
      name: 'Realsmile Shop',
    },
    {
      name: 'Checkout',
    },
  ],
};

export default function CheckoutPage() {
  const { reference } = useParams(); // Get order reference from URL parameters

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      {/* Pass the reference to the CheckoutPageWrapper */}
      <CheckoutPageWrapper reference={reference} />
    </>
  );
}
