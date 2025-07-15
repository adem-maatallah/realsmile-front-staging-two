import CreateCategory from '@/app/shared/ecommerce/category/create-category';
import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
import CreateAnnouncement from '@/app/shared/create-announcement';

export const metadata = {
  ...metaObject('Créer un annoncement'),
};

const pageHeader = {
  title: 'Créer un annoncement',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Accueil',
    },
    {
      href: '/announcement',
      name: 'Annoncement',
    },
    {
      name: 'Créer',
    },
  ],
};

export default function MarketingPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link href={'/'} className="mt-4 w-full @lg:mt-0 @lg:w-auto">
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Annuler
          </Button>
        </Link>
      </PageHeader>
      <CreateAnnouncement />
    </>
  );
}
