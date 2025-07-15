'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { CaseType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { PiCloudArrowDown, PiInvoiceLight } from 'react-icons/pi';
import UserInfoIcon from '@/components/icons/user-info';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  openPrintModal: (caseData: any) => void;
};

function getTypeBadge(status: string) {
  const badgeStyle = {
    width: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (status) {
    case 'Normale':
      return (
        <Badge
          variant="outline"
          color="secondary"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'Rénumérisé':
      return (
        <Badge
          variant="outline"
          color="warning"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'Commandé':
      return (
        <Badge
          variant="outline"
          color="success"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          style={badgeStyle}
          className="bg-gray-400 font-medium"
        >
          {status}
        </Badge>
      );
  }
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  openPrintModal,
}: Columns) => {
  const {user} = useAuth()

  const columns = [
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
      width: 50,
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
      title: <HeaderCell title="Patient" />,
      dataIndex: 'patient',
      key: 'patient',
      width: 250,
      render: (_: string, row: CaseType) => (
        <Link
          href={routes.cases.details(row.id)}
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          <AvatarCard src={row.patient.avatar} name={row.patient.name} />
        </Link>
      ),
    },
    ...(user.role === 'admin'
      ? [
          {
            title: <HeaderCell title="Docteur" />,
            dataIndex: 'docteur',
            key: 'doctor',
            width: 250,
            render: (_: string, row: CaseType) => (
              <Link
                href={`/doctors/${row.doctor.user.id}`}
                className="block duration-200 hover:text-gray-900 hover:underline"
              >
                <AvatarCard
                  src={row.doctor.avatar || ''}
                  name={row.doctor.name || 'Unknown'}
                  description={`${row.doctor.phone || 'N/A'}`}
                />
              </Link>
            ),
          },
        ]
      : []),
    {
      title: <HeaderCell title="type" />,
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      render: (value: string, row: any) => getTypeBadge(row.type),
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
      dataIndex: 'Date de création',
      key: 'created_at',
      width: 200,
      render: (value: string, row: CaseType) => (
        <DateCell date={new Date(row.created_at)} />
      ),
    },

    {
      title: (
        <HeaderCell
          title="Date du statut"
          sortable
          ascending={
            sortConfig?.direction === 'asc' &&
            sortConfig?.key === 'status_created_at'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('status_created_at'),
      dataIndex: 'Date du statut',
      key: 'status_created_at',
      width: 150,
      render: (value: string, row: any) => (
        <DateCell date={new Date(row.status_created_at)} />
      ),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          {/* Action for admin role */}
          {user.role === 'admin' && (
            <Tooltip
              size="sm"
              content={'Allez vers les fichiers du cas'}
              placement="top"
              color="invert"
            >
              <Link href={routes.laboratory.files(row.id)}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiCloudArrowDown className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}

          {/* Print Modal Action for 'admin' and 'hachem' */}
          {(user.role === 'admin' ||
            user.role === 'hachem') && (
            <Tooltip
              size="sm"
              content={'Imprimer le PDF'}
              placement="top"
              color="invert"
            >
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
                onClick={() => openPrintModal(row)}
              >
                <PiCloudArrowDown className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}

          {/* 'Voir les détails du docteur' action only for 'hachem' */}
          {user.role === 'hachem' && (
            <Tooltip
              size="sm"
              content={'Voir les détails du docteur'}
              placement="top"
              color="invert"
            >
              <Link href={'/users/' + row.doctor.user.id}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <UserInfoIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}

          {/* Action available to all users */}
          <Tooltip
            size="sm"
            content={'Voir les détails du cas'}
            placement="top"
            color="invert"
          >
            <Link href={routes.cases.details(row.id)}>
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>

          {/* Conditional action if 'devis' exists */}
          {row.devis && (
            <Tooltip
              size="sm"
              content={'Voir le devis du cas'}
              placement="top"
              color="invert"
            >
              <Link href={routes.devis.details(row.devis)}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiInvoiceLight className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
