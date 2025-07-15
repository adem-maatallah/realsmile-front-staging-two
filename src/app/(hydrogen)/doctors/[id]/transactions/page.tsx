'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import TransactionsTable from '@/app/shared/custom-realsmile-components/liste/transactions-list/table';
import Breadcrumb from '@/components/ui/breadcrumb';
import axiosInstance from '@/utils/axiosInstance';

export default function DoctorTransactionsPage() {
  const { id: doctorId } = useParams(); // Fetch the doctorId from the URL params
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        if (!doctorId || !user) {
          console.error('Missing user data');
          return;
        }

        const response = await axiosInstance.get(
          `/devis/partial-payments/doctors/${doctorId}`
        );

        const data = response.data;
        setTransactions(data.partialPayments); // Assuming the API returns data in the 'partialPayments' field
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (doctorId) {
      fetchTransactions();
    }
  }, [doctorId, user]);

  return (
    <div className="py-8">
      {/* Breadcrumb Component */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="/">Accueil</Breadcrumb.Item>
        {user?.role == 'admin' && (
          <Breadcrumb.Item href="/doctors">Médecins</Breadcrumb.Item>
        )}
        <Breadcrumb.Item>Transactions Client</Breadcrumb.Item>
      </Breadcrumb>

      <TransactionsTable data={transactions} isLoading={isLoading} />
    </div>
  );
}
