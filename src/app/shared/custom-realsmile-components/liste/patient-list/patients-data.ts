import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
export type PatientType = {
  patient: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    creationDate: string; // Keeping as string for direct usage, consider converting to Date in the application logic if needed
  };
  doctor: {
    name: string;
    avatar: string;
    phone: string;
  };
};

const fetchPatientsData = async (token?: any) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/patients';
    const url = `${apiUrl}${endpoint}`;
    const response = await axiosInstance.get('/patients');

    const formattedPatientsData = response.data.data.patients.map(
      (patient: {
        id: any;
        patient: { name: any; avatar: any; phone: any; creationDate: any };
        doctor: { name: any; avatar: any; phone: any };
      }) => ({
        patient: {
          id: patient.id,
          name: patient.patient.name,
          avatar: patient.patient.avatar,
          phone: patient.patient.phone,
          creationDate: patient.patient.creationDate,
        },
        doctor: {
          id: patient.doctor.id,
          name: patient.doctor.name,
          avatar: patient.doctor.avatar,
          phone: patient.doctor.phone,
        },
      })
    );
    console.log('formattedPatientDate : ', formattedPatientsData);
    return formattedPatientsData;
  } catch (error) {
    console.error('Error fetching and formatting patients data:', error);
    return [];
  }
};

export { fetchPatientsData };
