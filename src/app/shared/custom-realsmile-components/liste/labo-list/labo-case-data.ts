import axios from 'axios';
import { getRandomArrayElement } from '@/utils/get-random-array-element';
import { avatarIds } from '@/utils/get-avatar';

export type LaboCaseType = {
  id: string;
  created_at: string;
  note: string;
  patient_id: string;
  case_ref: string;
  patient: {
    name: string;
    avatar: string;
    phone: string;
  };
  require_smile_set_upload: string;
  isLate: any;
  time: string;
};
const fetchLaboCasesData = async (token: any) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/cases/laboCases';
    const url = `${apiUrl}${endpoint}?fetchAll=true`;
    const response = await axios.get(url, {
      withCredentials: true,
    });

    console.log('Raw response data:', response.data.cases); // Log raw response data for debugging

    const fetchedCasesData = response.data.cases.map(
      (caseItem: {
        time: any;
        isLate: any;
        require_smile_set_upload: any;
        patient: any;
        id: { toString: () => any };
        created_at: string | number | Date;
        note: any;
        patient_id: any;
        case_ref: any;
      }) => {
        // Log each caseItem for debugging
        console.log('Processing caseItem:', caseItem);

        return {
          id: caseItem.id.toString(),
          created_at: new Date(caseItem.created_at).toISOString(),
          note: caseItem.note,
          patient_id: caseItem.patient_id,
          patient: {
            name: caseItem.patient?.name || 'Unknown',
            avatar:
              caseItem.patient?.avatar || getRandomArrayElement(avatarIds),
            phone: caseItem.patient?.phone || 'Unknown',
          },
          require_smile_set_upload: caseItem.require_smile_set_upload,
          isLate: caseItem.isLate,
          time: caseItem.time,
        };
      }
    );

    console.log('Fetched cases data:', fetchedCasesData);
    return fetchedCasesData;
  } catch (error) {
    console.error('Error fetching cases data:', error);
    return [];
  }
};

const fetchInTreatmentLaboCasesData = async (token: any) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/laboratories/laboCasesInTreatment';
    const url = `${apiUrl}${endpoint}?fetchAll=true`;
    const response = await axios.get(url, {
      withCredentials: true,
    });

    console.log('Raw response data:', response.data.cases); // Log raw response data for debugging

    const fetchedCasesData = response.data.cases.map(
      (caseItem: {
        filePath: any;
        time: any;
        isLate: any;
        require_smile_set_upload: any;
        patient: any;
        id: { toString: () => any };
        created_at: string | number | Date;
        note: any;
        patient_id: any;
        case_ref: any;
      }) => {
        // Log each caseItem for debugging
        return {
          id: caseItem.id.toString(),
          created_at: new Date(caseItem.created_at).toISOString(),
          note: caseItem.note,
          patient_id: caseItem.patient_id,
          patient: {
            name: caseItem.patient?.name || 'Unknown',
            avatar:
              caseItem.patient?.avatar || getRandomArrayElement(avatarIds),
            phone: caseItem.patient?.phone || 'Unknown',
          },
          require_smile_set_upload: caseItem.require_smile_set_upload,
          isLate: caseItem.isLate,
          time: caseItem.time,
          filePath: caseItem.filePath,
          pdfFile: caseItem.pdfFile,
        };
      }
    );

    return fetchedCasesData;
  } catch (error) {
    console.error('Error fetching cases data:', error);
    return [];
  }
};

export { fetchLaboCasesData, fetchInTreatmentLaboCasesData };
