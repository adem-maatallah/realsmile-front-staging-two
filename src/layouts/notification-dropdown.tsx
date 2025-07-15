'use client';

import React, { RefObject, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr'; // Import French locale
import { Popover, Title, Badge, Checkbox, Text, Button } from 'rizzui';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { PiCheck } from 'react-icons/pi';
import { useNotifications } from '@/config/use-notifications';
import Link from 'next/link';
import { SkeletonGeneral } from '@/components/ui/skeleton-general';
import Image from 'next/image';
import { BiBell } from 'react-icons/bi';

dayjs.extend(relativeTime);
dayjs.locale('fr');

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    notifications,
    setNotifications,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  if (loading) {
    return (
      <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
        <div className="mb-3 flex items-center justify-between ps-6">
          <SkeletonGeneral className="h-6 w-1/4" />
          <SkeletonGeneral className="h-4 w-1/5" rounded />
        </div>
        <SimpleBar className="max-h-[420px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <SkeletonGeneral className="h-12 w-12" rounded />
              <div className="flex-grow">
                <SkeletonGeneral
                  className="mb-2 h-4"
                  style={{ width: '80%' }}
                />
                <SkeletonGeneral className="h-4" style={{ width: '50%' }} />
              </div>
            </div>
          ))}
        </SimpleBar>
      </div>
    );
  }

  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, xf4: true }
          : notification
      )
    );
  };

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Notifications
        </Title>
        <Checkbox
          size="sm"
          label="Marquer tout comme lu"
          onChange={async () => {
            await markAllNotificationsAsRead();
            setNotifications((prevNotifications) =>
              prevNotifications.map((notification) => ({
                ...notification,
                xf4: true,
              }))
            );
          }}
          labelWeight="normal"
          labelClassName="text-sm"
        />
      </div>
      <SimpleBar className="max-h-[420px]">
        <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
          {notifications.map((item: any) => (
            <div
              key={item?.id}
              className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              onClick={() => handleNotificationClick(item.id)}
            >
              <div className="mb-auto mt-auto flex h-12 w-12 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                {item?.xa5 ? (
                  <Image
                    width="100"
                    height="100"
                    src={item?.xa5}
                    alt={item?.xa2}
                  />
                ) : (
                  <BiBell className="h-auto w-auto" />
                )}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="w-full">
                  <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                    {item?.xa2}
                  </Text>
                  <Text className="mb-0.5 w-11/12 text-xs text-gray-900 dark:text-gray-700">
                    {item?.xa3}
                  </Text>
                  <Text className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
                    il y a {dayjs(item?.xd1).fromNow(true)}
                  </Text>
                </div>
                <div className="ms-auto flex-shrink-0">
                  {!item?.xf4 ? (
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
          ))}
        </div>
      </SimpleBar>
      <Link
        href={'/activity'}
        onClick={() => setIsOpen(false)}
        className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
      >
        Voir toute l'activité
      </Link>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: JSX.Element & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useNotifications();

  // Count unseen notifications
  const unseenNotificationsCount = notifications.filter(
    (notification) => !notification.xf4
  ).length;

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
    >
      <Popover.Trigger>
        {React.cloneElement(children, {
          children: (
            <>
              {children.props.children}
              {unseenNotificationsCount > 0 && (
                <Badge
                  color="primary"
                  size="sm"
                  className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
                >
                  {unseenNotificationsCount}
                </Badge>
              )}
            </>
          ),
        })}
      </Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
