import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';

export type DoctorType = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  profile_pic: string;
  created_at: string;
  status: string;
  total_paid: number;
  total_unpaid: number;
  total_amount: number;
  currency: string;
};

const fetchDoctorsData = async (token: any, isMobile: any = false) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/doctors';
    const url = `${apiUrl}${endpoint}`;

    // Include isMobile as a request parameter if it's true
    const params = isMobile ? { isMobile: true } : {};

    const response = await axiosInstance.get(endpoint, {
      params, // Include isMobile as a request parameter
    });

    const fetchedDoctorsData = response.data.doctors.map((userItem: any) => {
      return {
        id: userItem.id,
        full_name: userItem.first_name + ' ' + userItem.last_name,
        phone: userItem.phone,
        email: userItem.email,
        country: userItem.country,
        city: userItem.city,
        profile_pic: userItem.profile_pic,
        created_at: userItem.created_at,
        status: userItem.status,
        total_paid: parseFloat(userItem.total_paid) || 0,
        total_unpaid: parseFloat(userItem.total_unpaid) || 0,
        total_amount: parseFloat(userItem.total_amount) || 0,
        currency: userItem.currency || 'EUR',
      };
    });

    return fetchedDoctorsData;
  } catch (error) {
    console.error('Error fetching doctors data:', error);
    return [];
  }
};

export { fetchDoctorsData };
