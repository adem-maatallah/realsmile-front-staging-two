'use client';

import Link from 'next/link';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import { CaseType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { LaboCaseType } from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-case-data';
import CustomNotePopover from '@/app/shared/custom-realsmile-components/popovers/note-popover';
import { PiCloudArrowDown } from 'react-icons/pi';
import { useEffect, useState } from 'react';

function getStatusBadge(status: string) {
  const badgeStyle = {
    width: '90px', // You can adjust the width as needed
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (status) {
    case 'Done':
      return (
        // @ts-ignore
        <Badge
          color="success"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'Missing link':
      return (
        // @ts-ignore
        <Badge
          color="danger"
          variant="outline"
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
          style={badgeStyle}
          className="bg-gray-400 font-medium"
          variant="outline"
        >
          {status}
        </Badge>
      );
  }
}

function getLateStatusBadge(status: any) {
  const badgeStyle = {
    width: '70px', // You can adjust the width as needed
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (status) {
    case false:
      return (
        // @ts-ignore
        <Badge
          color="success"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          In time
        </Badge>
      );
    case true:
      return (
        // @ts-ignore
        <Badge
          color="danger"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          Late
        </Badge>
      );
    default:
      return (
        // @ts-ignore
        <Badge
          color="success"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          In time
        </Badge>
      );
  }
}

const CountdownRenderer = ({ value, row }: any) => {
  const badgeStyle = {
    width: '110px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Initialize countdown with row.time and adjust it based on the isLate property
  const initialCountdown = row.isLate ? row.time + 1 : row.time - 1;
  const [countdown, setCountdown] = useState(initialCountdown);

  console.log('row.time', row.time);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown: number) => {
        if (prevCountdown > 0) {
          return row.isLate ? prevCountdown + 1 : prevCountdown - 1;
        } else {
          clearInterval(interval); // Stop the interval when countdown reaches 0
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup function
  }, [row.isLate]);

  // Convert countdown seconds into hours, minutes, and seconds
  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  // Determine the badge's color based on isLate
  const badgeColor = row.isLate ? 'danger' : 'success';

  return (
    // @ts-ignore
    <Badge
      color={badgeColor}
      variant="outline"
      style={badgeStyle}
      className="font-medium"
    >
      {`${hours}h ${minutes}m ${seconds}s`}
    </Badge>
  );
};

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
    title: <HeaderCell title="Reference" />,
    dataIndex: 'id',
    key: 'id',
    width: 150,
    render: (_: string, row: LaboCaseType) => (
      <Link
        href={routes.laboratory.files(row.id)}
        className="duration-200 hover:text-gray-900 hover:underline"
      >
        {'#RSLC-' + row.id}
      </Link>
    ),
  },
  {
    title: <HeaderCell title="Patient" />,
    dataIndex: 'patient',
    key: 'patient',
    width: 200,
    render: (_: string, row: LaboCaseType) => (
      <AvatarCard src={row.patient.avatar} name={row.patient.name} />
    ),
  },
  {
    title: (
      <HeaderCell
        title="Creation Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('created_at'),
    dataIndex: 'Creation Date',
    key: 'created_at',
    width: 200,
    render: (value: string, row: CaseType) => {
      // If `DateCell` expects a Date object, use new Date(value) instead.
      return <DateCell date={new Date(row.created_at)} />;
    },
  },

  {
    title: <HeaderCell title="status" />,
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (value: string, row: LaboCaseType) =>
      getStatusBadge(row.require_smile_set_upload),
  },
  {
    title: <HeaderCell title="is Late" />,
    dataIndex: 'isLate',
    key: 'isLate',
    width: 120,
    render: (value: string, row: LaboCaseType) =>
      getLateStatusBadge(row.isLate),
  },

  {
    title: <HeaderCell title="Time" />,
    dataIndex: 'time',
    key: 'time',
    width: 150,
    render: (value: string, row: LaboCaseType) => (
      <CountdownRenderer value={value} row={row} />
    ),
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 140,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-3 pe-3">
        <CustomNotePopover
          title={`View Note`}
          description={row.note}
          caseId={row.id}
          onDelete={() => onDeleteItem(row.id)}
          isLabo={true}
          // setCasesData={setCasesData}
          // caseData={caseData}
        />
        <Tooltip
          size="sm"
          content={'Go to case files'}
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
        {/*<Tooltip*/}
        {/*    size="sm"*/}
        {/*    content={'View Invoice'}*/}
        {/*    placement="top"*/}
        {/*    color="invert"*/}
        {/*>*/}
        {/*    <Link href={routes.invoice.details(row.id)}>*/}
        {/*        <ActionIcon*/}
        {/*            as="span"*/}
        {/*            size="sm"*/}
        {/*            variant="outline"*/}
        {/*            className="hover:!border-gray-900 hover:text-gray-700"*/}
        {/*        >*/}
        {/*            <EyeIcon className="h-4 w-4"/>*/}
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
