// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { TabList } from '@/app/shared/support/inbox/inbox-tabs';
import SupportInbox from '@/app/shared/support/inbox';
import CreateTicketModal from '@/app/shared/custom-realsmile-components/popovers/create-ticket-popover';
import ModalButton from '@/app/shared/modal-button';
import useFetchDepartments from '@/hooks/custom_realsmile_hooks/use-fetch-departments';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Button, Input, Select } from 'rizzui';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const pageHeader = {
  title: 'Chat Support',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Accueil',
    },
    {
      href: routes.support.dashboard,
      name: 'Chat Support',
    },
  ],
};

export default function SupportInboxPage() {
  const { departments, loading, error } = useFetchDepartments();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [showContent, setShowContent] = useState(false);
  const [loadingActivation, setLoadingActivation] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setShowContent(user.has_mobile_account);
      console.log('User has mobile account:', user.has_mobile_account);
    }
  }, [user, isLoading]);

  const handleCreateMobileUser = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/chat/createMobileUser';
    const url = `${apiUrl}${endpoint}`;

    if (!user.id) {
      toast.error('User ID is missing.');
      return;
    }

    setLoadingActivation(true);

    try {
      console.log('Creating mobile user...: ',user);

      const response = await toast.promise(
        axiosInstance.post(
          endpoint,
          {
            id: user?.id,
            role: user?.role == 'admin' ? 'agent' : 'customer',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ),
        {
          loading: 'Création du compte mobile en cours...',
          success: 'Compte mobile créé avec succès.',
          error: 'Erreur lors de la création du compte mobile.',
        }
      );

      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        let userData = {
          ...result.data.user,
          token: result.data.token,
          tokenExpires: result.data.user.tokenExpires,
          has_mobile_account: result.data.user.has_mobile_account,
          redirect: false,
        };

        await signIn('credentials', userData);
        setShowContent(true);
        toast.success('Mode chat activé avec succès.');
      } else {
        toast.error("Échec de l'activation du mode chat.");
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte mobile.', error);
    } finally {
      setLoadingActivation(false);
    }
  };

  if (error) return <div>Error loading departments</div>;

  if (!showContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Activer le mode chat
          </h2>
          <p className="mb-6 text-gray-600">
            Voulez-vous activer le mode chat sur votre compte mobile?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                router.back();
                toast.error('Action annulée.');
              }}
              className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400"
              disabled={loadingActivation}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateMobileUser}
              className="btn btn-primary px-4 py-2"
              disabled={loadingActivation}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {user.role == 'doctor' && (
          <ModalButton
            label="Créer un Ticket"
            view={<CreateTicketModal departments={departments} />}
            size="sm"
            className="mt-4 w-full @lg:mt-0 @lg:w-auto"
            icon={<PiPlusBold style={{ color: 'var(--color-primary)' }} />}
          />
        )}
      </PageHeader>
      <TabList departments={departments} />
      <SupportInbox />
    </>
  );
}
