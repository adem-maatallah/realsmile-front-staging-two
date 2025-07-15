'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import { ActionIcon, Checkbox } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { PatientType } from './patients-data';
import { PiWarningCircleBold } from 'react-icons/pi';

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
      width: 30,
      render: (_: any, row: PatientType) => (
        <div className="inline-flex ps-2">
          <Checkbox
            className="cursor-pointer"
            checked={checkedItems.includes(row.patient?.id || '')}
            {...(onChecked && {
              onChange: () => onChecked(row.patient?.id || ''),
            })}
          />
        </div>
      ),
    },
    {
      title: <HeaderCell title="Réference du patient" />,
      dataIndex: 'Réference du patient',
      width: 180,
      render: (_: string, row: PatientType) =>
        row.patient?.id ? (
          <Link
            href={routes.patients.cases(row.patient.id)}
            className="duration-200 hover:text-gray-900 hover:underline"
          >
            {'#RSP-' + row.patient.id}
          </Link>
        ) : (
          'N/A'
        ),
    },
    {
      title: <HeaderCell title="Patient" />,
      dataIndex: 'patient',
      key: 'patient',
      width: 250,
      render: (_: string, row: PatientType) => {
        return (
          <Link
            href={`/patients/${row.patient.id}/cases`}
            className="block duration-200 hover:text-gray-900 hover:underline"
          >
            <AvatarCard
              src={row.patient?.avatar || ''}
              name={row.patient?.name || 'Unknown'}
              description={
                row.patient?.phone
                  ? row.patient.phone
                  : 'Téléphone Non Spécifié'
              }
            />
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
            render: (_: string, row: PatientType) => (
              <Link
                href={`/doctors/${row.doctor.id}`}
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
      title: (
        <HeaderCell
          title="Date de création"
          sortable
          ascending={
            sortConfig?.direction === 'asc' &&
            sortConfig?.key === 'patient.creationDate'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('patient.creationDate'),
      dataIndex: 'Date de naissance',
      key: 'patient.creationDate',
      width: 200,
      render: (value: string, row: PatientType) => (
        <DateCell date={new Date(row.patient?.creationDate || Date.now())} />
      ),
    },
    {
      title: <HeaderCell title="Alertes" className="opacity-0" />, // Title can be transparent or small icon
      dataIndex: 'alert_action',
      key: 'alert_action',
      width: 60, // Keep width small for just an icon
      render: (_: string, row: PatientType) => {
        console.log('Row data:', row); // Debugging line to check row data
        console.log('routes.alerts_doctor.alerts(row.patient.id)', routes.alerts_doctor.alerts(row.patient.id)); // Debugging line to check the route
        return(
        // Ensure row.patient.id exists before rendering the link
        row.patient?.id ? (
          <Link href={`/alerts/${routes.alerts_doctor.alerts(row.patient.id)}`}>
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="View Alerts"
              className="hover:!border-gray-900 hover:text-gray-700" // Example styling
            >
              <PiWarningCircleBold className="h-4 w-4" /> {/* Your chosen icon */}
            </ActionIcon>
          </Link>
        ) : null // Don't render if patient ID is not available
      )},
    },
  ];

  return columns;
};
