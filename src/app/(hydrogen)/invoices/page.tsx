'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/app/shared/page-header';
import { fetchInvoices } from '@/app/shared/custom-realsmile-components/liste/invoices-list/invoices-data';
import InvoicesTable from "@/app/shared/custom-realsmile-components/liste/invoices-list/table";

const pageHeader = {
  title: 'Liste des factures',
  breadcrumb: [
    {
      name: 'Tous les factures',
    },
  ],
};

export default function EnhancedTablePage() {
  const [devisData, setDevisData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()
  useEffect(() => {
    const fetchData = async () => {
      const data: any = await fetchInvoices(user);
      setDevisData(data);
      setIsLoading(false);
    };
    if (user) fetchData();
  }, [user]);
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex"></div>
      </PageHeader>
      <InvoicesTable data={devisData} isLoading={isLoading} />
    </>
  );
}
