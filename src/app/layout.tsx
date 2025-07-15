import { Toaster } from 'react-hot-toast';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import { ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import { inter, lexendDeca } from '@/app/fonts';
import cn from '@/utils/class-names';
import NextProgress from '@/components/next-progress';
import dynamic from 'next/dynamic';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';

// styles
import '@/app/globals.css';
import { NotificationsProvider } from '@/config/use-notifications-provider';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { AuthProvider as CustomAuthProvider } from '@/context/AuthContext';

const DynamicOnboardingTour = dynamic(
  () => import('@/components/onboarding-tour'),
  {
    ssr: false,
  }
);

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
      >
        <AuthProvider session={null}>
          <CustomAuthProvider>
            <NotificationsProvider>
              <CartProvider>
                <ThemeProvider>
                  <NextProgress />
                  {children}
                  <Toaster
                    reverseOrder={false}
                    toastOptions={{
                      className: '',
                      style: {
                        padding: '16px',
                        color: '#713200',
                      },
                    }}
                  />
                  <GlobalDrawer />
                  <GlobalModal />
                  <DynamicOnboardingTour />
                </ThemeProvider>
              </CartProvider>
            </NotificationsProvider>
          </CustomAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
