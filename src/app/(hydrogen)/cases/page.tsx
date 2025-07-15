'use client';
import React, { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/cases-list/table';
import Link from 'next/link';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';
import { useAuth } from '@/context/AuthContext';

const pageHeader = {
  title: 'Liste des cas',
  breadcrumb: [
    {
      name: 'Tous les cas',
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
        null
      );
      setCasesData(data);
      setIsLoading(false);
    };
    if (user?.id) fetchData();
  }, [doctorId, user?.id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex">
          <Link href={routes.cases.createCase(null)} passHref>
            {user?.role === 'doctor' && (
              <Button className="mt-0">
                <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
                Créer un cas
              </Button>
            )}
          </Link>
        </div>
      </PageHeader>
      <CasesTable
        data={casesData}
        isLoading={isLoading}
        setCasesData={setCasesData}
        caseData={casesData}
      />
    </>
  );
}
