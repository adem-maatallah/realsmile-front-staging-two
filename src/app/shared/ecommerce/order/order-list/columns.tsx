'use client';

import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import { Badge, Text, Tooltip, ActionIcon } from 'rizzui';
import { routes } from '@/config/routes';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import DateCell from '@/components/ui/date-cell';
import { useAuth } from '@/context/AuthContext';

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'draft':
      return (
        <div className="flex items-center">
          <Badge color="secondary" renderAsDot />
          <Text className="ms-2 font-medium text-gray-600">Draft</Text>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium text-orange-dark">Pending</Text>
        </div>
      );
    case 'shipping':
      return (
        <div className="flex items-center">
          <Badge color="info" renderAsDot />
          <Text className="ms-2 font-medium text-blue-600">Shipping</Text>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium text-green-dark">Completed</Text>
        </div>
      );
    case 'cancelled':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium text-red-dark">Cancelled</Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium text-gray-600">Unknown</Text>
        </div>
      );
  }
}

type Columns = {
  sortConfig?: any;
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
};

export const getColumns = ({
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
}: Columns) => {
  const {user} = useAuth() // Get session data to access the user role

  const isAdmin = user?.role === 'admin';
  return [
    {
      title: <HeaderCell title="Order Reference" />,
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
      render: (value: string) => <Text>#{value}</Text>,
    },
    {
      title: <HeaderCell title="Customer Name" />,
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (customerName: string) => <Text>{customerName}</Text>,
    },
    {
      title: <HeaderCell title="Total Amount" />,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (totalAmount: number) => (
        <Text className="font-medium text-gray-700">{totalAmount} TND</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Created"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'createdAt'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (createdAt: Date) => <DateCell date={createdAt} />,
    },
    {
      title: (
        <HeaderCell
          title="Modified"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'updatedAt'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      render: (updatedAt: Date) => <DateCell date={updatedAt} />,
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: <HeaderCell title="Actions" className="opacity-0" />,
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-4">
          <Tooltip
            size="sm"
            content={'View Order'}
            placement="top"
            color="invert"
          >
            <Link href={routes.eCommerce.orderDetails(row.reference)}>
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                className="hover:text-gray-700"
              >
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
        </div>
      ),
    },
  ];
};
