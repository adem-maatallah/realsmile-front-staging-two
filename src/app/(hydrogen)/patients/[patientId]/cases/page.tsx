'use client';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { invoiceData } from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/cases-list/table';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getRandomArrayElement } from '@/utils/get-random-array-element';
import { avatarIds } from '@/utils/get-avatar';
import axiosInstance from '@/utils/axiosInstance';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Liste des cas du patient  ',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Accueil',
    },
    {
      href: routes.patients.list,
      name: 'liste des patients',
    },
    {
      name: 'Tous les cas du patient',
    },
  ],
};

export default function EnhancedTablePage() {
  const [casesData, setCasesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { patientId }: any = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = '/cases';
        let url = `${apiUrl}${endpoint}?fetchAll=true`;
        if (patientId) {
          url += `&patientId=${patientId}`;
        }
        const response = await axiosInstance.get(url);
        const caseData = response.data.cases.map((caseItem: any) => ({
          id: caseItem.id.toString(),
          status: caseItem.status,
          created_at: new Date(caseItem.created_at).toISOString(),
          status_created_at: new Date(caseItem.status_created_at).toISOString(),
          patient: {
            name: caseItem.patient?.name || 'Unknown',
            avatar:
              caseItem.patient?.avatar || getRandomArrayElement(avatarIds),
            phone: caseItem.patient?.phone || 'Unknown',
          },
          doctor: {
            user: {
              id: caseItem.doctor?.user?.id || 'Unknown',
            },
            name: caseItem.doctor?.name || 'Unknown',
            avatar: caseItem.doctor?.avatar || getRandomArrayElement(avatarIds),
            phone: caseItem.doctor?.phone || 'Unknown',
          },
          note: caseItem.note,
          type: caseItem.type,
        }));
        setCasesData(caseData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching case details:', error);
        setIsLoading(false);
        if (error.response) {
          const { status } = error.response;
          if (status == 404 || status == 400) {
            window.location.replace('/not-found');
            router.replace('/not-found');
          } else if (status == 403) {
            window.location.replace('/access-denied');
            router.replace('/access-denied');
          }
        } else {
          window.location.replace('/access-denied');
          router.replace('/access-denied');
        }
      }
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
      <CasesTable data={casesData} isLoading={isLoading} />
    </TableLayout>
  );
}
