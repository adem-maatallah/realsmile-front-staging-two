'use client';

import Link from 'next/link';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import Image from 'next/image';
import { DoctorType } from '@/app/shared/custom-realsmile-components/liste/doctors-list/doctors-data';
import { FaPhone } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { PiPlus } from 'react-icons/pi';
import { BiDollar, BiMoney } from 'react-icons/bi';
import ActivateAccountPopover from '@/app/shared/custom-realsmile-components/popovers/activate-account-popover';

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
  token: string;
  role: string;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  token,
  role,
}: Columns) => [
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
    render: (_: string, row: DoctorType) => (
      <Link
        href={routes.doctor.cases(row.id)}
        className="ml-4 block duration-200 hover:text-gray-900 hover:underline"
      >
        {'#RSD-' + row.id}
      </Link>
    ),
  },
  {
    title: <HeaderCell title="Nom et prénom" />,
    dataIndex: 'doctor',
    key: 'doctor',
    width: 260,
    render: (_: string, row: DoctorType) => (
      <Link
        href={`/doctors/${row.id}`}
        className="block duration-200 hover:text-gray-900 hover:underline"
      >
        <AvatarCard
          src={row.profile_pic}
          name={row.full_name}
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
    render: (_: string, row: DoctorType) => (
      <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
        <FaPhone className="mr-2" aria-hidden="true" />
        <Text>{row.phone || 'Non Spécifié'}</Text>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Adresse" />,
    dataIndex: 'adresse',
    key: 'adresse',
    width: 200,
    render: (_: string, row: DoctorType) => (
      <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
        <Image
          alt={`${row.country}`}
          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${row.country}.svg`}
          className={'mr-2 inline h-4 rounded-sm'}
          width={16}
          height={16}
        />
        <Text>
          {row.city}, {row.country}
        </Text>
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
    render: (value: string, row: DoctorType) => (
      <DateCell date={new Date(row.created_at)} />
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
    render: (value: string, row: DoctorType) =>
      getStatusBadge(
        row.status && row.status?.charAt(0).toUpperCase() + row.status.slice(1)
      ),
  },
  {
    title: <HeaderCell title="Total Impayé" />,
    dataIndex: 'total_unpaid',
    key: 'total_unpaid',
    width: 150,
    render: (_: string, row: DoctorType) => {
      const totalUnpaid = Number(row?.total_unpaid) || 0;
      const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: row.currency,
      });
      return (
        <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          <Text className="text-red-500">
            {currencyFormatter.format(totalUnpaid)}
          </Text>
        </div>
      );
    },
  },
  {
    title: <HeaderCell title="Total Payé" />,
    dataIndex: 'total_paid',
    key: 'total_paid',
    width: 150,
    render: (_: string, row: DoctorType) => {
      const totalPaid = Number(row?.total_paid) || 0;
      const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: row.currency,
      });
      return (
        <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          <Text className="text-green-500">
            {currencyFormatter.format(totalPaid)}
          </Text>
        </div>
      );
    },
  },
  {
    title: <HeaderCell title="Montant Total" />,
    dataIndex: 'total_amount',
    key: 'total_amount',
    width: 150,
    render: (_: string, row: DoctorType) => {
      const totalAmount = Number(row?.total_amount) || 0;
      const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: row.currency,
      });
      return (
        <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          <Text>{currencyFormatter.format(totalAmount)}</Text>
        </div>
      );
    },
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 140,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-3 pe-3">
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
        <Tooltip
          size="sm"
          content={'Voir les transactions'}
          placement="top"
          color="invert"
        >
          <Link href={`/doctors/${row.id}/transactions`}>
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              className="hover:!border-gray-900 hover:text-gray-700"
            >
              <BiMoney className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Link href={routes.doctor.doctorFile(row.id)}>
          <ActionIcon
            as="span"
            size="sm"
            variant="outline"
            className="hover:!border-gray-900 hover:text-gray-700"
          >
            <BiDollar className="h-4 w-4" />
          </ActionIcon>
        </Link>
        {row.status === 'désactivé' && role == 'admin' && (
          <ActivateAccountPopover
            caseID={row.id}
            title={`Activation du compte`}
            doctorName={`${row.full_name}`}
          />
        )}
      </div>
    ),
  },
];
