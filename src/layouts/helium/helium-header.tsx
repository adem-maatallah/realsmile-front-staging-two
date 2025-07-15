'use client';

import Link from 'next/link';
import { Badge, ActionIcon, Dropdown, Popover } from 'rizzui'; // Added Dropdown from rizzui
import cn from '@/utils/class-names';
import SearchWidget from '@/components/search/search';
import MessagesDropdown from '@/layouts/messages-dropdown';
import NotificationDropdown from '@/layouts/notification-dropdown';
import ProfileMenu from '@/layouts/profile-menu';
import SettingsButton from '@/components/settings/settings-button';
import HamburgerButton from '@/layouts/hamburger-button';
import Logo from '@/components/logo';
import {
  PiChatCircleDotsFill,
  PiBellSimpleRingingFill,
  PiGearFill,
  PiShoppingCart,
} from 'react-icons/pi'; // Added PiShoppingCart for cart icon
import Sidebar from './helium-sidebar';
import ChatSolidIcon from '@/components/icons/chat-solid';
import Image from 'next/image';
import { useNotifications } from '@/config/use-notifications-provider';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/utils/firestore/db';
import { useState, useEffect } from 'react';
import { useCart } from '@/store/quick-cart/cart.context'; // Import useCart
import CartDropdown from '../cart-dropdown';
import { useAuth } from '@/context/AuthContext';

function HeaderMenuRight() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const unseenCount = notifications.filter((notif) => !notif.xf4).length;
  const [unseenTickets, setUnseenTickets] = useState(false);

  // Fetch the cart context to display the number of products in the cart
  const { items, resetCart, clearItemFromCart } = useCart(); // Fetch cart items and actions
  const totalItemsInCart = items.reduce(
    (total, item) => total + item.quantity,
    0
  ); // Calculate total number of products in cart

  useEffect(() => {
    if (user?.id) {
      let ticketsQuery;
      if (user?.role === 'doctor') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('ctid', '!=', ''),
          where('cuid', '==', user.id)
        );
      } else if (user?.role === 'admin') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('ctid', '!=', ''),
          where('L1', 'array-contains', user.id)
        );
      }

      if (ticketsQuery) {
        const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
          if (!snapshot.empty) {
            setUnseenTickets(true);
          } else {
            setUnseenTickets(false);
          }
        });

        return () => unsubscribe();
      }
    }
  }, [user?.id, user?.role]);

  return (
    <div className="flex flex-grow items-center justify-end gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      {/* Cart Dropdown using Popover */}
      <Popover shadow="sm" placement="bottom-end">
        <Popover.Trigger>
          <ActionIcon
            aria-label="Cart"
            variant="text"
            className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
          >
            <PiShoppingCart className="h-[18px] w-auto" />
            {totalItemsInCart > 0 && (
              <Badge
                size="small"
                color="primary"
                className="absolute right-0 top-0 flex h-[18px] w-[18px] -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-full bg-yellow-500 text-xs text-white"
              >
                {totalItemsInCart}
              </Badge>
            )}
          </ActionIcon>
        </Popover.Trigger>
        <Popover.Content className="z-[9999] pb-6 pe-6 ps-0 pt-5 dark:bg-gray-100">
          <CartDropdown />
        </Popover.Content>
      </Popover>

      {user?.role !== 'labo' && (
        <ActionIcon
          aria-label="Country"
          variant="text"
          className="user-country relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
        >
          <Image
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${user?.country}.svg`}
            alt="Country Flag"
            width={34}
            height={34}
          />
        </ActionIcon>
      )}

      <MessagesDropdown>
        <ActionIcon
          aria-label="Messages"
          variant="text"
          className="messages relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
        >
          <ChatSolidIcon className="h-[18px] w-auto" />
          {unseenTickets && (
            <Badge
              renderAsDot
              color="primary"
              enableOutlineRing
              className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
            />
          )}
        </ActionIcon>
      </MessagesDropdown>

      <NotificationDropdown>
        <ActionIcon
          aria-label="Notification"
          variant="text"
          className="notifications relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
        >
          <PiBellSimpleRingingFill className="h-[18px] w-auto 3xl:h-5" />
          {unseenCount > 0 && (
            <Badge
              renderAsDot
              color="warning"
              enableOutlineRing
              className="absolute right-1 top-2.5 -translate-x-1 -translate-y-1/4"
            />
          )}
        </ActionIcon>
      </NotificationDropdown>

      <SettingsButton className="hidden rounded-full before:absolute before:h-full before:w-full before:-rotate-45 before:rounded-full before:bg-gradient-to-l before:from-green-dark/25 before:via-green-dark/0 before:to-green-dark/0 3xl:h-10 3xl:w-10">
        <PiGearFill className="h-[22px] w-auto animate-spin-slow" />
      </SettingsButton>

      <ProfileMenu />
    </div>
  );
}

export default function Header() {
  return (
    <header
      className={
        'sticky top-0 z-[990] flex items-center bg-gray-0/80 px-4 py-4 backdrop-blur-xl dark:bg-gray-50/50 md:px-5 lg:px-6 xl:-ms-1.5 xl:pl-4 2xl:-ms-0 2xl:py-5 2xl:pl-6 3xl:px-8 3xl:pl-6 4xl:px-10 4xl:pl-9'
      }
    >
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          view={
            <Sidebar className="static w-full xl:p-0 2xl:w-full [&>div]:xl:rounded-none" />
          }
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly={true} />
        </Link>
        <SearchWidget />
      </div>
      <HeaderMenuRight />
    </header>
  );
}
