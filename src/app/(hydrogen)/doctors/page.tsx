'use client';
import { useEffect, useState } from 'react';
import TableLayout from '@/app/(hydrogen)/tables/user-table-layout';
import { useAuth } from '@/context/AuthContext';
import {fetchDoctorsData} from "@/app/shared/custom-realsmile-components/liste/doctors-list/doctors-data";
import DoctorsTable from "@/app/shared/custom-realsmile-components/liste/doctors-list/table";

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Liste des tous les docteurs',
  breadcrumb: [
    {
      href: '/',
      name: 'Accueil',
    },
    {
      name: 'Docteurs',
    },
  ],
};

export default function EnhancedTablePage() {
  const [doctorsData, setDoctorsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDoctorsData();
      setDoctorsData(data);
      setIsLoading(false);
    };

    if (user) fetchData();
  }, [user]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={doctorsData}
      fileName="users_Data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <DoctorsTable data={doctorsData} isLoading={isLoading} />
    </TableLayout>
  );
}
