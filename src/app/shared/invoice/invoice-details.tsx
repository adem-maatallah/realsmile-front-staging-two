'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Title, Text } from 'rizzui';
import Table from '@/components/ui/table';
import { siteConfig } from '@/config/site.config';

export default function InvoiceDetails({ data }: any) {
  const priceAfterReduction = data.price - (data.price * data.reduction) / 100;
  const invoiceItems = [
    {
      id: '1',
      product: {
        title: data.pack_name,
      },
      quantity: 1,
      total: data.price,
      caseId: data.caseId,
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
            {product.title} (Cas N° {data.caseId})
          </Title>
        </>
      ),
    },
    {
      title: '',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 200,
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
            {data.status}
          </Badge>
          <Title as="h6">Facture Proforma - #{data.id}</Title>
          <Text className="mt-0.5 text-gray-500">Numéro Facture Proforma</Text>
        </div>
      </div>

      <div className="mb-12 grid gap-4 xs:grid-cols-2 sm:grid-cols-3 sm:grid-rows-1">
        <div className="">
          <Title as="h6" className="mb-3.5 font-semibold">
            De la part de
          </Title>
          <Text className="mb-1.5 text-sm font-semibold uppercase">
            RealScan
          </Text>

          <Text className="mb-1.5">
            13 RUE JEAN DE LA FONTAINE 02400, <br /> CHATEAU- THIERRY FRANCE
          </Text>

          <Text className="mb-4 sm:mb-6 md:mb-8">
            +33 6 25 37 43 82 | +33 1 46 51 41 46
          </Text>
          <Text className="mb-1.5">contact@realsmile.fr</Text>
          <div>
            <Text className="mb-2 text-sm font-semibold">Date de création</Text>
            <Text>{new Date(data.created_at).toLocaleDateString()}</Text>
          </div>
        </div>

        <div className="mt-4 xs:mt-0">
          <Title as="h6" className="mb-3.5 font-semibold">
            Destiné à
          </Title>
          <Text className="mb-1.5 text-sm font-semibold uppercase">
            DOCTEUR
          </Text>
          <Text className="mb-1.5">{data.doctor.fullName}</Text>
          <Text className="mb-1.5">
            {data.doctor.address_1}, <br />
            {data.doctor.address_2}
          </Text>
          <Text className="mb-4 sm:mb-6 md:mb-8">{data.doctor.phone}</Text>
          <Text className="mb-1.5">{data.doctor.email}</Text>
        </div>

        <div className="mt-4 flex sm:mt-6 md:mt-0 md:justify-end">
          <QRCodeSVG
            value="https://realsmile.fr/contactez-nous/"
            className="h-28 w-28 lg:h-32 lg:w-32"
          />
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
              {data.price} {data.currency}
            </Text>
          </Text>
          <Text className="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
            Réduction:{' '}
            <Text as="span" className="font-semibold">
              {data.reduction}%
            </Text>
          </Text>
          <Text className="flex items-center justify-between pt-4 text-base font-semibold text-gray-900 lg:pt-5">
            Total:{' '}
            <Text as="span">
              {priceAfterReduction.toFixed(2)} {data.currency}
            </Text>
          </Text>
        </div>
      </div>
    </div>
  );
}
