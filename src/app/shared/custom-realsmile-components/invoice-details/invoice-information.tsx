'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Title, Text, cn } from 'rizzui';
import Table from '@/components/ui/table';
import { siteConfig } from '@/config/site.config';
import { PiCheckBold } from 'react-icons/pi';
import { formatDate } from '@/utils/format-date'; // Adjust the import path as necessary

export default function InvoiceInformation({ data }: any) {
  const reduction = parseFloat(data.reduction) || 0;
  const invoiceItems = [
    {
      id: '1',
      product: {
        title: data.product_name,
      },
      patient: data.patient
        ? { fullName: data.patient.fullName }
        : { fullName: 'N/A' },
      total: data.amountBeforeReduction,
    },
  ];

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 50,
    },
    {
      title: 'ARTICLE',
      dataIndex: 'product',
      key: 'product',
      width: 250,
      render: (product: any) => (
        <>
          <Title as="h6" className="mb-0.5 text-sm font-medium">
            {product.title}
          </Title>
        </>
      ),
    },
    {
      title: 'PATIENT',
      dataIndex: 'patient',
      key: 'patient',
      width: 200,
      render: (patient: any) => (
        <Text className="font-medium">{patient.fullName}</Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 200,
      render: (value: string) => (
        <Text className="font-medium">
          {value} {data.currency}
        </Text>
      ),
    },
  ];

  const totalPaid = data.partial_payments.reduce(
    (acc: number, payment: any) => acc + parseFloat(payment.amount),
    0
  );

  function InvoiceDetailsListTable() {
    return (
      <Table
        data={invoiceItems}
        columns={columns}
        variant="minimal"
        rowKey={(record) => record.id}
        scroll={{ x: 660 }}
        className="mb-11"
        isLoading={false}
      />
    );
  }

  const doctorCountry = data.doctor.country || '';
  let footerInformation = 'contact@realsmile.fr\nTél: + 33 6 25 37 43 82';
  let currency = '€';
  let bankDetails = '';
  let invoiceFromExtra = `
      <Title as="h6" className="mb-3.5 font-semibold">De la part de</Title>
      <Text className="mb-1.5 text-sm font-semibold uppercase">RealScan</Text>
      <Text className="mb-1.5">13 RUE JEAN DE LA FONTAINE 02400, <br /> CHATEAU- THIERRY FRANCE</Text>
      <Text className="mb-4 sm:mb-6 md:mb-8">+33 6 25 37 43 82 | +33 1 46 51 41 46</Text>
      <Text className="mb-1.5">contact@realsmile.fr</Text>`;

  if (doctorCountry === 'TN') {
    footerInformation =
      'contact@realsmile.fr\nTél: + 216 52 044 327 / + 33 6 25 37 43 82';
    currency = 'TND';
    bankDetails = `
        <div style="border: 1px solid #ddd; padding: 10px; margin-top: 20px;">
          <h3>Détails bancaires</h3>
          <p>Banque: BIAT</p>
          <p>RIB: 08 063 0210710003747 81</p>
          <p>IBAN: TN59 0806 3021 0710 0037 4781</p>
          <p>BIC: BIATTNTT</p>
        </div>`;
    invoiceFromExtra = `
        <Title as="h6" className="mb-3.5 font-semibold">De la part de</Title>
        <Text className="mb-1.5 text-sm font-semibold uppercase">Real Smile Aligner</Text>
        <Text className="mb-1.5">MF: 1820278/B</Text>
        <Text className="mb-4 sm:mb-6 md:mb-8">E-mail: contact@realsmile.fr</Text>`;
  } else if (doctorCountry === 'MA') {
    footerInformation = 'contact@realsmile.fr\nTél: + 33 6 25 37 43 82';
    currency = 'MAD';
    bankDetails = `
        <div style="border: 1px solid #ddd; padding: 10px; margin-top: 20px;">
          <h3>Détails bancaires</h3>
          <p>Banque: CIH BANK</p>
          <p>RIB: 230 780 5622039221032000 33</p>
          <p>IBAN: MA64 2307 8056 2203 9221 0320 0033</p>
          <p>BIC: CIHMMAMC</p>
        </div>`;
    invoiceFromExtra = `
        <Title as="h6" className="mb-3.5 font-semibold">De la part de</Title>
        <Text className="mb-1.5 text-sm font-semibold uppercase">Real Smile Aligner</Text>
        <Text className="mb-1.5">N°I.C.E: 003229357000079</Text>
        <Text className="mb-4 sm:mb-6 md:mb-8">E-mail: contact@realsmile.fr</Text>`;
  }

  return (
    <div className="w-full rounded-xl border border-muted p-5 text-sm sm:p-6 lg:p-8 2xl:p-10">
      <div className="mb-12 flex flex-col-reverse items-start justify-between md:mb-16 md:flex-row">
        <Image
          src={siteConfig.logo}
          alt={siteConfig.title}
          width={150}
          height={50}
          className="dark:invert"
          priority
        />
        <div className="mb-4 md:mb-0">
          <Badge
            variant="flat"
            color="success"
            rounded="md"
            className="mb-3 md:mb-2"
          >
            {data.payment_status}
          </Badge>
          <Title as="h6">{data.invoice_ref}</Title>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: invoiceFromExtra }}
        />

        <div>
          <Title as="h6" className="mb-3.5 font-semibold">
            Destiné à
          </Title>
          <Text className="mb-1.5 text-sm font-semibold uppercase">
            DOCTEUR
          </Text>
          <Text className="mb-1.5">{data.doctor?.fullName ?? 'N/A'}</Text>

          <Text className="mb-4 sm:mb-6 md:mb-8">
            {data.doctor?.address ?? 'N/A'}
          </Text>
          {data.doctor?.address_2 && (
            <Text className="mb-1.5">{data.doctor?.address_2}</Text>
          )}
        </div>

        <div className="flex flex-col">
          <Title as="h6" className="mb-3.5 font-semibold">
            Historique des paiements partiels
          </Title>
          {data.partial_payments.length > 0 ? (
            <div className="ms-2 w-full space-y-7 border-s-2 border-gray-100">
              {data.partial_payments.map((payment: any, index: number) => (
                <div
                  key={payment.id}
                  className={cn(
                    "relative ps-6 text-sm font-medium before:absolute before:-start-[9px] before:top-px before:h-5 before:w-5 before:-translate-x-px before:rounded-full before:bg-gray-100 before:content-[''] after:absolute after:-start-px after:top-5 after:h-10 after:w-0.5 after:content-[''] last:after:hidden",
                    index < data.partial_payments.length - 1
                      ? 'after:bg-primary'
                      : '',
                    index === data.partial_payments.length - 1
                      ? 'before:bg-primary'
                      : ''
                  )}
                >
                  <span className="absolute -start-1.5 top-1 text-white">
                    <PiCheckBold className="h-auto w-3" />
                  </span>
                  {`Paiement de ${payment.amount} ${data.currency}`}
                  <span className="text-xs text-gray-500">
                    {' - '}
                    {formatDate(new Date(payment.payment_date), 'MMMM D, YYYY')}
                  </span>
                  {payment.payment_proof_url && (
                    <a
                      href={payment.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline"
                    >
                      Voir la preuve de paiement
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Text>Aucun paiement partiel</Text>
          )}
          <div className="mt-4">
            <Text className="text-sm font-semibold">
              Total payé: {totalPaid.toFixed(2)} {data.currency}
            </Text>
          </div>
        </div>
      </div>

      <InvoiceDetailsListTable />

      <div className="flex flex-col-reverse items-start justify-between border-t border-muted pb-4 pt-8 xs:flex-row">
        <div className="mt-6 max-w-md pe-4 xs:mt-0">
          <Title
            as="h6"
            className="mb-1 text-xs font-semibold uppercase xs:mb-2 xs:text-sm"
          >
            Notes
          </Title>
          <Text className="leading-[1.7]">
            Nous apprécions votre entreprise. Si vous avez besoin de nous pour
            ajouter la TVA ou des notes supplémentaires, faites-le nous savoir!
          </Text>
        </div>
        <div className=" w-full max-w-sm">
          <Text className="flex items-center justify-between border-b border-muted pb-3.5 lg:pb-5">
            Sous-total:{' '}
            <Text as="span" className="font-semibold">
              {data.amountBeforeReduction} {data.currency}
            </Text>
          </Text>
          <Text className="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
            Réduction:{' '}
            <Text as="span" className="font-semibold">
              {reduction}%
            </Text>
          </Text>
          <Text className="flex items-center justify-between pt-4 text-base font-semibold text-gray-900 lg:pt-5">
            Total:{' '}
            <Text as="span">
              {data.amountAfterReduction} {data.currency}
            </Text>
          </Text>
        </div>
      </div>
    </div>
  );
}
