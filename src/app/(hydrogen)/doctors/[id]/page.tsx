'use client';
import React, { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { fetchCasesData } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import Link from 'next/link';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/doctor-cases/table';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function EnhancedTablePage() {
  const [casesData, setCasesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [doctorData, setDoctorData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [currency, setCurrency] = useState('');
  const id = useParams();
  const router = useRouter();

  // Extract doctor name or fallback to ""
  const doctorName = casesData[0]?.doctor?.name || '';

  const pageHeader = {
    title: `Liste des cas du docteur ${doctorName}`,
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'Accueil',
      },
      {
        name: `Liste des cas du docteur ${doctorName}`,
      },
    ],
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data: any = await fetchCasesData(null, id?.id?.toString(), null);
        setCasesData(data || []);
      } catch (error) {
        console.error('Error fetching cases data:', error);
        setCasesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDoctorData = async () => {
      try {
        const response = await axiosInstance.get(
          `/devis/invoices/doctors/${id?.id}`
        );

        const data = response.data;
        setDoctorData(data.doctor);
        setTotalAmount(data.totalAmount);
        setTotalPaid(data.paidAmount);
        setTotalUnpaid(data.unpaidAmount);
        setCurrency(data.currency);
      } catch (err) {
        toast.error('Erreur lors de la récupération des données du docteur.');
      }
    };

    if (user) {
      fetchCases();
      fetchDoctorData();
    }
  }, [user, id?.id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex">
          <Link href={routes.cases.createCase(null)} passHref>
            {user?.role === 'doctor' && (
              <Button className="mt-0">
                <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
                Créer un cas
              </Button>
            )}
          </Link>
        </div>
      </PageHeader>

      {/* Fiche Client Section */}
      {doctorData && (
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
            <Button
              onClick={() => router.push(`/doctors/${id?.id}/transactions`)}
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
                {doctorData.speciality && (
                  <p className="text-gray-700">
                    <strong>Spécialité:</strong> {doctorData.speciality}
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
      )}

      {/* Cases Table */}
      <CasesTable
        data={casesData}
        isLoading={isLoading}
        setCasesData={setCasesData}
        caseData={casesData}
      />
    </>
  );
}
