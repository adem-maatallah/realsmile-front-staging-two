import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';

export type UserType = {
  last_name: string;
  first_name: string;
  id: String;
  full_name: string;
  phone: string;
  role: string;
  email: string;
  profile_pic: string;
  created_at: string;
  status: string;
  has_mobile_account: boolean;
};
const fetchUsersData = async () => {
  try {
    const response = await axiosInstance.get('/users');

    return response.data.data;
  } catch (error) {
    console.error('Error fetching cases data:', error);
    return [];
  }
};

export { fetchUsersData };
