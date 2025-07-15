'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Modal, Input, Text, ActionIcon, Title } from 'rizzui';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Breadcrumb from '@/components/ui/breadcrumb';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DoctorInvoicesTable from '@/app/shared/custom-realsmile-components/liste/doctor-invoice-list/table';
import axiosInstance from '@/utils/axiosInstance';

// Define the validation schema with Zod
const paymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Méthode de paiement est requise'),
  paymentTransactionCode: z.string().optional(),
  payedAmount: z
    .number()
    .positive('Montant payé doit être supérieur à 0')
    .min(1, 'Montant minimum est 1'),
  paymentProof: z.any().optional(),
  paymentDate: z.string().min(1, 'Date de paiement est requise'),
});

export default function ClientFile() {
  const router = useRouter();
  const { id } = useParams();
  const {user} = useAuth()
  const [doctorData, setDoctorData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [currency, setCurrency] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [devisData, setDevisData] = useState([]);

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        const response = await axiosInstance.get(
          `/devis/invoices/doctors/${id}`
        );

        const data = response.data;
        setDoctorData(data.doctor);
        setTotalAmount(data.totalAmount);
        setTotalPaid(data.paidAmount);
        setTotalUnpaid(data.unpaidAmount);
        setCurrency(data.currency);
        setDevisData(data.invoices); // Set the invoices data here
      } catch (err) {
        toast.error('Erreur.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchDoctorData();
    }
  }, [id, user]);

  // Set up the form handling with react-hook-form and Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'credit_card',
      paymentTransactionCode: '',
      payedAmount: '',
      paymentDate: new Date().toISOString().slice(0, 10), // Default to today's date
    },
  });

  const onSubmit = async (data: any) => {
    const payment = parseFloat(data.payedAmount);

    if (payment > totalUnpaid) {
      toast.error(
        'Le montant du paiement ne peut pas dépasser le montant total impayé.'
      );
      return;
    }

    const formData = new FormData();
    formData.append('payed_amount', data.payedAmount.toString());
    formData.append('payment_method', data.paymentMethod);
    formData.append(
      'payment_transaction_code',
      data.paymentTransactionCode || ''
    );
    formData.append('payment_date', data.paymentDate); // Append the payment date
    if (data.paymentProof && data.paymentProof[0]) {
      formData.append('payment_proof', data.paymentProof[0]);
    }

    try {
      axiosInstance.put(
        `/devis/invoices/doctors/${id}/add-payment`,
        {
          body: formData,
        }
      );

      // Update the totals after payment
      setTotalPaid((prev) => prev + payment);
      setTotalUnpaid((prev) => prev - payment);
      setIsModalOpen(false);
      reset();
      toast.success('Paiement ajouté avec succès!');
    } catch (err) {
      toast.error("Erreur lors de l'ajout du paiement.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-[#CA8A04]"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="w-full px-6">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/">Accueil</Breadcrumb.Item>
          <Breadcrumb.Item href="/doctors">Médecins</Breadcrumb.Item>
          <Breadcrumb.Item>Fiche Client</Breadcrumb.Item>
        </Breadcrumb>

        {doctorData ? (
          <div className="mb-4 w-full overflow-hidden rounded-lg bg-white shadow-md">
            <div className="relative bg-[#CA8A04] p-8 text-white">
              {doctorData.fullName && (
                <h1 className="text-4xl font-bold">{doctorData.fullName}</h1>
              )}
              {doctorData.email && (
                <p className="mt-2 text-lg">{doctorData.email}</p>
              )}
              {doctorData.phone && (
                <p className="mt-1 text-lg">{doctorData.phone}</p>
              )}
              {(user?.role === 'admin' ||
                user?.role === 'commercial') &&
                totalUnpaid > 0 && (
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute right-8 top-8 bg-white px-6 py-3 text-lg font-semibold text-[#CA8A04] hover:bg-gray-100"
                  >
                    Ajouter Paiement
                  </Button>
                )}
              <Button
                onClick={() => router.push(`/doctors/${id}/transactions`)}
                className="bg-white px-6 py-3 text-lg font-semibold text-[#CA8A04] hover:bg-gray-100"
              >
                Voir les Transactions
              </Button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  {doctorData.address && (
                    <p className="text-gray-700">
                      <strong>Adresse:</strong> {doctorData.address}
                    </p>
                  )}
                  {doctorData.address_2 && (
                    <p className="text-gray-700">
                      <strong>Adresse 2:</strong> {doctorData.address_2}
                    </p>
                  )}
                  {doctorData.city && doctorData.state && doctorData.zip && (
                    <p className="text-gray-700">
                      <strong>Ville:</strong> {doctorData.city},{' '}
                      {doctorData.state} {doctorData.zip}
                    </p>
                  )}
                  {doctorData.country && (
                    <p className="text-gray-700">
                      <strong>Pays:</strong> {doctorData.country}
                    </p>
                  )}
                </div>
                <div className="space-y-6 text-right">
                  <p className="text-2xl font-semibold">
                    Montant total:{' '}
                    <span className="text-black">
                      {totalAmount} {currency}
                    </span>
                  </p>
                  <p className="text-2xl font-semibold">
                    Total payé:{' '}
                    <span className="text-green-600">
                      {totalPaid} {currency}
                    </span>
                  </p>
                  <p className="text-2xl font-semibold">
                    Total impayé:{' '}
                    <span className="text-red-600">
                      {totalUnpaid} {currency}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-lg">Chargement...</p>
        )}

        <DoctorInvoicesTable data={devisData || []} isLoading={isLoading} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                <XMarkIcon className="h-auto w-5" />
              </ActionIcon>
            </div>
            <div className="mt-4">
              <Text className="pb-5 text-sm">
                Soyez extrêmement vigilant lors de votre sélection, car une fois
                que vous aurez accepté ce paiement, il vous sera impossible de
                revenir en arrière ou d'annuler votre décision.
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
                <option value="check">Chèque</option>
                <option value="Espèce">Espèce</option>
                <option value="virement">Virement</option>
                <option value="autre">Autre</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">
                  {errors.paymentMethod.message}
                </p>
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
                <p className="text-sm text-red-500">
                  {errors.payedAmount.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Date de paiement
              </label>
              <input
                type="date"
                {...register('paymentDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={isLoading}
              />
              {errors.paymentDate && (
                <p className="text-sm text-red-500">
                  {errors.paymentDate.message}
                </p>
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
                <p className="text-sm text-red-500">
                  {errors.paymentProof.message}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Traitement...' : 'Valider'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
