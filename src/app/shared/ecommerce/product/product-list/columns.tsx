'use client';

import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import { Badge, Text, Tooltip, ActionIcon, Progressbar } from 'rizzui';
import { routes } from '@/config/routes';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DeletePopover from '@/app/shared/delete-popover';
import { PiStarFill } from 'react-icons/pi';

// get status badge
function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium text-orange-dark">{status}</Text>
        </div>
      );
    case 'publish':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium text-green-dark">{status}</Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium text-gray-600">{status}</Text>
        </div>
      );
  }
}

function getStockStatus(status: number) {
  if (status === 0) {
    return (
      <>
        <Progressbar
          value={status}
          color="danger"
          className="h-1.5 w-24 bg-red/20"
        />
        <Text className="pt-1.5 text-[13px] text-gray-500">out of stock </Text>
      </>
    );
  } else if (status <= 20) {
    return (
      <>
        <Progressbar
          value={status}
          color="warning"
          className="h-1.5 w-24 bg-orange/20"
        />
        <Text className="pt-1.5 text-[13px] text-gray-500">
          {status} low stock
        </Text>
      </>
    );
  } else {
    return (
      <>
        <Progressbar
          value={status}
          color="success"
          className="h-1.5 w-24 bg-green/20"
        />
        <Text className="pt-1.5 text-[13px] text-gray-500">
          {status} in stock
        </Text>
      </>
    );
  }
}

// get formatted date
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [
  {
    title: <HeaderCell title="Product" />,
    dataIndex: 'name',
    key: 'name',
    width: 300,
    render: (_: string, row: any) => (
      <AvatarCard
        src={row.imageUrls ? row.imageUrls[0] : '/placeholder.jpg'}
        name={row.name}
        description={row.categories?.map((cat: any) => cat.name).join(', ')}
        avatarProps={{
          name: row.name,
          size: 'lg',
          className: 'rounded-lg',
        }}
      />
    ),
  },
  {
    title: <HeaderCell title="Price (TND)" />,
    dataIndex: 'priceTnd',
    key: 'priceTnd',
    width: 150,
    render: (priceTnd: number) => (
      <Text className="text-sm">{priceTnd} TND</Text>
    ),
  },
  {
    title: <HeaderCell title="Price (MAR)" />,
    dataIndex: 'priceMar',
    key: 'priceMar',
    width: 150,
    render: (priceMar: number) => (
      <Text className="text-sm">{priceMar} MAR</Text>
    ),
  },
  {
    title: <HeaderCell title="Price (EUR)" />,
    dataIndex: 'priceEur',
    key: 'priceEur',
    width: 150,
    render: (priceEur: number) => <Text className="text-sm">€{priceEur}</Text>,
  },
  {
    title: <HeaderCell title="Stock" sortable />,
    dataIndex: 'stock',
    key: 'stock',
    width: 200,
    render: (stock: number) => getStockStatus(stock),
  },
  {
    title: <HeaderCell title="Available Date" />,
    dataIndex: 'availableDate',
    key: 'availableDate',
    width: 150,
    render: (availableDate: string) => formatDate(availableDate),
  },
  {
    title: <HeaderCell title="End Date" />,
    dataIndex: 'endDate',
    key: 'endDate',
    width: 150,
    render: (endDate: string) => formatDate(endDate),
  },
  {
    title: <HeaderCell title="Limit Date" />,
    dataIndex: 'isLimitDate',
    key: 'isLimitDate',
    width: 150,
    render: (isLimitDate: boolean) => (
      <Text className="text-sm">{isLimitDate ? 'Yes' : 'No'}</Text>
    ),
  },
  {
    title: <HeaderCell title="Actions" />,
    dataIndex: 'action',
    key: 'action',
    width: 120,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Tooltip
          size="sm"
          content={'Edit Product'}
          placement="top"
          color="invert"
        >
          <Link href={'/products/' + row.slug + '/edit'}>
            <ActionIcon size="sm" variant="outline" aria-label={'Edit Product'}>
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title={`Delete the product`}
          description={`Are you sure you want to delete this #${row.slug} product?`}
          onDelete={() => onDeleteItem(row.slug)}
        />
      </div>
    ),
  },
];
