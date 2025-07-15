'use client';

import { HeaderCell } from '@/components/ui/table';
import { Text, Checkbox, ActionIcon, Tooltip } from 'rizzui';
import cn from '@/utils/class-names';
import PencilIcon from '@/components/icons/pencil';
import EyeIcon from '@/components/icons/eye';
import AvatarCard from '@/components/ui/avatar-card';
import DeletePopover from '@/app/shared/delete-popover';

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
  handleSelectAll,
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
  data,
  checkedItems,
  onChecked,
}: Columns) => [
  {
    title: (
      <div className="ps-3.5">
        <Checkbox
          title={'Select All'}
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 30,
    render: (_: any, row: any) => (
      <div className="inline-flex ps-3.5">
        <Checkbox
          aria-label={'ID'}
          className="cursor-pointer"
          checked={checkedItems.includes(row.id)}
          {...(onChecked && { onChange: () => onChecked(row.id) })}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="Client ID" />,
    onHeaderCell: () => onHeaderCellClick('id'),
    dataIndex: 'id',
    key: 'id',
    width: 180,
    render: (id: string) => <Text>#{id}</Text>,
  },
  {
    title: <HeaderCell title="Client Name" />,
    dataIndex: 'name',
    key: 'name',
    width: 450,
    onHeaderCell: () => onHeaderCellClick('name'),
    render: (name: string, row: any) => (
      <AvatarCard src={row?.avatar} name={name} description={row.email} />
    ),
  },
  {
    title: <HeaderCell title="Email" />,
    dataIndex: 'email',
    key: 'email',
    width: 400,
    onHeaderCell: () => onHeaderCellClick('email'),
    render: (email: string) => (
      <Text className="whitespace-nowrap font-medium">{email}</Text>
    ),
  },
  {
    title: <HeaderCell title="Montant" />,
    dataIndex: 'totalAmountDue',
    key: 'totalAmountDue',
    width: 250,
    onHeaderCell: () => onHeaderCellClick('totalAmountDue'),
    render: (invoiceCount: number) => (
      <Text className="whitespace-nowrap font-semibold">{invoiceCount}</Text>
    ),
  },
];
