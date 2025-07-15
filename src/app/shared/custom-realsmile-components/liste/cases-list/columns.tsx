import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { PiCloudArrowDown, PiMessengerLogo, PiNut } from 'react-icons/pi';
import CustomNotePopover from '@/app/shared/custom-realsmile-components/popovers/note-popover';
import DeleteCasePopover from '../../delete-case-popover';
import CreateInvoicePopover from '../../popovers/create-invoice-popover';
import { BiVideo } from 'react-icons/bi';
import { FaTooth } from 'react-icons/fa6';

function getStatusBadge(status: string, isRefused: boolean) {
  const badgeStyle = {
    width: '90px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (isRefused) {
    return (
      <Badge
        variant="outline"
        color="danger"
        style={badgeStyle}
        className="border-red-600 font-medium text-red-600"
      >
        Refusé
      </Badge>
    );
  }

  switch (status) {
    case 'Soumission Incompléte':
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
    case 'SmileSet En Cours':
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
    case 'En Fabrication':
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
    case 'En Traitement':
      return (
        <Badge
          variant="outline"
          color="danger"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'Approbation Requise':
      return (
        <Badge
          variant="outline"
          color="info"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'Expédié':
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
    case 'Cas Terminé':
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
      render: (_: string, row: any) => {
        if (user?.role === 'labo') {
          return (
            <AvatarCard src={row.patient.avatar} name={row.patient.name} />
          );
        }
        return (
          <Link
            href={
              row.status === 'Soumission Incompléte'
                ? routes.cases.createCase(row.id)
                : routes.cases.details(row.id)
            }
            className="duration-200 hover:text-gray-900 hover:underline"
          >
            <AvatarCard src={row.patient.avatar} name={row.patient.name} />
          </Link>
        );
      },
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: <HeaderCell title="Docteur" />,
            dataIndex: 'docteur',
            key: 'doctor',
            width: 250,
            render: (_: string, row: any) => (
              <Link
                href={`/doctors/${row.doctor?.user?.id}`}
                className="duration-200 hover:text-gray-900 hover:underline"
              >
                <AvatarCard
                  src={row.doctor.avatar}
                  name={row.doctor.name}
                  description={`${row.doctor.phone}`}
                />
              </Link>
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
      dataIndex: 'Date de création',
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
      width: 120,
      align: 'center',
      render: (value: string, row: any) =>
        getStatusBadge(row.status, row.is_refused),
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
      title: <HeaderCell title="type" />,
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      render: (value: string, row: any) => getTypeBadge(row.type),
    },
  ];

  // Add the actions column if the user's role is not "labo"
  if (user?.role !== 'labo') {
    columns.push({
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          {user?.role === 'admin' && (
            <>
              <Tooltip
                size="sm"
                content={'Allez vers les fichiers du cas'}
                placement="top"
                color="invert"
              >
                <Link href={routes.laboratory.files(row.id)}>
                  <ActionIcon
                    variant="outline"
                    as="span"
                    size="sm"
                    className="hover:!border-gray-900 hover:text-gray-700"
                  >
                    <PiCloudArrowDown className="h-4 w-4" />
                  </ActionIcon>
                </Link>
              </Tooltip>
              {row.video_id && (
                <Tooltip
                  size="sm"
                  content={'Allez vers le lien du vidéo'}
                  placement="top"
                  color="invert"
                >
                  <Link
                    href={`https://embed.api.video/vod/${row.video_id}`}
                    target="_blank"
                  >
                    <ActionIcon
                      variant="outline"
                      as="span"
                      size="sm"
                      className="hover:!border-gray-900 hover:text-gray-700"
                    >
                      <BiVideo className="h-4 w-4" />
                    </ActionIcon>
                  </Link>
                </Tooltip>
              )}
            </>
          )}
          {user?.role === 'admin' && (
            <CustomNotePopover
              title={`Concernant le cas...`}
              description={row.note}
              caseId={row.id}
              onDelete={() => onDeleteItem(row.id)}
              setCasesData={setCasesData}
              caseData={caseData}
            />
          )}
          {user?.role === 'admin' &&
            !row.hasInvoice &&
            row.status !== 'SmileSet En Cours' &&
            row.status !== 'Approbation Requise' &&
            row.status !== 'Soumission Incompléte' &&
            row.type !== 'Commandé' && (
              <CreateInvoicePopover
                title={`Créer une facture`}
                caseId={row.id}
                setCasesData={setCasesData} // Ensure this is passed if needed for state updates
              />
            )}

          {row.status === 'Soumission Incompléte' ? (
            <Tooltip
              size="sm"
              content={'Terminez la création du cas'}
              placement="top"
              color="invert"
            >
              <Link href={routes.cases.createCase(row.id)}>
                <ActionIcon
                  as="span"
                  size="sm"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiNut className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          ) : (
            <Tooltip
              size="sm"
              content={'Voir les détails du cas'}
              placement="top"
              color="invert"
            >
              <Link href={routes.cases.details(row.id)}>
                <ActionIcon
                  variant="outline"
                  as="span"
                  size="sm"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <EyeIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
          )}
          {user?.role === 'admin' && (
            <DeleteCasePopover
              title={`Supprimer le cas`}
              description={`Êtes vous sûre que vous voulez supprimer le cas #${row.id}?`}
              onDelete={onDeleteItem}
              caseId={row.id}
              token={token}
            />
          )}
          {user?.role === 'doctor' &&
            row.status === 'Soumission Incompléte' && (
              <DeleteCasePopover
                title={`Supprimer le cas`}
                description={`Êtes vous sûre que vous voulez supprimer le cas #${row.id}?`}
                onDelete={onDeleteItem}
                caseId={row.id}
                token={token}
              />
            )}
          {(user?.role === 'admin' || user?.role === 'doctor') && row.treatment_exists === true &&(
              <Tooltip
              size="sm"
              content={'Accéder au traitement de ce cas'}
              placement="top"
              color="invert"
            >
              <Link href={`/cases/${row.id}/treatment`}>
                <span  className="inline-block">
                  <button
                    type="button"
                    className="mt-0 w-7.5 h-7 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-dark transition focus:outline-none focus-visible:ring-[1.8px] focus-visible:ring-muted focus-visible:ring-offset-2 ring-offset-background" // Colors updated
                  >
                    <FaTooth className="center" />
                  </button>
                </span>
              </Link>
            </Tooltip>
            )}
        </div>
      ),
    });
  }

  return columns;
};
