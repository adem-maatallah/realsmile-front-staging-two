import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Button } from 'rizzui';
import { routes } from '@/config/routes';
import axiosInstance from '@/utils/axiosInstance';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const slug = params.slug;
  return metaObject(`Edit ${slug}`);
}

// Fetch product details from the server
export default async function EditProductPage({ params }: Props) {
  const { slug } = params;

  // Fetch the product details using the slug
  const res = await axiosInstance.get(`/products/${slug}`);
  if (!res) {
    // Handle error or redirect if product is not found
    return <div>Error loading product</div>;
  }
  const product = await res.data;

  return (
    <>
      <PageHeader title="Edit Product" breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.createProduct}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Add Product
          </Button>
        </Link>
      </PageHeader>

      {/* Pass the fetched product to the CreateEditProduct component */}
      <CreateEditProduct slug={slug} product={product} />
    </>
  );
}

const pageHeader = {
  title: 'Edit Product',
  breadcrumb: [
    { href: '/', name: 'Dashboard' },
    { href: routes.eCommerce.products, name: 'Products' },
    { name: 'Edit' },
  ],
};
