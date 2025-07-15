import TableLayout from '@/app/(hydrogen)/tables/user-table-layout';
import CommercialsTable from '@/app/shared/custom-realsmile-components/liste/commercials-list/table';
import { metaObject } from '@/config/site.config';
import CommercialTableLayout from '../tables/commercial-table-layout';

export const metadata = {
  ...metaObject('Liste des commerciaux'),
};

const pageHeader = {
  title: 'Liste des commerciaux',
  breadcrumb: [
    {
      href: '/',
      name: 'Accueil',
    },
    {
      name: 'Commerciaux',
    },
  ],
};

export default function EnhancedTablePage() {
  return (
    <CommercialTableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
    >
      <CommercialsTable />
    </CommercialTableLayout>
  );
}
