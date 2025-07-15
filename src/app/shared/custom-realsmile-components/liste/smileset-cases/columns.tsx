'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import { CaseType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { PiCloudArrowDown, PiFilePdf } from 'react-icons/pi';
import CustomNotePopover from '@/app/shared/custom-realsmile-components/popovers/note-popover';
import EyeIcon from '@/components/icons/eye';
import axios from 'axios';
import toast from 'react-hot-toast';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

const handleClick = async (caseId: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `/cases/generatePdf/${caseId}`;
  const url = `${apiUrl}${endpoint}`;

  // Use toast.promise to handle the loading, success, and error states
  toast.promise(
    axios.get(url).then((response) => {
      const pdfLink = response.data.link;

      // Redirect to the provided link to start downloading
      window.location.href = pdfLink;
    }),
    {
      loading: 'Génération du PDF en cours...',
      success: 'PDF généré avec succès. Téléchargement en cours...',
      error: 'Erreur lors de la génération ou du téléchargement du PDF.',
    }
  );
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
        <div className="mr-4 inline-flex ps-2">
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
      width: 200,
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
            width: 200,
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
      title: <HeaderCell title="Date de création" />,
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
          {user.role === 'admin' && (
            <CustomNotePopover
              title={`Concernant le cas...`}
              description={row.note}
              caseId={row.id}
              onDelete={() => onDeleteItem(row.id)}
            />
          )}
          {(user.role === 'admin' ||
            user.role === 'doctor') && (
            <Tooltip
              size="sm"
              content={'Télécharger le fichier pdf du cas'}
              placement="top"
              color="invert"
            >
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
                onClick={() => handleClick(row.id)}
              >
                <PiFilePdf className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            size="sm"
            content={'Voir les détails du cas '}
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
        </div>
      ),
    },
  ];

  return columns;
};
