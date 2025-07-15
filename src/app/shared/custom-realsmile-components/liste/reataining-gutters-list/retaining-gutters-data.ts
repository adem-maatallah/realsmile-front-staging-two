import axios from 'axios';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';

export type RetainingGuttersDataType = {
    id: string;
    created_at: string;
    patient: {
        name: string;
        date_of_birth: string;
    };
    doctor: {
        name: string;
        avatar: string;
        phone: string;
    };
    stls: any[];
};

const fetchRetainingGuttersDataData = async (
    doctorId?: string | null,
    token?: any
): Promise<RetainingGuttersDataType[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = '/retainingGutters';
        let url = `${apiUrl}${endpoint}`;

        // Make the API call
        const response = await axios.get(url, {
            withCredentials: true,
        });

        // Map the response data to the RetainingGuttersDataType structure
        return response.data.retainingGutters.map((gutter: any) => ({
            id: gutter.id,
            created_at: gutter.created_at,
            patient: {
                name: gutter.patient.name,
                date_of_birth: gutter.patient.date_of_birth,
            },
            doctor: {
                name: gutter.doctor.name,
                avatar: gutter.doctor.avatar,
                phone: gutter.doctor.phone,
            },
            stls: gutter.stls,
            status: gutter.status,
        }));
    } catch (error) {
        console.error('Error fetching retaining gutters data:', error);
        return [];
    }
};

export { fetchRetainingGuttersDataData };
