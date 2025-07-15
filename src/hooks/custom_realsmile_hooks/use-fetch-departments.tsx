// hooks/useFetchDepartments.ts
import { useState, useEffect } from 'react';
import { db } from '@/utils/firestore/db';
import { doc, getDoc } from 'firebase/firestore';

export default function useFetchDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const docRef = doc(db, '/userapp/appsettings');
        const docSnap = await getDoc(docRef);
        const departmentsData = docSnap
          .data()
          ?.u52.filter((key) => key.tct !== 'Default')
          .map((key) => ({
            value: key.tct,
            label: key.tct,
            image: key.tul,
          }));

        if (departmentsData) {
          departmentsData.unshift({
            value: 'Tous',
            label: 'Tous',
            image: '', // Add an appropriate image URL if needed
          });
        }

        setDepartments(departmentsData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
}
