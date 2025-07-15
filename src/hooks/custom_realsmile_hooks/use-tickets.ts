import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';

interface Ticket {
  id: string;
  data: any;
}

const useTickets = (currentUserID: string) => {
  const [ticketDocList, setTicketDocList] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ticketsQuery = query(
      collection(db, 'tickets'),
      where('cuid', '==', currentUserID),
      orderBy('tLt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const tickets: Ticket[] = [];
        querySnapshot.forEach((doc) => {
          tickets.push({ id: doc.id, data: doc.data() });
        });
        setTicketDocList(tickets);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserID]);

  return { ticketDocList, isLoading };
};

export default useTickets;
