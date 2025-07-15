'use client';
import React, { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { useAuth } from '@/context/AuthContext';
import ModalButton from '@/app/shared/modal-button';
import IiwglModal from '@/app/shared/custom-realsmile-components/modals/IiwglModal';
import Link from 'next/link';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';
import DevisTable from '@/app/shared/custom-realsmile-components/liste/devis-list/table';
import { fetchDevis } from '@/app/shared/custom-realsmile-components/liste/devis-list/devis-data';

const pageHeader = {
  title: 'Liste des devis',
  breadcrumb: [
    {
      name: 'Tous les devis',
    },
  ],
};

export default function EnhancedTablePage() {
  const [devisData, setDevisData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()
  useEffect(() => {
    const fetchData = async () => {
      const data: any = await fetchDevis(user);
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
      <DevisTable data={devisData} isLoading={isLoading} />
    </>
  );
}
