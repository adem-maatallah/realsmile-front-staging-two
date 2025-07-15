import axiosInstance from '@/utils/axiosInstance';

export const fetchActivitiesData = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/notifications');

    // Map the response data to match the activity structure
    return response.data;
  } catch (error) {
    console.error('Error fetching activities data:', error);
    return [];
  }
};
