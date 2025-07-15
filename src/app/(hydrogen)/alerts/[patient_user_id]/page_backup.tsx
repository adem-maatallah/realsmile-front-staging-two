"use client";

import { routes } from '@/config/routes';
import BasicTableWidget from '@/app/shared/controlled-table/basic-table-widget';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import { PatientAlerts, fetchAlertsData } from './alerts-data';
import { useCallback, useEffect, useState } from 'react';
import { Loader } from 'rizzui';
import { getAlertColumns } from './columns';
import AvatarCard from '@core/ui/avatar-card';
import axios from 'axios';
import { useTable } from '@/hooks/use-table';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await axios.get(url, { withCredentials: true });
  return response.data.data; // Adjust this according to your API response structure
};
const pageHeader = {
  title: 'Alerts',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      name: 'Tables',
    },
  ],
};

export default function BasicTablePage() {
  // const [patientAlerts, setPatientAlerts] = useState<PatientAlerts[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await fetchAlertsData();
  //       console.log('Fetched data from API:', data); // Log the fetched data
  //       setPatientAlerts(data);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);
  const { data: patientAlerts, mutate, error } = useSWR<PatientAlerts[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/alerts/99/doctor`,
    fetcher
  );
  console.log("patientAlerts: ", patientAlerts)
    // const {
    //   isFiltered,
    //   tableData,
    //   currentPage,
    //   totalItems,
    //   handlePaginate,
    //   filters,
    //   updateFilter,
    //   searchTerm,
    //   handleSearch,
    //   sortConfig,
    //   handleSort,
    //   selectedRowKeys,
    //   setSelectedRowKeys,
    //   handleRowSelect,
    //   handleSelectAll,
    //   handleDelete,
    //   handleReset,
    // } = useTable(patientAlerts);
    // Wrap the onHeaderCellClick function inside a useCallback
    // const onHeaderCellClick = useCallback(
    //   (value: string) => ({
    //     onClick: () => handleSort(value),
    //   }),
    //   [handleSort]
    // );
  // Implement the `onDeleteItem` function
  const onDeleteItem = async (alertId: number) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert('Alert deleted successfully!');
        // Update the state to remove the deleted alert
              // Trigger SWR revalidation to fetch updated data
      mutate();

      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('An error occurred while deleting the alert.');
    }
  };

// Implement the `onResolveAlert` function
// Implement the `onResolveAlert` function
const onResolveAlert = async (alertId: number) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}/resolve`;
    const requestBody = { withCredentials: true };

    // Log the request details
    console.log("Request URL: ", url);
    console.log("Request Body: ", requestBody);

    const response = await axios.post(url, requestBody, {
      withCredentials: true,
    });

    console.log("Response: ", response);

    if (response.status === 200) {
      alert("Alert resolved successfully!");

      // Trigger SWR revalidation to fetch updated data
      mutate(
        (prevData) => {
          const updatedData = prevData?.map((patient) => ({
            ...patient,
            alerts: patient.alerts.map((alert) =>
              alert.id === Number(alertId) ? { ...alert, resolved: true } : alert
            ),
          }));

          // Log the updated local data
          console.log("Updated local data: ", updatedData);

          return updatedData;
        },
        false // Skip revalidation
      );
    }
  } catch (error) {
    console.error("Error resolving alert:", error);
    alert("An error occurred while resolving the alert.");
  }
};



  // if (isLoading) {
  //   return (
  //     <div className="grid h-10 place-content-center">
  //       <Loader variant="spinner" />
  //     </div>
  //   );
  // }

  return (

      <div className="grid grid-cols-1 gap-6 3xl:gap-8">
        {patientAlerts?.map((patient) => (
          <div key={patient.patient_id}>
            <BasicTableWidget
              key={patient.patient_name}
              title={`Alerts for ${patient.patient_name}`}
              data={patient.alerts}
              getColumns={() =>
                getAlertColumns({
                  onDeleteItem,
                  onResolveAlert,
                  // onHeaderCellClick,
                })
              }
              enableSearch={true}
              enablePagination
              className="min-h-[480px] [&_.widget-card-header_h5]:font-medium"
              extraHeaderContent={
                <AvatarCard
                  src={patient.patient_picture}
                  name=""
                />
              }
            />
          </div>
        ))}
      </div>
  );
}
