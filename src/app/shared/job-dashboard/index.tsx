'use client';
import WelcomeBanner from '@/components/banners/welcome';
import AppointmentStats from '../appointment/dashboard/appointment-stats';
import Image from 'next/image';
import welcomeImg from '@public/shop-illustration.png';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiPlusBold } from 'react-icons/pi';
import StorageReport from '../file/dashboard/storage-report';
import AppointmentTodo from '../appointment/dashboard/appointment-todo';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import AgeGroupReport from '../file/dashboard/storage-report';

export default function JobDashboard() {
  const [dataStatistics, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  // Define the URL for the API request

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `/doctors/stats`;
        const url = `${apiUrl}${endpoint}`;
        console.log('url  :', url);
        const response = await axios.get(url, {
          withCredentials: true,
        });
        setData(response.data); // axios directly accesses the `data` property
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  return (
    <div className="grid grid-cols-12 gap-6 @container @[59rem]:gap-7">
      {/* Row for AppointmentStats */}
      <div className="cases-statuses col-span-full">
        <AppointmentStats
          data={dataStatistics?.statusCounts}
          isLoading={loading}
        />
      </div>

      {/* Row for WelcomeBanner */}
      <div className="col-span-full">
        <WelcomeBanner
          description={
            "Voici ce qui se passe dans votre cabinet aujourd'hui. Consultez les statistiques en un coup d'œil."
          }
          media={
            <div className="absolute -bottom-6 end-4 hidden w-[300px] @2xl:block lg:w-[320px] 2xl:-bottom-7 2xl:w-[330px]">
              <div className="relative">
                <Image
                  src="https://storage.googleapis.com/realsmilefiles/staticFolder/dashboardRealSmile.svg"
                  alt="Welcome image"
                  className="dark:brightness-95 dark:drop-shadow-md"
                  height={300}
                  width={300}
                />
              </div>
            </div>
          }
          contentClassName="@2xl:max-w-[calc(100%-340px)]"
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-8 dark:bg-gray-100/30 lg:pb-9"
        >
          <Link href="/cases/create" className="inline-flex">
            <Button as="span" className="h-[38px] shadow md:h-10">
              <PiPlusBold className="me-1 h-4 w-4" /> Ajouter un cas
            </Button>
          </Link>
        </WelcomeBanner>
      </div>

      {/* Row for AppointmentTodo */}
      <div className="recent-cases col-span-full">
        <AppointmentTodo data={dataStatistics?.latestCases} />
      </div>

      {/* Row for StorageReport */}
      <div className="cases-by-age-gender col-span-full">
        <AgeGroupReport data={dataStatistics?.ageGroups} loading={loading} />
      </div>
    </div>
  );
}
