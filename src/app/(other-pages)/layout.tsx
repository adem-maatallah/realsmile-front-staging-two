'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import SocialItems from '@/components/ui/social-shares';
import { usePathname, useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import { routes } from '@/config/routes';
// layout.tsx (or the file containing your OtherPagesLayout component)


const ignoreBackButtonRoutes = [
  routes.accessDenied,
  routes.notFound,
  // Add your location verification route here
  routes.verifyLocation, // If you have routes.verifyLocation defined
  // OR simply: '/verify-location',
];

export default function OtherPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { back } = useRouter();
  const pathName = usePathname();
  let notIn = !ignoreBackButtonRoutes.includes(pathName); // This line checks if the current path should *not* have the back button
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-gray-50">
      {/* sticky top header  */}
      <div className="sticky top-0 z-40 px-6 py-5 backdrop-blur-lg lg:backdrop-blur-none xl:px-10 xl:py-8">
        <div
          className={cn(
            'mx-auto flex max-w-[1520px] items-center',
            notIn ? 'justify-between' : 'justify-center'
          )}
        >
          <Link href={'/'}>
            <Image
              src={siteConfig.logo}
              alt={siteConfig.title}
              className="dark:invert"
              priority
            />
          </Link>
          {notIn && ( // This condition controls the button's visibility
            <Button
              variant="outline"
              size="sm"
              className="md:h-10 md:px-4 md:text-base"
              onClick={() => back()}
            >
              Go to home
            </Button>
          )}
        </div>
      </div>
      {children}
      <SocialItems />
    </div>
  );
}