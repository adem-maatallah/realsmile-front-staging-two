import axios from 'axios';

export type LaboIiwglType = {
  url: string;
  createdAt: string; // Keeping as string for compatibility, convert to Date as needed in logic
  doctorStatus: string;
  adminStatus: string;
  id: string;
  admin_note: string;
  doctor_note: string;
};

const fetchLaboIIwglsData = async (caseId: string, token?: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `/laboratories/laboratoryCaseIiwgl/${caseId}`;
  const url = `${apiUrl}${endpoint}`;

  const response = await axios.get(url, {
    withCredentials: true,
  });
  return response;
};

export { fetchLaboIIwglsData };
