'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Title, ActionIcon, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Méthode de paiement est requise'),
  paymentTransactionCode: z.string().optional(),
  payedAmount: z
    .number()
    .positive('Montant payé doit être supérieur à 0')
    .min(1, 'Montant minimum est 1'),
  paymentProof: z.any().optional(),
});

export default function PaymentModal({ caseId }: any) {
  const { closeModal } = useModal();
  const {user} = useAuth()
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'credit_card',
      paymentTransactionCode: '',
      payedAmount: 0,
    },
  });

  const onSubmit = async (data: any) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/devis/payment`;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('id', caseId);
    formData.append('payment_method', data.paymentMethod);
    formData.append(
      'payment_transaction_code',
      data.paymentTransactionCode || ''
    );
    formData.append('payed_amount', data.payedAmount.toString());
    if (data.paymentProof && data.paymentProof[0]) {
      formData.append('payment_proof', data.paymentProof[0]);
    }

    toast
      .promise(
        axios.post(url, formData, {
          withCredentials: true, // Ensure cookies are sent with the request
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        {
          loading: 'Traitement...',
          success: 'Données enregistrées avec succès',
          error: (error) =>
            error.response?.data?.message ||
            "Erreur lors de l'enregistrement des données",
        }
      )
      .then(() => {
        closeModal();
        window.location.reload(); // Redirection vers la page des utilisateurs après activation réussie
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="container p-6"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Confirmer le paiement
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
          Soyez extrêmement vigilant lors de votre sélection, car une fois que
          vous aurez accepté ce paiement, il vous sera impossible de revenir en
          arrière ou d'annuler votre décision.
        </Text>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Méthode de paiement
        </label>
        <select
          {...register('paymentMethod')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={isLoading}
        >
          <option value="credit_card">Carte de crédit</option>
          <option value="check">Chéque</option>
          <option value="Espèce">Espèce</option>
          <option value="virement">Virement</option>
          <option value="autre">Autre</option>
        </select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Code de transaction
        </label>
        <input
          type="text"
          {...register('paymentTransactionCode')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
        {errors.paymentTransactionCode && (
          <p className="text-sm text-red-500">
            {errors.paymentTransactionCode.message}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Montant payé
        </label>
        <input
          type="number"
          {...register('payedAmount', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
        {errors.payedAmount && (
          <p className="text-sm text-red-500">{errors.payedAmount.message}</p>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Preuve de paiement (facultatif)
        </label>
        <input
          type="file"
          {...register('paymentProof')}
          className="mt-1 block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none"
          disabled={isLoading}
        />
        {errors.paymentProof && (
          <p className="text-sm text-red-500">{errors.paymentProof.message}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={closeModal} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Traitement...' : 'Valider'}
        </Button>
      </div>
    </form>
  );
}
