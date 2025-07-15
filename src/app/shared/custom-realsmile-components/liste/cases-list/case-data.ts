import axios from 'axios';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';
import axiosInstance from '@/utils/axiosInstance';

export type CaseType = {
  id: string;
  status: string;
  created_at: string;
  patient: {
    name: string;
    avatar: string;
    phone: string;
  };
  doctor: {
    name: string;
    avatar: string;
    phone: string;
  };
  note?: string;
  type?: string;
  ordre?: string;
  status_created_at: string;
};

type LinkDetail = {
  pdfFile: any;
  adminStatus: any;
  id: string;
  url: string;
  created_at: string;
  status: string;
};

export type CaseDetailsType = {
  case_status_created_at: any;
  movement_chart_summary: any;
  smile_summary: any;
  created_at: any;
  id: any;
  profile_pic: string;
  pack_name: string;
  latest_devis_id: string;
  patient_name?: string;
  patient_phone?: string;
  case_cause_de_consultation?: string;
  patient_email?: string;
  case_status?: string;
  images: { [key: string]: string };
  stls?: any[];
  links?: Record<string, LinkDetail>;
  linkedCases?: any[];
  case_type?: any;
  shipping_link?: string;
  doctor_country?: string;
  general_instructions?: string;
  arch_selection?: string;
  additional_images?: string[];
  status_histories: { status: string; created_at: string }[];
  is_refused: boolean;
} | null;

const fetchCasesData = async (
  patientId?: string | null,
  doctorId?: string | null,
  caseStatus?: string | null
): Promise<CaseType[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/cases';
    let url = `${apiUrl}${endpoint}?fetchAll=true`;
    if (patientId) {
      url += `&patientId=${patientId}`;
    }
    if (doctorId) {
      url += `&doctorId=${doctorId}`;
    }
    if (caseStatus) {
      url += `&caseStatus=${caseStatus}`;
    }

    // Make the API call
    const response = await axiosInstance.get(url);

    // Map the response data to the CaseType structure
    return response.data.cases.map((caseItem: any) => ({
      id: caseItem.id.toString(),
      status: caseItem.status,
      created_at: new Date(caseItem.created_at).toISOString(),
      patient: {
        name: caseItem.patient?.name || 'Unknown',
        avatar: caseItem.patient?.avatar || getRandomArrayElement(avatarIds),
        phone: caseItem.patient?.phone || 'Unknown',
      },
      doctor: {
        user: {
          id: caseItem?.doctor?.user?.id,
        },
        name: caseItem.doctor?.name || 'Unknown',
        avatar: caseItem.doctor?.avatar || getRandomArrayElement(avatarIds),
        phone: caseItem.doctor?.phone || 'Unknown',
      },
      note: caseItem.note,
      devis: caseItem.devis,
      type: caseItem.type,
      status_created_at: new Date(caseItem.status_created_at).toISOString(),
      hasInvoice: caseItem.hasInvoice,
      video_id: caseItem.video_id,
      is_refused: caseItem.is_refused,
      treatment_exists: caseItem.treatment_exists,
      treatment_started: caseItem.treatment_started,
    }));
  } catch (error) {
    console.error('Error fetching cases data:', error);
    return [];
  }
};

const fetchSubCases = async (caseId: any) => {
  if (!caseId) {
    console.error('caseId is required');
    return [];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = `/cases/getSubCases/${caseId}`;
    const url = `${apiUrl}${endpoint}`;
    const response = await axiosInstance.get(url);
    return response.data.map((caseItem: any) => ({
      id: caseItem.id.toString(),
      status: caseItem.status,
      created_at: new Date(caseItem.created_at).toISOString(),
      patient: {
        name: caseItem.patient?.name || 'Unknown',
        avatar: caseItem.patient?.avatar || 'default-avatar-url',
        phone: caseItem.patient?.phone || 'Unknown',
      },
      doctor: {
        user: {
          id: caseItem?.doctor?.user?.id,
        },
        name: caseItem.doctor?.name || 'Unknown',
        avatar: caseItem.doctor?.avatar || 'default-avatar-url',
        phone: caseItem.doctor?.phone || 'Unknown',
      },
      note: caseItem.note,
      devis: caseItem.devis,
      type: caseItem.type,
      ordre: caseItem.order,
      general_instructions: caseItem.general_instructions,
      arch_selection: caseItem.arch_selection,
      additional_images: caseItem.additional_images
    }));
  } catch (error) {
    console.error('Error fetching cases data:', error);
    return [];
  }
};
const fetchCaseDetails = async (caseId: string): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `/cases/${encodeURIComponent(caseId)}`;
  const url = `${apiUrl}${endpoint}`;
  const response = await axiosInstance.get(url);
  return response;
};
export { fetchCaseDetails, fetchCasesData, fetchSubCases };
