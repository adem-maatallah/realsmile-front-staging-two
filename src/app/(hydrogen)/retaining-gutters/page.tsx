'use client';
import React, { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchRetainingGuttersDataData } from '@/app/shared/custom-realsmile-components/liste/reataining-gutters-list/retaining-gutters-data';
import RetainingGuttersTable from '@/app/shared/custom-realsmile-components/liste/reataining-gutters-list/table';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';

const pageHeader = {
  title: 'Liste des gouttières de contention',
  breadcrumb: [
    {
      name: 'Toutes les gouttières de contention',
    },
  ],
};

export default function EnhancedTablePage() {
  const [guttersData, setGuttersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const role = user?.role;
  const doctorId = role === 'doctor' ? user?.id : null;

  useEffect(() => {
    const fetchData = async () => {
      const data: any = await fetchRetainingGuttersDataData(doctorId?.toString(), user);
      setGuttersData(data);
      setIsLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  return (
      <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
          <div className="flex">
            <Link href={routes.reatainingGutters.create} passHref>
              {user?.role === 'doctor' && (
                  <Button className="mt-0">
                    <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
                    Créer une goutière de contention
                  </Button>
              )}
            </Link>
          </div>
        </PageHeader>
        <RetainingGuttersTable
            data={guttersData}
            isLoading={isLoading}
            setCasesData={setGuttersData}
            caseData={guttersData}
        />
      </>
  );
}
