import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';

const useFetchTickets = (userId, role) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q;
    if (role === 'admin') {
      q = query(
        collection(db, 'tickets'),
        orderBy('i1', 'desc')
      );
    } else if (role === 'doctor') {
      q = query(
        collection(db, 'tickets'),
        where('cuid', '==', userId),
        orderBy('i1', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ticketsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(ticketsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tickets:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, role]);

  return { tickets, loading, error };
};

export default useFetchTickets;
