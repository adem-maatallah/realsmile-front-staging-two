'use client';

import React, { useEffect, useState } from 'react';
import JobDashboard from '../shared/job-dashboard';
import AppointmentDashboard from '../shared/appointment/dashboard';
import FinancialDashboard from '../shared/financial/dashboard';
import SupportDashboard from '../shared/support/dashboard';
import NotFound from '../not-found';
import { Alert, Text, Modal } from 'rizzui';
import { BiLock, BiMailSend, BiPhone } from 'react-icons/bi';
import TrashIcon from '@/components/icons/trash';
import EnhancedTablePage from './labo/page';
import axios from 'axios'; // Ensure axios is imported if used elsewhere, though axiosInstance is preferred
import Image from 'next/image';
import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/carousel/carousel';
import AdminDashboard from '../shared/admin-dashboard';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
// import LocationTracker from '@/components/location-tracker/LocationTracker';

// Import the LocationTracker component

export default function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  /* const [isMailOpen, setIsMailOpen] = useState(!user?.email_verified);
  const [isPhoneOpen, setIsPhoneOpen] = useState(
    !user?.phone_verified
  );
  const [isOtpOpen, setIsOtpOpen] = useState(
    !user?.two_factor_enabled
  ); */
  const [banners, setBanners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  useEffect(() => {
    // Fetch banners from the API endpoint
    axiosInstance
      .get(`/banners`)
      .then((response) => {
        setBanners(response.data);
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
      });
  }, []);

  const handleBannerClick = (banner) => {
    setSelectedBanner(banner);
    setModalOpen(true);
  };

  const renderBannerSwiper = () => (
    <Swiper
      speed={500}
      spaceBetween={0}
      slidesPerView={1}
      modules={[Pagination]}
      pagination={{ clickable: true }}
      className="mb-4 h-[400px] w-full"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <div className="relative h-full w-full">
            <Image
              src={banner.image_url}
              alt={banner.title}
              layout="fill"
              priority
              sizes="(max-width: 768px) 100vw"
              className="cursor-pointer rounded-xl object-cover"
              onClick={() => handleBannerClick(banner)}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );

  return (
    <div>
      {/* Existing Alert components (commented out) */}
      {/* {isMailOpen && (
        <Alert
          color="warning"
          variant="flat"
          closable
          onClose={() => setIsMailOpen(false)}
          className="mb-4"
          icon={<BiMailSend className="w-6" />}
        >
          <Text>
            Vous devez vérifer votre adresse email pour accéder à toutes les
            fonctionnalités de votre compte.
          </Text>
        </Alert>
      )}
      {isPhoneOpen && (
        <Alert
          color="warning"
          variant="flat"
          closable
          onClose={() => setIsPhoneOpen(false)}
          className="mb-4"
          icon={<BiPhone className="w-6" />}
        >
          <Text>
            Vous devez vérifer votre numéro de téléphone pour accéder à toutes
            les fonctionnalités de votre compte.
          </Text>
        </Alert>
      )}
      {isOtpOpen && (
        <Alert
          color="warning"
          variant="flat"
          closable
          onClose={() => setIsOtpOpen(false)}
          className="mb-4"
          icon={<BiLock className="w-6" />}
        >
          <Text>
            Veuillez activez l'authentification a double facteur pour mieux
            sécuriser votre compte.
          </Text>
        </Alert>
      )} */}

      {user?.role !== "admin" && renderBannerSwiper()}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedBanner && (
          <div className="p-4">
            <Image
              src={selectedBanner.image_url}
              alt={selectedBanner.title}
              width={800}
              height={600}
              className="mb-4 rounded-xl object-cover"
            />
            <h2 className="mb-2 text-xl font-bold">{selectedBanner.title}</h2>
            <p>{selectedBanner.description}</p>
          </div>
        )}
      </Modal>

      {/* Integrate the LocationTracker component here */}
      {/* It will only be active if a user is logged in, as it relies on useAuth() */}
      {/* <LocationTracker /> */}
      {(() => {
        switch (userRole) {
          case 'admin':
            return <AdminDashboard />;
          case 'labo':
            return <EnhancedTablePage />;
          /* return <LogisticsDashboard />; */
          case 'doctor':
            return <JobDashboard />;
          case 'patient':
            return <AppointmentDashboard />;
          case 'agent':
            return <SupportDashboard />;
          default:
            return <NotFound />;
        }
      })()}
    </div>
  );
}
