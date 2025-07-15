'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Ensure you're importing useSession correctly
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { DevisType } from '@/app/shared/custom-realsmile-components/liste/devis-list/devis-data';

function getStatusBadge(status: string) {
  const badgeStyle = {
    width: '60px', // You can adjust the width as needed
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (status) {
    case 'draft':
      return (
        // @ts-ignore
        <Badge
          color="secondary"
          variant="outline"
          // @ts-ignore

          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'réfusé':
      return (
        // @ts-ignore
        <Badge
          color="danger"
          variant="outline"
          // @ts-ignore

          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'accepté':
      return (
        // @ts-ignore
        <Badge
          color="success"
          variant="outline"
          // @ts-ignore

          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    default:
      return (
        // @ts-ignore
        <Badge
          // @ts-ignore
          style={badgeStyle}
          className="bg-gray-400 font-medium"
          variant="outline"
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
      title: <HeaderCell title="Réference de devis" />,
      dataIndex: 'Réference de cas',
      width: 180,
      render: (_: string, row: DevisType) => (
        <Link
          href={routes.devis.details(row.id)}
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          {'#RSD-' + row.id}
        </Link>
      ),
    },
    // Conditionally render the Doctor column
    ...(user.role === 'admin'
      ? [
          {
            title: <HeaderCell title="Docteur" />,
            dataIndex: 'docteur',
            key: 'doctor',
            width: 250,
            render: (_: string, row: DevisType) => (
              <AvatarCard
                src={row.doctor?.profilePic}
                name={row.doctor?.fullName}
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
      dataIndex: 'Date de création',
      key: 'created_at',
      width: 200,
      render: (value: string, row: DevisType) => (
        <DateCell date={new Date(row.created_at)} />
      ),
    },

    {
      title: (
        <HeaderCell
          title="Montant"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'price'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('price'),
      dataIndex: 'price',
      key: 'price',
      width: 200,
      render: (_: any, value: DevisType) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value.price}
        </Text>
      ),
    },

    {
      title: <HeaderCell title="Statut" />,
      dataIndex: 'status',
      key: 'status',
      width: 60,
      align: 'center',
      render: (value: string, row: DevisType) => getStatusBadge(row.status),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
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

          <Tooltip
            size="sm"
            content={'Voir les détails du devis'}
            placement="top"
            color="invert"
          >
            <Link href={routes.devis.details(row.id)}>
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
