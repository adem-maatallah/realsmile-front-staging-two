"use client";

import useSWR, { mutate } from "swr";
import axios from "axios";
import { getAlertColumns } from "./columns";
import BasicTableWidget from "@/components/controlled-table/basic-table-widget";
import AvatarCard from "@/components/ui/avatar-card";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await axios.get(url, { withCredentials: true });
  return response.data.data; // Adjust this according to your API response structure
};

export default function AlertsPage() {
  const {user} = useAuth();
  const params = useParams(); // Extracts 'id' from the URL

  const id = params?.patient_user_id
  console.log('params:', params);
  const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/alerts/${user?.id}/${id}/doctor`;
  const { data: patientAlerts, mutate, error } = useSWR(apiEndpoint, fetcher);

  // Debug the fetched data
  console.log("Fetched patientAlerts:", patientAlerts);

  // Handle alert resolution
  const onResolveAlert = async (alertId: number) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}/resolve`;

      const response = await axios.post(url, {}, { withCredentials: true });

      if (response.status === 200) {
        toast.success('Alert resolved successfully!');

        // Revalidate data by fetching from the server
        await mutate(apiEndpoint);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
      alert("An error occurred while resolving the alert.");
    }
  };

  // Handle alert deletion
  const onDeleteItem = async (alertId: number) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Alert deleted successfully!");

        // Revalidate data by fetching from the server
        await mutate(apiEndpoint);
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("An error occurred while deleting the alert.");
    }
  };

  if (!patientAlerts) {
    // Show a loading state while data is being fetched
    return (
      <div className="grid h-10 place-content-center">
        <div>Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    // Handle errors gracefully
    return (
      <div className="grid h-10 place-content-center">
        <div>Error loading alerts.</div>
      </div>
    );
  }

  // Ensure patientAlerts is an array before rendering
  const alertsData = Array.isArray(patientAlerts) ? patientAlerts : [];

  return (
    <div className="grid grid-cols-1 gap-6 3xl:gap-8">
      {alertsData.map((patient) => (
        <div key={patient.patient_id}>
          <BasicTableWidget
            title={`Alerts for ${patient.patient_name}`}
            data={patient.alerts}
            getColumns={() =>
              getAlertColumns({
                onDeleteItem,
                onResolveAlert,
              })
            }
            enableSearch={true}
            enablePagination
            className="min-h-[480px] [&_.widget-card-header_h5]:font-medium"
            extraHeaderContent={
              <AvatarCard src={patient.patient_picture} name="" />
            }
          />
        </div>
      ))}
    </div>
  );
}
