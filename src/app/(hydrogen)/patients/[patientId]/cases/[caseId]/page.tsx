'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/cases-list/table';
import { useAuth } from '@/context/AuthContext';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Liste des cas',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Accueil',
    },
    {
      name: 'Tous les cas',
    },
  ],
};

export default function EnhancedTablePage() {
  const [casesData, setCasesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const data: any = await fetchCasesData(
        null,
        null,
        null,
        user
      );
      setCasesData(data);
      setIsLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="cases_data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <CasesTable data={casesData} isLoading={isLoading} />
    </TableLayout>
  );
}
