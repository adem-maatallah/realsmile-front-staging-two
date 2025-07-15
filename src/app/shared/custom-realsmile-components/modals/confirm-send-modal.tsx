'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Title, ActionIcon, Input, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ConfirmSendModal({ caseId }: any) {
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {user} = useAuth()
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      // Envoyer la demande à l'API pour confirmer l'envoi
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/retainingGutters`,
        {
          caseId,
          trackingLink: data.trackingLink,
        },
        {
          withCredentials: true, // Assurez-vous que les cookies sont envoyés avec la requête
        }
      );

      if (response.status === 200) {
        toast.success('Gouttière envoyée avec succès !');
        window.location.reload();
        closeModal();
      } else {
        toast.error("Erreur lors de l'envoi de la gouttière.");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la gouttière.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Confirmer l'envoi de la gouttière
        </Title>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={closeModal}
          disabled={isLoading}
        >
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <div className="mt-4">
        <Text className="pb-5 text-sm">
          Veuillez entrer le lien de suivi pour confirmer l'envoi de la
          gouttière.
        </Text>
        <Input
          label="Lien de suivi"
          placeholder="Entrez le lien de suivi"
          {...register('trackingLink', {
            required: 'Le lien de suivi est requis',
          })}
          error={errors.trackingLink?.message}
          disabled={isLoading}
        />
      </div>
      <div className="mt-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={closeModal} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Traitement...' : 'Confirmer'}
        </Button>
      </div>
    </form>
  );
}
