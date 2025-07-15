'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import {
  fetchInTreatmentLaboCasesData,
  fetchLaboCasesData,
} from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-case-data';
import CasesLaboTable from '@/app/shared/custom-realsmile-components/liste/labo-list/table';
import { useAuth } from '@/context/AuthContext';
import InConstructionLaboTable from '@/app/shared/custom-realsmile-components/liste/labo-list/inconstruction/table';

const pageHeader = {
  title: 'In Construction Cases',
  breadcrumb: [
    {
      name: 'All in construction cases',
    },
  ],
};

export default function EnhancedTablePage() {
  const [casesIntreatmentLaboData, setCasesInTreatmentLaboData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchInTreatmentLaboCasesData(user);
      setCasesInTreatmentLaboData(data);
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
      <InConstructionLaboTable
        data={casesIntreatmentLaboData}
        isLoading={isLoading}
      />
    </TableLayout>
  );
}
