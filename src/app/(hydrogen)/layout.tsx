'use client';

import { LAYOUT_OPTIONS } from '@/config/enums';
import { useLayout } from '@/hooks/use-layout';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import HeliumLayout from '@/layouts/helium/helium-layout';
import BerylLiumLayout from '@/layouts/beryllium/beryllium-layout';
import { useEffect, useState } from 'react';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { Alert, Text, Button } from 'rizzui';
import { useRouter } from 'next/navigation';
import BoronLayout from '@/layouts/boron/boron-layout';
import CarbonLayout from '@/layouts/carbon/carbon-layout';
import LithiumLayout from '@/layouts/lithium/lithium-layout';
import { MdStars } from 'react-icons/md';

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  const [isBetaOpen, setIsBetaOpen] = useState(false);
  const [isNewFeatureBannerOpen, setIsNewFeatureBannerOpen] = useState(false);
  const router = useRouter();

  // Check token expiration


  // Check if beta banner was already dismissed
  useEffect(() => {
    const hasBeenShown = localStorage.getItem('betaInfoShown');
    if (hasBeenShown !== 'true') {
      setIsBetaOpen(true);
    }
  }, []);

  // Check if new RealSmile AI feature banner was already dismissed
  useEffect(() => {
    const bannerShown = localStorage.getItem('realSmileAIBannerShown');
    if (bannerShown !== 'true') {
      setIsNewFeatureBannerOpen(true);
    }
  }, []);

  const handleCloseBeta = () => {
    localStorage.setItem('betaInfoShown', 'true');
    setIsBetaOpen(false);
  };

  const handleCloseNewFeatureBanner = () => {
    localStorage.setItem('realSmileAIBannerShown', 'true');
    setIsNewFeatureBannerOpen(false);
  };

  const handleNewFeatureCTA = () => {
    router.push('/realsmile-ai');
  };

  return (
    <LayoutProvider>
      {/* New Feature Banner */}
      {isNewFeatureBannerOpen && (
        <div className="sticky top-14 z-50 w-full mb-4">
          <Alert
            color="info"
            variant="flat"
            className="
              flex items-center justify-between
              rounded-none px-4 py-3 shadow-md
              bg-gradient-to-r from-yellow-500 to-yellow-600
              text-white
            "
            closable
            onClose={handleCloseNewFeatureBanner}
          >
            {/* Left Side: Icon + Text */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <MdStars size={24} className="shrink-0" />
              <div>
                <Text className="text-sm font-semibold sm:text-base">
                  Nouvelle fonctionnalité : RealSmile AI
                </Text>
                <Text className="hidden text-xs text-white/90 sm:block">
                  Testez-la dès maintenant et améliorez l’expérience de vos patients !
                </Text>
              </div>
            </div>
            {/* Right Side: CTA Button */}
            <Button
              size="sm"
              variant="solid"
              className="
                ml-2 rounded-md bg-white px-4 py-2 text-yellow-600
                transition hover:bg-gray-100 hover:text-yellow-700
              "
              onClick={handleNewFeatureCTA}
            >
              Découvrir
            </Button>
          </Alert>
        </div>
      )}

      {/* Beta Alert */}
      {isBetaOpen && (
        <Alert
          color="warning"
          variant="flat"
          className="
            fixed bottom-4 right-4 z-50 max-w-md
            break-words rounded-lg p-3 text-sm shadow-lg
          "
          closable
          onClose={handleCloseBeta}
        >
          <Text>
            Realsmile est en phase de test bêta. Nous vous serions reconnaissants de
            bien vouloir signaler tout problème ou bugs au service Helpdesk Realsmile.
          </Text>
        </Alert>
      )}

      <CartProvider>{children}</CartProvider>
    </LayoutProvider>
  );
}

function LayoutProvider({ children }: LayoutProps) {
  const { layout } = useLayout();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  if (layout === LAYOUT_OPTIONS.HELIUM) {
    return <HeliumLayout>{children}</HeliumLayout>;
  }
  if (layout === LAYOUT_OPTIONS.LITHIUM) {
    return <LithiumLayout>{children}</LithiumLayout>;
  }
  if (layout === LAYOUT_OPTIONS.BERYLLIUM) {
    return <BerylLiumLayout>{children}</BerylLiumLayout>;
  }
  if (layout === LAYOUT_OPTIONS.BORON) {
    return <BoronLayout>{children}</BoronLayout>;
  }
  if (layout === LAYOUT_OPTIONS.CARBON) {
    return <CarbonLayout>{children}</CarbonLayout>;
  }

  return <HydrogenLayout>{children}</HydrogenLayout>;
}

function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
}
