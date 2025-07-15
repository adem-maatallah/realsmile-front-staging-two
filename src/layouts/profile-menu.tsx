'use client';

import { Title, Text, Avatar, Button, Popover } from 'rizzui';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes'; // Assuming this is still used somewhere
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react'; // Renamed signOut from next-auth
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserSettingsIcon from '@/components/icons/user-settings';
import UserLockIcon from '@/components/icons/user-lock';
import toast from 'react-hot-toast';
import { BiHelpCircle } from 'react-icons/bi';
import { useAuth } from '@/context/AuthContext'; // Make sure this path is correct

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
}) {
  const { user, logout } = useAuth(); // Destructure user and logout from useAuth

  // Determine the name to display for the avatar
  const avatarName = user?.user_name
    ? user?.user_name
    : (user?.first_name && user?.last_name)
      ? `${user.first_name}_${user.last_name}`
      : 'User'; // Fallback if no name parts are available

  // Determine the profile picture source
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
        {/* Pass the logout function to DropdownMenu */}
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Close popover when navigating to a new path
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
  const { user, logout } = useAuth(); // Destructure logout from useAuth
  // Added console.log to confirm user data is available
  // console.log("User in DropdownMenu:", user);

  // Determine the name to display for the avatar within the dropdown
  const avatarName = user?.user_name
    ? user?.user_name
    : (user?.first_name && user?.last_name)
      ? `${user.first_name}_${user.last_name}`
      : 'User';

  // Determine the profile picture source for the dropdown avatar
  const profilePicSrc = user?.profile_pic
    ? user.profile_pic
    : 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-11.webp';

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
        {[
          {
            name: 'Paramètres de profil',
            href: '/profile-settings', // Ensure this route is correct
            icon: <UserSettingsIcon className="me-2 h-5 w-5" />,
          },
        ].map((item) => (
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
      {user?.role === 'doctor' && (
        <div className="border-t border-gray-300 px-6 pb-6 pt-5">
          <Link
            key="Ma fiche client"
            href={`/doctors/${user?.id}/fiche`} // Ensure this route is correct
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            <UserSettingsIcon className="me-2 h-5 w-5" /> {/* Re-using icon, adjust if you have a specific one */}
            Ma fiche client
          </Link>
        </div>
      )}
      <div className="border-t border-gray-300 px-3 pb-3 pt-3">
        <Link
          key="Aide"
          href="/helpdesk" // Ensure this route is correct
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
          onClick={async () => {
            // Remove the next-auth signOut() call
            // Remove the direct toast.success and localStorage.setItem as your logout function should handle them
            await logout(); // Call your custom logout function
          }}
        >
          <UserLockIcon className="me-2 h-5 w-5" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}