'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useSession from next-auth
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import { LaboIiwglType } from './iiwgl-data';
import { CaseType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { LaboCaseType } from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-case-data';
import CustomNotePopover from '@/app/shared/custom-realsmile-components/popovers/note-popover';
import CustomModifiableNotePopover from '../../../popovers/custom-modifiable-note-popover';

function getAdminStatusBadge(status: string) {
  switch (status) {
    case 'rejected':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium text-red-dark">{status}</Text>
        </div>
      );
    case 'not treated':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium text-orange-dark">{status}</Text>
        </div>
      );
    case 'accepted':
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

function getDoctorStatusBadge(status: string) {
  switch (status) {
    case 'rejected':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium text-red-dark">{status}</Text>
        </div>
      );
    case 'not treated':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium text-orange-dark">{status}</Text>
        </div>
      );
    case 'accepted':
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
}: Columns) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useAuth() // Extract session data to determine user role

  const columns = [
    // Select All Checkbox
    {
      title: (
        <div className="ps-2">
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
      render: (_: any, row: LaboIiwglType) => (
        <div className="inline-flex ps-2">
          <Checkbox
            className="cursor-pointer"
            checked={checkedItems.includes(row.id)}
            {...(onChecked && { onChange: () => onChecked(row.id) })}
          />
        </div>
      ),
    },
    // Patient Reference
    {
      title: <HeaderCell title="Patient reference" />,
      dataIndex: 'Réference du patient',
      width: 100,
      render: (_: string, row: LaboIiwglType) => (
        <Link
          href="#"
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          {'#RSL-' + row.id}
        </Link>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Creation Date"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'createdAt'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('createdAt'),
      dataIndex: 'Creation Date',
      key: 'patient.creationDate',
      width: 100,
      render: (value: string, row: LaboIiwglType) => (
        <DateCell date={new Date(row.createdAt)} />
      ),
    },

    {
      title: <HeaderCell title="Admin Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string, row: LaboIiwglType) =>
        getAdminStatusBadge(row.adminStatus),
    },

    {
      title: <HeaderCell title="Doctor Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string, row: LaboIiwglType) =>
        getDoctorStatusBadge(row.doctorStatus),
    },

    // IIWGL Link Column
    {
      title: <HeaderCell title="IIWGL Link" />,
      dataIndex: 'iiwglLink',
      key: 'iiwglLink',
      width: 120,
      render: (_: any, row: LaboIiwglType) => (
        <Link
          href={row.url}
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          {row.url}
        </Link>
      ),
    },

    // Actions Column
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          <Tooltip
            size="sm"
            content={'Admin Note'}
            placement="top"
            color="invert"
          >
            <CustomModifiableNotePopover
              title={`View Admin Note`}
              description={row.admin_note}
              caseId={row.id}
              onDelete={() => onDeleteItem(row.id)}
              isLabo={true}
              isLaboAdmin={true}
              updateUrl="/iiwgl/update-admin-note" // Add this line
            />
          </Tooltip>

          <Tooltip
            size="sm"
            content={'Doctor Note'}
            placement="top"
            color="invert"
          >
            <CustomModifiableNotePopover
              title={`View Doctor Note`}
              description={row.doctor_note}
              caseId={row.id}
              onDelete={() => onDeleteItem(row.id)}
              isLabo={true}
              updateUrl="/iiwgl/update-doctor-note" // Add this line
            />
          </Tooltip>

          {/*<Tooltip*/}
          {/*    size="sm"*/}
          {/*    content={'Edit Invoice'}*/}
          {/*    placement="top"*/}
          {/*    color="invert"*/}
          {/*>*/}
          {/*    <Link href={routes.invoice.edit(row.id)}>*/}
          {/*        <ActionIcon*/}
          {/*            as="span"*/}
          {/*            size="sm"*/}
          {/*            variant="outline"*/}
          {/*            className="hover:!border-gray-900 hover:text-gray-700"*/}
          {/*        >*/}
          {/*            <PencilIcon className="h-4 w-4"/>*/}
          {/*        </ActionIcon>*/}
          {/*    </Link>*/}
          {/*</Tooltip>*/}

          {/*<DeletePopover*/}
          {/*    title={`Delete the invoice`}*/}
          {/*    description={`Are you sure you want to delete this #${row.id} invoice?`}*/}
          {/*    onDelete={() => onDeleteItem(row.id)}*/}
          {/*/>*/}
        </div>
      ),
    },
  ];

  return columns;
};
