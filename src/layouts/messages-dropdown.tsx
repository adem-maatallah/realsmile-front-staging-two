'use client';

import Link from 'next/link';
import { RefObject, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Title, Text, Popover, Avatar, Badge } from 'rizzui';
import cn from '@/utils/class-names';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { PiCheck } from 'react-icons/pi';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';
import { useAuth } from '@/context/AuthContext';

dayjs.extend(relativeTime);

function TicketsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [tickets, setTickets] = useState([]);
  const {user} = useAuth()

  useEffect(() => {
    if (
      user?.id &&
      (user?.role === 'doctor' || user?.role === 'admin')
    ) {
      let ticketsQuery;
      if (user?.role === 'doctor') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('ctid', '!=', ''),
          where('cuid', '==', user.id),
          orderBy('tLt', 'desc')
        );
      } else if (user?.role === 'admin') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('ctid', '!=', ''),
          where('L1', 'array-contains', user.id),
          orderBy('tLt', 'desc')
        );
      }

      if (ticketsQuery) {
        const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
          const ticketsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTickets(ticketsData);
        });

        return () => unsubscribe();
      }
    }
  }, [user?.id, user?.role]);

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-2 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Tickets
        </Title>
        <Link href="/support" className="hover:underline">
          Voir Tous
        </Link>
      </div>
      <SimpleBar className="max-h-[406px]">
        <div className="grid grid-cols-1 ps-4">
          {tickets.map((ticket) => (
            <Link href={`/support?ticket=${ticket.id}`} key={ticket.id}>
              <div className="group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md px-2 py-2.5 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <div className="w-full">
                    <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                      {ticket.tt}
                    </Text>
                    <div className="flex">
                      <Text className="w-10/12 truncate pe-7 text-xs text-gray-500">
                        {ticket.td || 'Aucune description'}
                      </Text>
                      <Text className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
                        {ticket.tco ? dayjs(ticket.tco).fromNow(true) : ''}
                      </Text>
                    </div>
                  </div>
                  <div className="ms-auto flex-shrink-0">
                    {user?.role === 'doctor' ? (
                      new Date(ticket[user?.id]).getTime() <
                      new Date(ticket.tLt).getTime()
                    ) : new Date(ticket[user?.id]).getTime() <
                      new Date(ticket.i1).getTime() ? (
                      <Badge
                        renderAsDot
                        size="lg"
                        color="primary"
                        className="scale-90"
                      />
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                        <PiCheck className="h-auto w-[9px]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SimpleBar>
    </div>
  );
}   

export default function MessagesDropdown({
  children,
}: {
  children: JSX.Element & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-[9999] pb-6 pe-6 ps-0 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <TicketsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
