'use client';
import { useAtom } from 'jotai';
import { atomWithReset, atomWithStorage } from 'jotai/utils';
import { useState, useEffect, useRef } from 'react';
import { PiCaretDownBold, PiChats, PiPaperclipLight } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { Select, Title, Badge, Checkbox, ActionIcon, Text } from 'rizzui';
import cn from '@/utils/class-names';
import { useHover } from '@/hooks/use-hover';
import { useMedia } from '@/hooks/use-media';
import { getRelativeTime } from '@/utils/get-relative-time';
import rangeMap from '@/utils/range-map';
import {
  MessageType,
  supportStatuses,
  SupportStatusType,
} from '@/data/support-inbox';
import { LineGroup, Skeleton } from '@/components/ui/skeleton';
import SimpleBar from '@/components/ui/simplebar';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';
import { useAuth } from '@/context/AuthContext';

interface MessageItemProps {
  message: MessageType;
  className?: string;
}

export const messageIdAtom = atomWithStorage('messageId', '');
export const dataAtom = atomWithReset<MessageType[]>([]);
export const messagesAtom = atomWithReset<any[]>([]);

export function MessageItem({ className, message }: MessageItemProps) {
  const hoverRef = useRef(null);
  const router = useRouter();
  const isHover = useHover(hoverRef);
  const [data, setData] = useAtom(dataAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const isMobile = useMedia('(max-width: 1023px)', false);
  const [messageId, setMessageId] = useAtom(messageIdAtom);
  const {user} = useAuth()

  const isActive = messageId === message.id;

  const handleItemChange = (itemId: string) => {
    const updatedItems = data.map((item) =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    setData(updatedItems);
  };

  const fetchMessages = async (ticketId: string) => {
    const messagesQuery = collection(db, `tickets/${ticketId}/ticketChats`);
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => {
      unsubscribe();
    };
  };

  const updateTicketTimestamp = async (ticketId) => {
    const finalTimestamp = Date.now();
    const userId = user?.id;

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        [`${userId}`]: finalTimestamp,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'horodatage du ticket:",
        error
      );
    }
  };

  const handleClick = () => {
    setMessageId(message.id);
    fetchMessages(message.id);
    // Mettre à jour l'URL avec l'ID du ticket sélectionné
    router.push(`?ticket=${message.id}`, undefined, { shallow: true });

    updateTicketTimestamp(message.id);
  };

  // Déterminer s'il y a des messages non lus
  const hasUnseenMessages =
    user?.role == 'doctor'
      ? new Date(message[user?.id]).getTime() <
        new Date(message.tLt).getTime()
      : new Date(message[user?.id]).getTime() <
        new Date(message.i1).getTime();

  return (
    <div
      ref={hoverRef}
      onClick={handleClick}
      className={cn(
        className,
        'grid cursor-pointer grid-cols-[24px_1fr] items-start gap-3 border-t border-muted p-5',
        isActive && 'border-t-2 border-t-primary dark:bg-gray-100/70'
      )}
    >
      {message.selected || isHover ? (
        <Checkbox
          {...(isActive && {
            inputClassName:
              'bg-primary-lighter border-primary dark:bg-gray-0 dark:border-muted',
          })}
          {...(isActive &&
            message.selected && {
              variant: 'flat',
              color: 'primary',
            })}
          checked={message.selected}
          onChange={() => handleItemChange(message.id)}
        />
      ) : (
        <ActionIcon
          variant="flat"
          size="sm"
          className={cn('h-6 w-6 p-0', isActive && 'bg-primary text-white')}
        >
          <PiChats className="h-3.5 w-3.5" />
        </ActionIcon>
      )}
      <div>
        <div className="flex items-center justify-between lg:flex-col lg:items-start 2xl:flex-row 2xl:items-center">
          <Title as="h4" className="flex items-center">
            <span className="text-sm font-semibold dark:text-gray-700">
              {message.tt}
            </span>
            {message.hasAttachments && (
              <PiPaperclipLight className="ml-2 h-4 w-4 text-gray-500" />
            )}
            {hasUnseenMessages && (
              <Badge renderAsDot className="ml-3 h-2.5 w-2.5 bg-primary" />
            )}
          </Title>
          <span className="text-xs text-gray-500">
            {getRelativeTime(message.tco)}
          </span>
        </div>
      </div>
    </div>
  );
}

const sortOptions = {
  asc: 'asc',
  desc: 'desc',
} as const;

const options = [
  {
    value: sortOptions.asc,
    label: 'Les plus anciens',
  },
  {
    value: sortOptions.desc,
    label: 'Les plus récents',
  },
];

const sortByDate = (items: MessageType[], order: keyof typeof sortOptions) => {
  return items.slice().sort((a, b) => {
    const dateA = new Date(a.tco).valueOf();
    const dateB = new Date(b.tco).valueOf();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

interface MessageListProps {
  className?: string;
}

export default function MessageList({ className }: MessageListProps) {
  const [filteredData, setFilteredData] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<SupportStatusType>(supportStatuses.Open);
  const [selectAll, setSelectAll] = useState(false);
  const [data, setData] = useAtom(dataAtom);

  useEffect(() => {
    setFilteredData(data);
    setIsLoading(false);
  }, [data]);

  const applyStatusFilter = (filterStatus: SupportStatusType) => {
    const filteredItems = data.filter((item) => {
      return filterStatus === supportStatuses.Open
        ? !item.i3 && !item.cLb
        : item.i3 && item.cLb;
    });
    setFilteredData(filteredItems);
  };

  useEffect(() => {
    applyStatusFilter(status);
  }, [status, data]);

  useEffect(() => {
    setFilteredData((prevFilteredData) => sortByDate(prevFilteredData, sortBy));
  }, [sortBy]);

  const handleSelectAllChange = () => {
    const updatedItems = filteredData.map((item) => ({
      ...item,
      selected: !selectAll,
    }));
    setFilteredData(updatedItems);
    setSelectAll(!selectAll);
  };

  const handleClosed = () => {
    setStatus(supportStatuses.Closed);
  };

  const handleOpen = () => {
    setStatus(supportStatuses.Open);
  };

  const handleOnChange = (option: { value: 'asc' | 'desc' }) => {
    setSortBy(option.value);
  };

  return (
    <>
      <div className={cn(className, 'sticky')}>
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
            <div className="overflow-hidden rounded border border-muted">
              <button
                className={cn(
                  'px-2.5 py-1.5 text-sm font-medium text-gray-500 transition duration-300',
                  status === supportStatuses.Open && 'bg-gray-100 text-gray-900'
                )}
                onClick={handleOpen}
              >
                Ouvert
              </button>
              <button
                className={cn(
                  'px-2.5 py-1.5 text-sm font-medium text-gray-500 transition duration-300',
                  status === supportStatuses.Closed &&
                    'bg-gray-100 text-gray-900'
                )}
                onClick={handleClosed}
              >
                Fermé
              </button>
            </div>
          </div>

          <Select
            size="sm"
            variant="text"
            value={sortBy}
            options={options}
            getOptionValue={(option) => option.value}
            onChange={(option: any) => handleOnChange(option)}
            displayValue={(selected) =>
              options.find((o) => o.value === selected)?.label
            }
            suffix={<PiCaretDownBold className="ml-2 h-3.5 w-3.5" />}
            selectClassName="text-sm px-2.5"
            optionClassName="text-sm"
            dropdownClassName="p-2 !w-32 !z-0"
            placement="bottom-end"
            className={'w-auto'}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-muted">
          <SimpleBar className="max-h-[calc(100dvh-356px)] md:max-h-[calc(100dvh-311px)] lg:max-h-[calc(100dvh-240px)] xl:max-h-[calc(100dvh-230px)] 2xl:max-h-[calc(100dvh-240px)] 3xl:max-h-[calc(100dvh-270px)]">
            {isLoading ? (
              <div className="grid gap-4">
                {rangeMap(5, (i) => (
                  <MessageLoader key={i} />
                ))}
              </div>
            ) : (
              filteredData.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))
            )}
          </SimpleBar>
        </div>
      </div>
    </>
  );
}

export function MessageLoader() {
  return (
    <div className="grid gap-3 border-t border-muted p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="ml-auto h-3 w-16 rounded" />
      </div>
      <LineGroup
        columns={6}
        className="grid-cols-6 gap-1.5"
        skeletonClassName="h-2"
      />
      <LineGroup
        columns={5}
        className="grid-cols-5 gap-1.5"
        skeletonClassName="h-2"
      />
      <LineGroup
        columns={4}
        className="grid-cols-4 gap-1.5"
        skeletonClassName="h-2"
      />
    </div>
  );
}
