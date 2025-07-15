'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import NextAuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import { AuthProvider as CustomAuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/config/use-notifications-provider';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { ThemeProvider } from '@/app/shared/theme-provider';
import NextProgress from '@/components/next-progress';
import { Toaster } from 'react-hot-toast';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import dynamic from 'next/dynamic';

const DynamicOnboardingTour = dynamic(
  () => import('@/components/onboarding-tour'),
  { ssr: false }
);

interface Props {
  children: ReactNode;
  session: any;
}

export default function Providers({ children, session }: Props) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <NextAuthProvider session={session}>
        <CustomAuthProvider>
          <NotificationsProvider>
            <CartProvider>
              <ThemeProvider>
                <NextProgress />
                {children}
                <Toaster
                  reverseOrder={false}
                  toastOptions={{
                    style: { padding: '16px', color: '#713200' },
                  }}
                />
                <GlobalDrawer />
                <GlobalModal />
                <DynamicOnboardingTour />
              </ThemeProvider>
            </CartProvider>
          </NotificationsProvider>
        </CustomAuthProvider>
      </NextAuthProvider>
    </SessionProvider>
  );
}
