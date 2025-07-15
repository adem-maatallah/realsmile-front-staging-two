'use client';
import { useEffect, useState } from 'react';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { useAuth } from '@/context/AuthContext';
import DefaultCasesTable from '@/app/shared/custom-realsmile-components/liste/default-cases-list/table';

const pageHeader = {
  title: 'En Fabrication',
  breadcrumb: [
    {
      name: 'En Fabrication',
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
        'in_construction'
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
      <DefaultCasesTable data={casesData} isLoading={isLoading} />
    </TableLayout>
  );
}
