import Link from 'next/link';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import { FaPhone } from 'react-icons/fa6';
import { MdEmail, MdEdit, MdDelete, MdAssignmentInd } from 'react-icons/md';
import Image from 'next/image';

export function renderStatusOptionDisplayValue(value: boolean) {
  switch (value) {
    case true:
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            Actif
          </Text>
        </div>
      );
    case false:
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
            Inactif
          </Text>
        </div>
      );
  }
}

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  onEditClick: (commercial: any) => void;
  onDeleteClick: (commercial: any) => void;
  onAssignClick: (commercial: any) => void;
};

export const getColumns = ({
  data = [],
  handleSelectAll,
  checkedItems,
  onHeaderCellClick,
  onChecked,
  onEditClick,
  onDeleteClick,
  onAssignClick,
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
      <Checkbox
        className="cursor-pointer"
        checked={checkedItems.includes(row.id)}
        {...(onChecked && { onChange: () => onChecked(row.id) })}
      />
    ),
  },
  {
    title: <HeaderCell title="Référence" />,
    dataIndex: 'id',
    key: 'id',
    width: 150,
    render: (_: any, row: any) => (
      <Link href={`/commercials/${row.id}`} className="ml-4 block">
        {'#COM-' + row.id}
      </Link>
    ),
  },
  {
    title: <HeaderCell title="Nom et prénom" />,
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (_: any, row: any) => (
      <AvatarCard
        src={row.profile_pic || '/default-avatar.png'}
        name={`${row.first_name || ''} ${row.last_name || ''}`}
        description={
          <>
            <MdEmail className="mr-0 inline" />
            {row.email || 'Email non disponible'}
          </>
        }
      />
    ),
  },
  {
    title: <HeaderCell title="Numéro téléphone" />,
    dataIndex: 'phone',
    key: 'phone',
    width: 200,
    render: (_: any, row: any) => (
      <div className="flex items-center">
        <FaPhone className="mr-2" />
        <Text>{row.phone || 'Non Spécifié'}</Text>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Pays" />,
    dataIndex: 'country',
    key: 'country',
    width: 150,
    render: (_: any, row: any) => (
      <div className="flex items-center">
        <Image
          alt={`Drapeau de ${row.country}`}
          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${row.country}.svg`}
          className="mr-2 inline h-4 rounded-sm"
          width={16}
          height={16}
        />
        <Text>{row.country}</Text>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Utilisateurs assignés" />,
    dataIndex: 'assigned_users',
    key: 'assigned_users',
    width: 200,
    render: (_: any, row: any) => (
      <div className="ml-4 font-medium text-gray-700 dark:text-gray-600">
        {row.assigned_users || 0}
      </div>
    ),
  },
  {
    title: <HeaderCell title="Statut" />,
    dataIndex: 'status',
    key: 'status',
    width: 150,
    render: (_: any, row: any) => renderStatusOptionDisplayValue(row.status),
  },
  {
    title: <HeaderCell title="Actions" />,
    dataIndex: 'action',
    key: 'action',
    width: 200,
    render: (_: any, row: any) => (
      <div className="flex items-center gap-2">
        <Tooltip content="Attribuer un docteur" placement="top">
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => onAssignClick(row)}
          >
            <MdAssignmentInd className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
        <Tooltip content="Modifier" placement="top">
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => onEditClick(row)}
          >
            <MdEdit className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
        <Tooltip content="Supprimer" placement="top">
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => onDeleteClick(row)}
          >
            <MdDelete className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
  },
];
