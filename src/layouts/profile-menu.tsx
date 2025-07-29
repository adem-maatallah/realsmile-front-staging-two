'use client';

import { Title, Text, Avatar, Button, Popover } from 'rizzui';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CalenderIcon from '@/components/icons/calendar';

import UserSettingsIcon from '@/components/icons/user-settings';
import UserLockIcon from '@/components/icons/user-lock';
import { BiHelpCircle } from 'react-icons/bi';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarAlt } from 'react-icons/fa'; // <-- This icon will be used

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
}) {
  const { user } = useAuth();

  const avatarName = user?.user_name
    ? user.user_name
    : (user?.first_name && user?.last_name)
      ? `${user.first_name}_${user.last_name}`
      : 'User';

  const profilePicSrc = user?.profile_pic
    ? user.profile_pic
    : 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-11.webp';

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            'settings-dropdown w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
            buttonClassName
          )}
        >
          <Avatar
            src={profilePicSrc}
            name={avatarName}
            className={cn('!h-9 w-9 sm:!h-10 sm:!w-10', avatarClassName)}
          />
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

function DropdownMenu() {
  const { user, logout } = useAuth();

  const avatarName = user?.user_name
    ? user.user_name
    : (user?.first_name && user?.last_name)
      ? `${user.first_name}_${user.last_name}`
      : 'User';

  const profilePicSrc = user?.profile_pic
    ? user.profile_pic
    : 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-11.webp';
      
  // --- FIX: Added "Gérer mes disponibilités" to the menu items for doctors ---
  const menuItems = [
    {
      name: 'Paramètres de profil',
      href: '/profile-settings',
      icon: <UserSettingsIcon className="me-2 h-5 w-5" />,
    },
    // Conditionally add doctor-specific links
    ...(user?.role === 'doctor' ? [
      {
        name: 'Mes Consultations',
        href: routes.doctor.myConsultations,
        icon: <CalenderIcon className="me-2 h-5 w-5" />,
      },
      {
        name: 'Gérer mes disponibilités', // <-- NEW LINK
        href: routes.doctor.availabilitySettings, // <-- Route from your config
        icon: <FaCalendarAlt className="me-2 h-5 w-5" />, // <-- Using the imported icon
      }
    ] : []),
  ];

  return (
    <div className="w-70 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          src={profilePicSrc}
          name={avatarName}
        />
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
            {avatarName}
          </Title>
          <Text className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-600">
            {user?.email}
          </Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
      
      {/* Doctor-specific link to client file remains here */}
      {user?.role === 'doctor' && (
        <div className="border-t border-gray-300 px-6 pb-6 pt-5">
          <Link
            key="Ma fiche client"
            href={routes.doctor.doctorFile(user?.id)}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            <UserSettingsIcon className="me-2 h-5 w-5" />
            Ma fiche client
          </Link>
        </div>
      )}

      <div className="border-t border-gray-300 px-3 pb-3 pt-3">
        <Link
          key="Aide"
          href="/helpdesk"
          className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
        >
          <BiHelpCircle className="me-2 h-5 w-5" />
          Aide
        </Link>
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => logout()}
        >
          <UserLockIcon className="me-2 h-5 w-5" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
