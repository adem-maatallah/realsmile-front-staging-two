'use client';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import PrintButton from '@/app/shared/print-button';

import {
  fetchInvoiceDetails,
  InvoiceType,
} from '@/app/shared/custom-realsmile-components/liste/devis-list/devis-data';
import { routes } from '@/config/routes';
import InvoiceInformation from '@/app/shared/custom-realsmile-components/invoice-details/invoice-information';
import axios from 'axios';
import DownloadButton from '@/app/shared/custom-realsmile-components/download-button/downloadButton';
import { invoiceData } from '@/data/invoice-data';

const pageHeader = {
  title: 'Détail de facture',
  breadcrumb: [
    {
      href: routes.invoices.list,
      name: 'Tous les factures',
    },
    {
      name: 'Détails',
    },
  ],
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoiceDetailsData, setInvoiceDetailsData] =
    useState<InvoiceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth()
  const printRef = useRef(null);

  useEffect(() => {
    if (user && id) {
      const fetchData = async () => {
        const data: InvoiceType = await fetchInvoiceDetails(
          id,
          user
        );
        setInvoiceDetailsData(data);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [user, id]);

  const handleDownload = async () => {
    if (invoiceDetailsData?.invoice_url) {
      try {
        const response = await axios.get(invoiceDetailsData.invoice_url, {
          responseType: 'blob', // Important
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${id}.pdf`); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading the PDF:', error);
      }
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {invoiceDetailsData &&
            invoiceDetailsData.doctor.country == 'TN' &&
            invoiceDetailsData?.payment_status == 'payé' && (
              <DownloadButton onClick={handleDownload} />
            )}
        </div>
      </PageHeader>
      {invoiceDetailsData && (
        <div ref={printRef}>
          <InvoiceInformation data={invoiceDetailsData} />
        </div>
      )}
    </>
  );
}
