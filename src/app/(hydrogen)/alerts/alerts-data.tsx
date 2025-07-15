import axios from 'axios';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';

export type AlertItemType = {
  id: number;
  title: string;
  video_link: string;
  description: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
};

export interface PatientAlerts {
  patient_id: number;
  patient_name: string;
  alerts: AlertItemType[];
  patient_picture: string;
}
// type LinkDetail = {
//   pdfFile: any;
//   adminStatus: any;
//   id: string;
//   url: string;
//   created_at: string;
//   status: string;
// };

// export type CaseDetailsType = {
//   case_status_created_at: any;
//   movement_chart_summary: any;
//   smile_summary: any;
//   created_at: any;
//   id: any;
//   profile_pic: string;
//   pack_name: string;
//   latest_devis_id: string;
//   patient_name?: string;
//   patient_phone?: string;
//   case_cause_de_consultation?: string;
//   patient_email?: string;
//   case_status?: string;
//   images: { [key: string]: string };
//   stls?: any[];
//   links?: Record<string, LinkDetail>;
//   linkedCases?: any[];
//   case_type?: any;
//   shipping_link?: string;
//   doctor_country?: string;
//   general_instructions?: string;
//   arch_selection?: string;
//   additional_images?: string[];
//   status_histories: { status: string; created_at: string }[];
// } | null;

export const fetchAlertsData = async (): Promise<PatientAlerts[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/alerts/99/5003/doctor';
    const url = `${apiUrl}${endpoint}`;

    // Make the API call
    const response = await axios.get(url, { withCredentials: true });

    // Map the response data to the AlertType structure
    return response.data.data.map((alertItem: any): PatientAlerts => ({
      patient_id: alertItem.patient_id,
      patient_name: alertItem.patient_name,
      patient_picture: alertItem.patient_picture,
      alerts: alertItem.alerts.map((alert: any) => ({
        id: alert.id,
        title: alert.title,
        video_link: alert.video_link,
        description: alert.description,
        created_at: new Date(alert.created_at).toISOString(),
        updated_at: new Date(alert.updated_at).toISOString(),
        resolved: alert.resolved
      })),
    }));
  } catch (error) {
    console.error('Error fetching alerts data:', error);
    return [];
  }
};
// const fetchSubCases = async (caseId: any, token: any) => {
//   if (!caseId) {
//     console.error('caseId is required');
//     return [];
//   }

//   try {
//     console.log('caseId before API call:', caseId);
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//     const endpoint = `/cases/getSubCases/${caseId}`;
//     const url = `${apiUrl}${endpoint}`;
//     const response = await axios.get(url, {
//       headers: {
//         Authorization: 'Bearer ' + token,
//       },
//     });
//     return response.data.map((caseItem: any) => ({
//       id: caseItem.id.toString(),
//       status: caseItem.status,
//       created_at: new Date(caseItem.created_at).toISOString(),
//       patient: {
//         name: caseItem.patient?.name || 'Unknown',
//         avatar: caseItem.patient?.avatar || 'default-avatar-url',
//         phone: caseItem.patient?.phone || 'Unknown',
//       },
//       doctor: {
//         user: {
//           id: caseItem?.doctor?.user?.id,
//         },
//         name: caseItem.doctor?.name || 'Unknown',
//         avatar: caseItem.doctor?.avatar || 'default-avatar-url',
//         phone: caseItem.doctor?.phone || 'Unknown',
//       },
//       note: caseItem.note,
//       devis: caseItem.devis,
//       type: caseItem.type,
//       ordre: caseItem.order,
//       general_instructions: caseItem.general_instructions,
//       arch_selection: caseItem.arch_selection,
//       additional_images: caseItem.additional_images
//     }));
//   } catch (error) {
//     console.error('Error fetching cases data:', error);
//     return [];
//   }
// };
// const fetchCaseDetails = async (caseId: string, token: any): Promise<any> => {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//   const endpoint = `/cases/${encodeURIComponent(caseId)}`;
//   const url = `${apiUrl}${endpoint}`;
//   const response = await axios.get(url, {
//     headers: {
//       Authorization: 'Bearer ' + token,
//     },
//   });
//   return response;
// };
