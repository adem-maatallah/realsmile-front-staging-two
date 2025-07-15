'use client';

import Link from 'next/link';
import Image from 'next/image';
import { routes } from '@/config/routes';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox, Title, Text, Tooltip, ActionIcon } from 'rizzui';
import PencilIcon from '@/components/icons/pencil';
import DeletePopover from '@/app/shared/delete-popover';
import axios from 'axios'; // Import axios for delete functionality
import { toast } from 'react-hot-toast'; // Import toast for notifications
import { mutate } from 'swr'; // Use SWR mutate to refresh the list after deletion

type Columns = {
  sortConfig?: any;
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onEditItem?: (category: any) => void; // New handler for editing
};

export const getColumns = ({
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
  onChecked,
  onEditItem, // Accept onEditItem prop
}: Columns) => [
  {
    title: <HeaderCell title="Image" />,
    dataIndex: 'thumbnail',
    key: 'thumbnail',
    width: 100,
    render: (thumbnail: any, row: any) => (
      <figure className="relative aspect-square w-12 overflow-hidden rounded-lg bg-gray-100">
        <Image
          alt={row.name}
          src={thumbnail}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
      </figure>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Category Name"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'name'
        }
      />
    ),
    dataIndex: 'name',
    key: 'name',
    width: 200,
    onHeaderCell: () => onHeaderCellClick('name'),
    render: (name: string) => (
      <Title as="h6" className="!text-sm font-medium">
        {name}
      </Title>
    ),
  },
  {
    title: <HeaderCell title="Description" />,
    dataIndex: 'description',
    key: 'description',
    width: 250,
    // Display HTML description
    render: (description: string) => (
      <Text
        className="truncate !text-sm"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    ),
  },
  {
    title: (
      <HeaderCell
        title="Slug"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'slug'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('slug'),
    dataIndex: 'slug',
    key: 'slug',
    width: 200,
    render: (slug: string) => <Text>{slug}</Text>,
  },
  {
    title: (
      <HeaderCell
        title="Products"
        align="center"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'productCount'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('productCount'),
    dataIndex: 'productCount',
    key: 'productCount',
    width: 120,
    render: (products: any) => <div className="text-center">{products}</div>,
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 100,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Tooltip
          size="sm"
          content={'Edit Category'}
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => onEditItem && onEditItem(row)} // Call onEditItem handler to open the edit modal
          >
            <PencilIcon className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
        <DeletePopover
          title={`Delete the category`}
          description={`Are you sure you want to delete this #${row.id} category?`}
          onDelete={() => onDeleteItem(row.id)} // Call onDeleteItem handler for deletion
        />
      </div>
    ),
  },
];
