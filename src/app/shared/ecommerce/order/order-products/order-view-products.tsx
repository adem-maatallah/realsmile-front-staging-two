'use client';

import Image from 'next/image';
import Table, { HeaderCell } from '@/components/ui/table';
import { Title, Text } from 'rizzui';
import { toCurrency } from '@/utils/to-currency';

const columns = (currency: string) => [
  {
    title: <HeaderCell title="Product" />,
    dataIndex: 'product',
    key: 'product',
    width: 250,
    render: (_: any, row: any) => (
      <div className="flex items-center">
        <div className="relative aspect-square w-12 overflow-hidden rounded-lg">
          <Image
            alt={row.product.name}
            src={row.product.imageUrls[0]}
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
        <div className="ms-4">
          <Title as="h6" className="!text-sm font-medium">
            {row.product.name}
          </Title>
        </div>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Product Price" align="right" />,
    dataIndex: 'price',
    key: 'price',
    width: 200,
    render: (price: string) => (
      <Text className="text-end text-sm">{price + ' ' + currency}</Text>
    ),
  },
  {
    title: <HeaderCell title="Quantity" align="center" />,
    dataIndex: 'quantity',
    key: 'quantity',
    width: 150,
    render: (quantity: number) => (
      <Text className="text-center text-sm font-semibold">{quantity}</Text>
    ),
  },
  {
    title: <HeaderCell title="Total Price" align="right" />,
    dataIndex: 'price',
    key: 'price',
    width: 200,
    render: (price: number, row: any) => (
      <Text className="text-end text-sm">
        {price * row.quantity + ' ' + currency}
      </Text>
    ),
  },
];

export default function OrderViewProducts({ items, currency }: any) {
  return (
    <Table
      tableLayout="auto"
      data={items}
      columns={columns(currency)} // Pass currency to column config
      className="text-sm"
      variant="minimal"
      rowKey={(record) => record.id}
      scroll={{ x: 800 }}
    />
  );
}
