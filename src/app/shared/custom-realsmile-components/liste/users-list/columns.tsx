'use client';

import Link from 'next/link';
import { routes } from '@/config/routes';
import {
  Text,
  Badge,
  Tooltip,
  Checkbox,
  ActionIcon,
  Select,
  Button,
} from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import { UserType } from '@/app/shared/custom-realsmile-components/liste/users-list/users-data';
import { FaPhone } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import {
  PiCheckCircleBold,
  PiPencilBold,
  PiPlus,
  PiPlusCircle,
} from 'react-icons/pi';
import ActivateAccountPopover from '@/app/shared/custom-realsmile-components/popovers/activate-account-popover';
import { useState } from 'react';
import { statusOptions } from './user-status-utils';
import { EditUserModalView } from '@/app/shared/custom-realsmile-components/liste/users-list/edit-user-modal-view';
import { useModal } from '@/app/shared/modal-views/use-modal';
import DeleteUserPopover from '../../delete-user-popover';
import { useRouter } from 'next/navigation';
import UserPlusIcon from '@/components/icons/user-plus';
import CreateMobileUserPopover from '../../popovers/create-account-popover';

function getRoleBadge(role: string) {
  if (role)
    switch (role.toLowerCase()) {
      case 'administrateur':
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
            <Badge color="warning" renderAsDot />
            <Text className="ms-2 font-medium text-orange-dark">{role}</Text>
          </div>
        );
      case 'docteur':
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
            <Badge color="success" renderAsDot />
            <Text className="ms-2 font-medium text-green-dark">{role}</Text>
          </div>
        );
      case 'patient':
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
            <Badge color="danger" renderAsDot />
            <Text className="ms-2 font-medium text-red-dark">{role}</Text>
          </div>
        );
      default:
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
            <Badge renderAsDot className="bg-gray-400" />
            <Text className="ms-2 font-medium text-gray-600">{role}</Text>
          </div>
        );
    }
}

function getStatusBadge(status: string) {
  if (status)
    switch (status.toLowerCase()) {
      case 'désactivé':
        return (
          <div className="flex items-center">
            <Badge color="danger" renderAsDot />
            <Text className="ms-2 font-medium text-red-dark">{status}</Text>
          </div>
        );
      case 'activé':
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
            <Badge color="success" renderAsDot />
            <Text className="ms-2 font-medium text-green-dark">{status}</Text>
          </div>
        );

      default:
        return (
          <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
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
  onUpdate: (updatedUser: any) => void;
  token: string;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  onUpdate,
  token,
}: Columns) => {
  const router = useRouter();
  return [
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
      render: (_: any, row: any) => (
        <div className="inline-flex ps-2">
          <Checkbox
            className="cursor-pointer"
            checked={checkedItems.includes(row.id)}
            {...(onChecked && { onChange: () => onChecked(row.id) })}
          />
        </div>
      ),
    },

    {
      title: <HeaderCell title="Référence" />,
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (_: string, row: UserType) => (
        <Link
          href={
            row.role === 'docteur'
              ? `/doctors/${row.id}`
              : `/patients/${row.id}/cases`
          }
          className="ml-4 block duration-200 hover:text-gray-900 hover:underline"
        >
          {'#RSU-' + row.id}
        </Link>
      ),
    },
    {
      title: <HeaderCell title="Nom et prénom" />,
      dataIndex: 'patient',
      key: 'patient',
      width: 260,
      render: (_: string, row: UserType) => (
        <Link
          href={
            row.role === 'docteur'
              ? `/doctors/${row.id}`
              : `/patients/${row.id}/cases`
          }
          className="block duration-200 hover:text-gray-900 hover:underline"
        >
          <AvatarCard
            src={row.profile_pic}
            name={row.first_name + ' ' + row.last_name}
            description={
              <>
                <MdEmail className="mr-0 inline" />
                {row.email}
              </>
            }
          />
        </Link>
      ),
    },

    {
      title: <HeaderCell title="Numéro téléphone" />,
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (_: string, row: UserType) => (
        <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          <FaPhone className="mr-2" aria-hidden="true" />
          <Text>{row.phone || 'Non Spécifié'}</Text>
        </div>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Date de création"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('created_at'),
      dataIndex: 'Date de creation',
      key: 'created_at',
      width: 200,
      render: (value: string, row: UserType) => {
        // If `DateCell` expects a Date object, use new Date(value) instead.
        return <DateCell date={new Date(row.created_at)} />;
      },
    },

    {
      title: (
        <HeaderCell
          title="Role"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'role'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('role'),
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: (value: string, row: UserType) =>
        getRoleBadge(
          row.role && row.role.charAt(0).toUpperCase() + row.role.slice(1)
        ),
    },
    {
      title: (
        <HeaderCell
          title="Statut"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'status'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('status'),
      dataIndex: 'statut',
      key: 'statut',
      width: 200,
      render: (value: string, row: UserType) =>
        getStatusBadge(
          row.status && row.status.charAt(0).toUpperCase() + row.status.slice(1)
        ),
      /* render: (value: string, row: UserType) => (
                <StatusSelect selectItem={status} />
              ), */
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          {row.role === 'docteur' && !row.has_mobile_account && row.phone && (
            <Tooltip
              size="sm"
              content={'Créer un compte mobile pour ce docteur'}
              placement="top"
              color="invert"
            >
              <CreateMobileUserPopover
                caseID={row.id}
                title={`Créer un compte mobile`}
                doctorName={`#${row.id}`}
              />
            </Tooltip>
          )}
          {row.role === 'docteur' && (
            <Tooltip
              size="sm"
              content={'Ajouter un cas pour ce docteur'}
              placement="top"
              color="invert"
            >
              <Link href={routes.cases.createCase(null, row.id)}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiPlus className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}
          {row.status === 'désactivé' && row.role == 'doctor' && (
            <ActivateAccountPopover
              caseID={row.id}
              title={`Activer le compte`}
              description={`Etes vous sur que vous voulez activer le compte  #${row.id} ?`}
            />
          )}
          {row.role !== 'patient' && ( // Hide "Modifier" for patients
            <Tooltip
              size="sm"
              content={'Modifer cet utilisateur'}
              placement="top"
              color="invert"
            >
              <Link href={'/users/' + row.id}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}
          <DeleteUserPopover
            title={`Supprimer l'utilisateur`}
            description={`Êtes vous sûre que vous voulez supprimer l'utilisateur #${row.id}?`}
            onDelete={onDeleteItem}
            userId={row.id}
            token={token}
          />
        </div>
      ),
    },
  ];
};
