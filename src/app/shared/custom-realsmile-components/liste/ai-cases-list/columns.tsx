import Link from 'next/link';
import { Text, Avatar } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import DateCell from '@/components/ui/date-cell';
import { Tooltip, ActionIcon } from 'rizzui';
import { EyeIcon } from 'lucide-react'; // Replace with your icon library
import { useAuth } from '@/context/AuthContext';
import { PiNut } from 'react-icons/pi';
import { routes } from '@/config/routes';
import AvatarCard from '@/components/ui/avatar-card';
import { MdEmail } from 'react-icons/md';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
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
  token,
}: Columns) => {
  const {user} = useAuth()

  const columns = [
    {
      title: <HeaderCell title="Patient" />,
      dataIndex: 'patient',
      key: 'patient',
      width: 250,
      render: (_: string, row: any) => (
        <AvatarCard
          src={row.patient.avatar}
          name={row.patient.name}
          description={
            <>
              <MdEmail className="mr-0 inline" />
              {row.patient.email}
            </>
          }
        />
      ),
    },
    {
      title: <HeaderCell title="Docteur" />,
      dataIndex: 'doctor',
      key: 'doctor',
      width: 250,
      render: (_: string, row: any) => (
        <AvatarCard
          src={row.doctor.avatar}
          name={row.doctor.name}
          description={
            <>
              <MdEmail className="mr-0 inline" />
              {row.doctor.email}
            </>
          }
        />
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
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (value: string) => <DateCell date={new Date(value)} />,
    },

    {
      title: <HeaderCell title="Actions" />,
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (_: string, row: any) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Voir les détails" placement="top">
            <Link href={`/realsmile-ai/${row.id}`}>
              <ActionIcon>
                <EyeIcon className="h-5 w-5" />
              </ActionIcon>
            </Link>
          </Tooltip>
          {row.isStatusHistoryIncomplete && (
            <Tooltip
              size="sm"
              content="Terminez la création du cas"
              placement="top"
              color="invert"
            >
              <Link href={routes.cases.createCase(row.id)}>
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiNut className="h-4 w-4" />
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
