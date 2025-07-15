'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import TableLayout from '../tables/table-layout';
import ActivityTable from '@/app/shared/custom-realsmile-components/liste/activity-list/table';
import { fetchActivitiesData } from '@/app/shared/custom-realsmile-components/liste/activity-list/activity-data';

const pageHeader = {
  title: 'Liste des activités',
  breadcrumb: [
    {
      name: 'Toutes les activités',
    },
  ],
};

export default function ActivityPage() {
  const [activitiesData, setActivitiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const data = await fetchActivitiesData();
          setActivitiesData(data);
        } catch (error) {
          console.error('Failed to fetch activities data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      console.log('No session or token available');
      setIsLoading(false);
    }
  }, [user]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={activitiesData}
      fileName="activity_data"
      header="Titre,Description,Image,Date,Notification Owner" // Update this based on your activity data structure
    >
      <ActivityTable data={activitiesData} isLoading={isLoading} />
    </TableLayout>
  );
}
