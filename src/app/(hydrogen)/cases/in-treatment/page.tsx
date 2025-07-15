'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/cases-list/table';
import IncompleteCasesTable from '@/app/shared/custom-realsmile-components/liste/incomplete-cases-list/table';
import NeedsApprovalCasesTable from "@/app/shared/custom-realsmile-components/liste/needs-approval-cases/table";
import DefaultCasesTable from "@/app/shared/custom-realsmile-components/liste/default-cases-list/table";
import { useAuth } from '@/context/AuthContext';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Liste des Cas En Traitement',
  breadcrumb: [

    {
      name: 'Tous les Cas En Traitement',
    },
  ],
};

export default function EnhancedTablePage() {
  const [casesData, setCasesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const userRole = user?.role;
  const doctorId = userRole === 'doctor' ? user?.id : null;
  useEffect(() => {
    const fetchData = async () => {
      const data: any = await fetchCasesData(
        null,
        doctorId?.toString(),
        'in_treatment'
      );
      setCasesData(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="cases_data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <DefaultCasesTable data={casesData} isLoading={isLoading} />
    </TableLayout>
  );
}
