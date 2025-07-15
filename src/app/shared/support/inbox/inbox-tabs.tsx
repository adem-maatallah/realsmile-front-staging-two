import React, { useEffect, useCallback, useState } from 'react';
import { useTransition } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import cn from '@/utils/class-names';
import { useCreateQueryString } from '@/hooks/use-create-query-string';
import SimpleBar from '@/components/ui/simplebar';
import {
  dataAtom,
  messageIdAtom,
} from '@/app/shared/support/inbox/message-list';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';
import Image from 'next/image';
import MessageDetails from './message-details';
import { useAuth } from '@/context/AuthContext';

export default function InboxTabs({ className }: { className?: string }) {
  return <MessageDetails className={cn(className)} />;
}

interface TabListProps {
  departments: { value: string; label: string; image?: string }[];
}

export function TabList({ departments }: TabListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>('');
  const [data, setData] = useAtom(dataAtom);
  const setMessageId = useSetAtom(messageIdAtom);
  const router = useRouter();
  const pathname = usePathname();
  const { createQueryString } = useCreateQueryString();
  const searchParams = useSearchParams();

  const search = searchParams.get('department');
  const ticket = searchParams.get('ticket');
  const {user} = useAuth()

  useEffect(() => {
    if (departments.length > 0) {
      const initialTab = search || departments[0]?.value || '';
      setActiveTab(initialTab);
    }
  }, [departments, search]);

  useEffect(() => {
    if (activeTab && user) {
      let ticketQuery;

      if (session.user.role === 'doctor') {
        ticketQuery = query(
          collection(db, 'tickets'),
          activeTab !== 'Tous'
            ? where('ctid', '==', activeTab)
            : where('ctid', '!=', ''),
          where('cuid', '==', session.user.id),
          orderBy('tLt', 'desc')
        );
      } else if (session.user.role === 'admin') {
        ticketQuery = query(
          collection(db, 'tickets'),
          activeTab !== 'Tous'
            ? where('ctid', '==', activeTab)
            : where('ctid', '!=', ''),
          where('L1', 'array-contains', session.user.id),
          orderBy('i1', 'desc')
        );
      } else {
        ticketQuery = query(
          collection(db, 'tickets'),
          activeTab !== 'Tous'
            ? where('ctid', '==', activeTab)
            : where('ctid', '!=', ''),
          where('cuid', '==', session.user.id),
          orderBy('i1', 'desc')
        );
      }

      const unsubscribeTickets = onSnapshot(
        ticketQuery,
        async (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setData(tickets);
          if (ticket) {
            setMessageId(ticket);
          } else {
            setMessageId(tickets[0]?.id || '');
          }

          if (!ticket && tickets.length > 0) {
            router.push(`?department=${activeTab}&ticket=${tickets[0]?.id}`);
          }
        }
      );

      return () => {
        unsubscribeTickets();
      };
    }
  }, [activeTab, ticket, session, setData, setMessageId, router]);

  const handleClick = useCallback(
    (item: { value: string }) => {
      router.push(pathname + '?' + createQueryString('department', item.value));
      setActiveTab(item.value);
    },
    [createQueryString, pathname, router]
  );

  return (
    <SimpleBar>
      <nav className="flex items-center gap-5 border-b border-gray-300">
        {departments.map((nav) => (
          <TabButton
            key={nav.value}
            item={nav}
            isActive={activeTab === nav.value}
            onClick={() => handleClick(nav)}
            disabled={isPending}
          />
        ))}
      </nav>
    </SimpleBar>
  );
}

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  item: {
    value: string;
    label: string;
    image?: string;
  };
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ item, isActive, onClick, ...props }: TabButtonProps) {
  return (
    <button
      className={cn(
        'relative flex items-center gap-2 py-2 text-sm outline-none',
        isActive
          ? 'font-medium text-gray-900'
          : 'text-gray-500 hover:text-gray-800'
      )}
      onClick={onClick}
      {...props}
    >
      {item.image && (
        <Image
          src={item.image}
          alt={item.label}
          className="h-6 w-6 rounded-full"
          width={24}
          height={24}
        />
      )}
      <span className="whitespace-nowrap">{item.label}</span>
      {isActive && (
        <span className="absolute -bottom-px left-0 h-0.5 w-full bg-primary" />
      )}
    </button>
  );
}
