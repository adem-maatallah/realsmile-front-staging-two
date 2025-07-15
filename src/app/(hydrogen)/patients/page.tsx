'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import PatientTable from '@/app/shared/custom-realsmile-components/liste/patient-list/table';
import UserTableLayout from '@/app/(hydrogen)/tables/user-table-layout';
import { fetchPatientsData } from '@/app/shared/custom-realsmile-components/liste/patient-list/patients-data';
import { useAuth } from '@/context/AuthContext';

const pageHeader = {
  title: 'Liste des patients',
  breadcrumb: [
    {
      name: 'Tous les patients',
    },
  ],
};

export default function EnhancedTablePage() {
  const [patientsData, setPatientsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const data = await fetchPatientsData();
          setPatientsData(data);
        } catch (error) {
          console.error('Failed to fetch patients data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <UserTableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="invoice_data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <PatientTable data={patientsData} isLoading={isLoading} />
    </UserTableLayout>
  );
}
