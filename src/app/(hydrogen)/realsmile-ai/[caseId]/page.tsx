'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader, Text } from 'rizzui';
import { ImgComparisonSlider } from '@img-comparison-slider/react';
import toast from 'react-hot-toast';
import { Card } from 'antd';
import PageHeader from '@/app/shared/page-header';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

interface CaseStatus {
  caseId: number;
  firstName: string;
  lastName: string;
  dateDeNaissance: string;
  sexe: string;
  beforeImageUrl: string;
  afterImageUrl: string | null;
  queuePosition?: number;
}

export default function RealSmileAIDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [statusData, setStatusData] = useState<CaseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const { user } = useAuth();
  const { caseId } = useParams();

  const pageHeader = {
    title: 'RealSmile AI',
    breadcrumb: [
      {
        href: '/',
        name: 'Home',
      },
      {
        name: `RealSmile AI - Case ${caseId}`,
      },
    ],
  };

  // Get caseId from the URL query string.
  useEffect(() => {
    if (!caseId) {
      toast.error('Aucun caseId fourni.');
      router.push('/');
      return;
    }
    fetchStatus(caseId);
    // Poll every 10 seconds
    const interval = setInterval(() => fetchStatus(caseId), 10000);
    setPollingInterval(interval);
    return () => clearInterval(interval);
  }, [router]);

  const fetchStatus = async (caseId: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<CaseStatus>(
        `/cases/${caseId}/status`,
      );
      if (!res) {
        throw new Error('Failed to fetch case status');
      }
      const response: CaseStatus = await res.data;
      setStatusData(response);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // If afterImageUrl is available, we could stop polling or show slider.
  useEffect(() => {
    if (statusData?.afterImageUrl && pollingInterval) {
      clearInterval(pollingInterval);
    }
  }, [statusData, pollingInterval]);

  if (loading || !statusData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <Loader size="lg" />
        <Text className="mt-4 text-xl font-semibold">Chargement...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="max-w-8xl mx-auto">
        <Card className="mb-8 p-6 shadow-lg">
          <Text as="strong" className="mb-2 text-2xl font-bold text-gray-800">
            Informations du patient
          </Text>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Text as="p" className="text-gray-700">
                <span className="font-semibold">Prénom :</span>{' '}
                {statusData.firstName}
              </Text>
            </div>
            <div>
              <Text as="p" className="text-gray-700">
                <span className="font-semibold">Nom :</span>{' '}
                {statusData.lastName}
              </Text>
            </div>
            <div>
              <Text as="p" className="text-gray-700">
                <span className="font-semibold">Date de naissance :</span>{' '}
                {new Date(statusData.dateDeNaissance).toLocaleDateString()}
              </Text>
            </div>
            <div>
              <Text as="p" className="text-gray-700">
                <span className="font-semibold">Sexe :</span> {statusData.sexe}
              </Text>
            </div>
          </div>
        </Card>

        {statusData.afterImageUrl ? (
          <Card className="p-6 shadow-lg">
            <Text as="strong" className="mb-4 text-2xl font-bold text-gray-800">
              Avant / Après
            </Text>
            {/* Limit the overall slider width and keep it centered */}
            <div className="mx-auto w-full max-w-2xl">
              <ImgComparisonSlider className="w-full overflow-hidden rounded-lg">
                <figure slot="first" className="relative">
                  <Image
                    src={statusData.beforeImageUrl}
                    alt="Before"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                  <figcaption className="absolute left-2 top-2 rounded bg-gray-900 px-2 py-1 text-sm text-white">
                    Avant
                  </figcaption>
                </figure>
                <figure slot="second" className="relative">
                  <Image
                    src={statusData.afterImageUrl}
                    alt="Après"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                  <figcaption className="absolute right-2 top-2 rounded bg-gray-900 px-2 py-1 text-sm text-white">
                    Après
                  </figcaption>
                </figure>
              </ImgComparisonSlider>
            </div>
          </Card>
        ) : (
          <Card className="p-6 shadow-lg">
            <Text as="strong" className="mb-4 text-2xl font-bold text-gray-800">
              Génération de l'image en cours...
            </Text>
            {statusData.queuePosition ? (
              <Text as="p" className="text-lg text-gray-700">
                Votre position dans la file d'attente :{' '}
                {statusData.queuePosition}
              </Text>
            ) : (
              <Text as="p" className="text-lg text-gray-700">
                Veuillez patienter, nous générons votre image.
              </Text>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
