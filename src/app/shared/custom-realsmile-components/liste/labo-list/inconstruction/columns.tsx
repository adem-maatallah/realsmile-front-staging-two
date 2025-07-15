'use client';

import Link from 'next/link';
import { routes } from '@/config/routes';
import { Text, Badge, Tooltip, Checkbox, ActionIcon } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { LaboCaseType } from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-case-data';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PiUpload, PiDownload } from 'react-icons/pi';
import CreateTemplateUploadForm from '@/app/shared/custom-realsmile-components/forms/in-construction-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ViewPdfForm from '../../../view-pdf';
import PDFIcon from '@/components/icons/pdf-solid';

function getStatusBadge(status: string) {
  const badgeStyle = {
    width: '90px',
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

function getLateStatusBadge(status: boolean) {
  const badgeStyle = {
    width: '70px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return status ? (
    // @ts-ignore
    <Badge
      color="danger"
      variant="outline"
      style={badgeStyle}
      className="font-medium"
    >
      Late
    </Badge>
  ) : (
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

const CountdownRenderer = ({ value, row }: any) => {
  const badgeStyle = {
    width: '110px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const initialCountdown = row.isLate ? row.time + 1 : row.time - 1;
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown: number) => {
        if (prevCountdown > 0) {
          return row.isLate ? prevCountdown + 1 : prevCountdown - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [row.isLate]);

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;
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
}: Columns) => {
  const {user} = useAuth()
  const userRole = user?.role;

  return [
    {
      title: (
        <div className="ps-2">
          <Checkbox
            title="Select All"
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
      render: (_: string, row: LaboCaseType) =>
        userRole === 'labo' ? (
          <span className="text-gray-900">{'#RSLC-' + row.id}</span>
        ) : (
          <Link
            href={routes.cases.details(row.id)}
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
      render: (value: string, row: LaboCaseType) => (
        <DateCell date={new Date(row.created_at)} />
      ),
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
      width: 120,
      render: (_: string, row: any) => (
        <RenderAction row={row} onDeleteItem={onDeleteItem} />
      ),
    },
  ];
};

function RenderAction({
  row,
  onDeleteItem,
}: {
  row: any;
  onDeleteItem: (id: string) => void;
}) {
  const { openModal } = useModal();
  const {user} = useAuth()
  const userRole = user?.role;

  const handleDownload = (filePath: string, id: string) => {
    if (filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.setAttribute('download', `download-${id}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Download triggered for: download-${id}`);
    } else {
      console.error(`Download file not found for ID: ${id}`);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 pe-4">
      {row.pdfFile && (
        <Tooltip
          size="sm"
          content="View PDF File"
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() =>
              openModal({
                view: <ViewPdfForm pdfFile={row.pdfFile} />,
                customSize: '850px',
              })
            }
          >
            <PDFIcon className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
      )}

      {userRole === 'labo' && (
        <Tooltip
          size="sm"
          content="Upload files"
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() =>
              openModal({
                view: <CreateTemplateUploadForm caseId={row.id} />,
                customSize: '850px',
              })
            }
          >
            <PiUpload className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
      )}
      {(userRole === 'admin' || userRole === 'hachem') && row.filePath && (
        <Tooltip
          size="sm"
          content="Download files"
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => handleDownload(row.filePath, row.id)}
          >
            <PiDownload className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
