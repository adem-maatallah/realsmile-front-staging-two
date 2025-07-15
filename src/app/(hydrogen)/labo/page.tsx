'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchLaboCasesData } from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-case-data';
import CasesLaboTable from '@/app/shared/custom-realsmile-components/liste/labo-list/table';
import { useAuth } from '@/context/AuthContext';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Laboratory Cases',
  breadcrumb: [
    {
      name: 'All laboratory cases',
    },
  ],
};

export default function EnhancedTablePage() {
  const [casesLaboData, setCasesLaboData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchLaboCasesData(user);
      setCasesLaboData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="cases_data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <CasesLaboTable data={casesLaboData} isLoading={isLoading} />
    </TableLayout>
  );
}
