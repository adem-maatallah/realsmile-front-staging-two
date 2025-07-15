import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import {
  PiCloudArrowDown,
  PiDownload,
  PiMessengerLogo,
  PiNut,
} from 'react-icons/pi';
import CustomNotePopover from '@/app/shared/custom-realsmile-components/popovers/note-popover';
import DeleteCasePopover from '../../delete-case-popover';
import toast from 'react-hot-toast';
import ConfirmSendButton from '../../modals/buttons/confirm-send-modal-button';
import ConfirmSendModal from '../../modals/confirm-send-modal';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  setCasesData?: any;
  caseData?: any;
  token: any;
};

const downloadFile = (url: string, fileName: string) => {
  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    resolve();
  });
};

const downloadSTLFiles = (stls: any[]) => {
  toast.promise(
    Promise.all(
      stls.map((stl, index) => {
        if (stl) {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              downloadFile(stl, `stl_file_${index + 1}.stl`).then(resolve);
            }, index * 1000); // Adding a delay to ensure sequential downloads
          });
        } else {
          return Promise.resolve();
        }
      })
    ),
    {
      loading: 'Téléchargement des fichiers STL...',
      success: 'Tous les fichiers STL ont été téléchargés avec succès !',
      error: 'Erreur lors du téléchargement des fichiers STL.',
    },
    {
      success: {
        duration: 5000,
        icon: '✅',
      },
      error: {
        duration: 5000,
        icon: '❌',
      },
    }
  );
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  setCasesData,
  caseData,
  token,
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
      width: 250,
      render: (_: string, row: any) => <Text>{row.patient.name}</Text>,
    },
    {
      title: (
        <HeaderCell
          title="Date de naissance"
          sortable
          ascending={
            sortConfig?.direction === 'asc' &&
            sortConfig?.key === 'patient.date_of_birth'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('date_of_birth'),
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      width: 150,
      render: (value: string, row: any) => (
        <DateCell date={new Date(row.patient.date_of_birth)} />
      ),
    },
    ...(user.role === 'admin'
      ? [
          {
            title: <HeaderCell title="Docteur" />,
            dataIndex: 'doctor',
            key: 'doctor',
            width: 250,
            render: (_: string, row: any) => (
              <AvatarCard
                src={row.doctor.avatar}
                name={row.doctor.name}
                description={`${row.doctor.phone}`}
              />
            ),
          },
        ]
      : []),
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
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (value: string, row: any) => (
        <DateCell date={new Date(row.created_at)} />
      ),
    },
    {
      title: <HeaderCell title="Statut" />,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: string, row: any) => (
        <Badge color={row.status === 'en_cours' ? 'warning' : 'success'}>
          {row.status === 'en_cours' ? 'En Cours' : 'Envoyé'}
        </Badge>
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
              content={'Télécharger le(s) fichier STL(s)'}
              placement="top"
              color="invert"
            >
              <span
                onClick={() => downloadSTLFiles(row.stls)}
                className="cursor-pointer"
              >
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiDownload className="h-4 w-4" />
                </ActionIcon>
              </span>
            </Tooltip>
          )}
          {user?.role == 'admin' && (
            <DeleteCasePopover
              title={`Supprimer le cas`}
              description={`Êtes vous sûre que vous voulez supprimer le cas #${row.id}?`}
              onDelete={onDeleteItem}
              caseId={row.id}
              token={token}
            />
          )}
          {user?.role == 'hachem' && row.status != 'envoyé' && (
            <ConfirmSendButton
              view={<ConfirmSendModal caseId={row.id} />}
              customSize="600px"
              className="mt-0 w-20" // Adjusted width
            />
          )}
        </div>
      ),
    },
  ];

  return columns;
};
