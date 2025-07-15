'use client';

import { useAuth } from '@/context/AuthContext';
import {
  Text,
  Badge,
  Checkbox,
  Tooltip,
  ActionIcon,
  Popover,
  Button,
  Title,
} from 'rizzui';
import Link from 'next/link';
import React, { useState } from 'react';
import { PiTrashBold } from 'react-icons/pi';
import axios from 'axios';
import toast from 'react-hot-toast';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';

function getStatusBadge(status: string) {
  const badgeStyle = {
    width: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (status) {
    case 'payé':
      return (
        <Badge
          color="success"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'non payé':
      return (
        <Badge
          color="danger"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    case 'partiellement payé':
      return (
        <Badge
          color="warning"
          variant="outline"
          style={badgeStyle}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    default:
      return (
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

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  handleSort: (value: string) => void;
  handleRowSelect?: (id: string) => void;
  handleSelectAll: any;
  caseData?: any;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  handleSort,
  handleRowSelect,
  handleSelectAll,
}: Columns) => {
  console.log(data);
  const {user} = useAuth()
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);

  const handleDeleteConfirm = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/devis/invoices/${id}`;

    try {
      await axios.delete(url, {
        withCredentials: true,
      });

      onDeleteItem(id);
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice: ', error);
      toast.error('Error deleting invoice');
    }
  };

  return [
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
            {...(handleRowSelect && {
              onChange: () => handleRowSelect(row.id),
            })}
          />
        </div>
      ),
    },
    {
      title: 'Réference de facture',
      dataIndex: 'invoice_ref',
      width: 180,
      render: (_: string, row: any) => (
        <Link
          href={`/invoices/${row.id}`}
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          <Text className="font-bold hover:underline">{row.invoice_ref}</Text>
        </Link>
      ),
    },
    {
      title: 'Nom du patient',
      dataIndex: 'patient_name',
      width: 180,
      render: (_: string, row: any) => (
        <Link
          href={`/cases/${row.patient_name}`}
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          <Text className="font-bold hover:underline">{row.patient_name}</Text>
        </Link>
      ),
    },
    user.role === 'admin' && {
      title: 'Docteur',
      dataIndex: 'doctor',
      width: 250,
      render: (_: string, row: any) => (
        <AvatarCard src={row.doctor?.profilePic} name={row.doctor?.fullName} />
      ),
    },
    {
      title: 'Date de création',
      dataIndex: 'created_at',
      width: 200,
      render: (value: string, row: any) =>
        row.created_at ? <DateCell date={new Date(row.created_at)} /> : 'N/A',
    },

    {
      title: 'Montant',
      dataIndex: 'amount',
      width: 200,
      render: (_: any, row: any) => (
        <Text className="font-medium text-gray-700">{row.amount}</Text>
      ),
    },
    {
      title: 'Reste a payer',
      dataIndex: 'reste_a_payer',
      width: 200,
      render: (_: any, row: any) => (
        <Text className="font-medium text-gray-700">{row.reste_a_payer}</Text>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'payment_status',
      width: 60,
      align: 'center',
      render: (value: string, row: any) => getStatusBadge(row.payment_status),
    },
    {
      title: '',
      dataIndex: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pr-3">
          {user.role === 'admin' && (
            <>
              <Popover>
                <Popover.Trigger>
                  <Button
                    className="hover:!border-gray-900 hover:text-gray-700"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'inherit',
                      border: '0.5px solid lightgray',
                      borderRadius: '5px',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                    }}
                    onClick={() => setDeleteInvoiceId(row.id)}
                  >
                    <PiTrashBold className="h-auto w-5" />
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  {({ setOpen }) => (
                    <div className="w-56">
                      <Title as="h6">Supprimer la facture</Title>
                      <Text>
                        Êtes-vous sûr de vouloir supprimer cette facture ?
                      </Text>
                      <div className="mb-1 flex justify-end gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpen(false)}
                        >
                          Non
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={async () => {
                            await handleDeleteConfirm(deleteInvoiceId);
                            setOpen(false);
                          }}
                        >
                          Oui
                        </Button>
                      </div>
                    </div>
                  )}
                </Popover.Content>
              </Popover>
            </>
          )}
        </div>
      ),
    },
  ].filter(Boolean); // Filter out falsy values (e.g., `null` when the role is not admin)
};
