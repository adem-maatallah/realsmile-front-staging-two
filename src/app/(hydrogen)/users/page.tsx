'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/user-table-layout';
import { fetchUsersData } from '@/app/shared/custom-realsmile-components/liste/users-list/users-data';
import UsersTable from '@/app/shared/custom-realsmile-components/liste/users-list/table';
import { useAuth } from '@/context/AuthContext';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Liste des tous les utilisateurs',
  breadcrumb: [
    {
      href: '/',
      name: 'Accueil',
    },
    {
      name: 'Utilisateurs',
    },
  ],
};

export default function EnhancedTablePage() {
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUsersData();
      setUsersData(data);
      setIsLoading(false);
    };

    if (user) fetchData();
  }, [user]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={usersData}
      fileName="users_Data"
      header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
    >
      <UsersTable data={usersData} isLoading={isLoading} />
    </TableLayout>
  );
}
