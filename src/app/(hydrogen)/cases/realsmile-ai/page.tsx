'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from '@/app/shared/page-header';
import AICasesTable from '@/app/shared/custom-realsmile-components/liste/ai-cases-list/table';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const pageHeader = {
  title: 'Liste des cas RealSmile AI',
  breadcrumb: [
    {
      name: 'Tous les cas RealSmile AI',
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
      try {
        const response = await axiosInstance.get('/cases/realsmile-ai', {
          params: {
            doctorId: doctorId?.toString(),
          },
        });
        setCasesData(response.data.cases);
      } catch (error) {
        console.error('Error fetching cases data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, doctorId]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <AICasesTable
        data={casesData}
        isLoading={isLoading}
        setCasesData={setCasesData}
        caseData={casesData}
      />
    </>
  );
}
