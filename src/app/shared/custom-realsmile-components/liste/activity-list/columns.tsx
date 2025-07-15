import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import DateAgeCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import Image from 'next/image';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  setActivityData?: any;
  activityData?: any;
  token: string;
};

export const getActivityColumns = ({
  sortConfig,
  onHeaderCellClick,
}: Columns) => {
  const {user} = useAuth()

  const columns = [
    {
      title: <HeaderCell title="Titre" />,
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: <HeaderCell title="Description" />,
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (value: string) => (
        <div
          className="text-truncate w-25"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ),
    },
    {
      title: <HeaderCell title="Image" />,
      dataIndex: 'imageURL',
      key: 'imageURL',
      width: 150,
      render: (value: string) => (
        <div className="relative h-8 w-8 rounded-full">
          <Image
            src={value}
            alt="activity"
            className="h-full w-full rounded-full object-cover"
            layout="fill"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = '/not-found.png'; // Path to your placeholder icon
            }}
          />
        </div>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Date"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (value: string) => <DateAgeCell date={new Date(value)} />,
    },
  ];

  if (user.role === 'admin') {
    columns.push({
      title: <HeaderCell title="Propriétaire de la notification" />,
      dataIndex: 'notificationOwner',
      key: 'notificationOwner',
      width: 250,
      render: (_: any, row: any) => (
        <AvatarCard
          src={row.userImage}
          name={row.userName}
          description={row.phone}
        />
      ),
    });
  }

  return columns;
};
