'use client';

import { useAuth } from '@/context/AuthContext';
import {
  Text,
  Badge,
  Checkbox,
  Popover,
  Button,
  Title,
  Input,
  Password,
  Modal,
} from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { InvoiceType } from '@/app/shared/custom-realsmile-components/liste/invoices-list/invoices-data';
import Link from 'next/link';
import { routes } from '@/config/routes';
import React, { useState } from 'react';
import { PiTrashBold } from 'react-icons/pi';
import axios from 'axios';
import toast from 'react-hot-toast';

function ModifierModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string, amount: number, date: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = () => {
    if (!password || !amount || !date) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    onSubmit(password, parseFloat(amount), date);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-lg bg-white shadow-xl"
    >
      <div className="space-y-6 p-6">
        <div className="text-center">
          <Title as="h5" className="font-bold text-gray-800">
            Modifier la Facture
          </Title>
          <Text as="p" className="text-gray-600">
            Veuillez saisir les informations nécessaires pour modifier la
            facture.
          </Text>
        </div>
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <Password
              id="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-gray-700"
            >
              Montant
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Entrez le montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            size="md"
            className="rounded-md border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            variant="solid"
            size="md"
            className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            onClick={handleSubmit}
          >
            Modifier
          </Button>
        </div>
      </div>
    </Modal>
  );
}

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
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isModifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );

  const handleDeleteConfirm = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/devis/invoices/${id}`;

    try {
      await axios.delete(url, {
        withCredentials: true,
      });

      // Refresh or update the state after deletion
      onDeleteItem(id);
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice: ', error);
      toast.error('Error deleting invoice');
    }
  };

  const handleModifierSubmit = async (
    password: string,
    amount: number,
    date: string
  ) => {
    if (!selectedInvoiceId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/devis/invoices/${selectedInvoiceId}`;

    try {
      await axios.put(
        url,
        { password, amount, date },
        {
          withCredentials: true,
        }
      );
      toast.success('Facture modifiée avec succès');
      setModifierModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la modification de la facture:', error);
      toast.error('Erreur lors de la modification de la facture');
    }
  };

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
      title: <HeaderCell title="Réference de facture" />,
      dataIndex: 'invoice_ref',
      width: 180,
      render: (_: string, row: InvoiceType) => (
        <Link
          href={routes.invoices.details(row.id)}
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          <Text className="font-bold hover:underline">{row.invoice_ref}</Text>
        </Link>
      ),
    },
    {
      title: <HeaderCell title="Nom du patient" />,
      dataIndex: 'Nom du patient',
      width: 180,
      render: (_: string, row: InvoiceType) => (
        <Link
          href={
            user.role !== 'finance'
              ? routes.cases.details(row.patient_name)
              : '#'
          }
          className="duration-200 hover:text-gray-900 hover:underline"
        >
          <Text className="font-bold hover:underline">{row.patient_name}</Text>
        </Link>
      ),
    },

    ...(user.role === 'admin' || user.role === 'finance'
      ? [
          {
            title: <HeaderCell title="Docteur" />,
            dataIndex: 'docteur',
            key: 'doctor',
            width: 250,
            render: (_: string, row: InvoiceType) => (
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
      render: (value: string, row: InvoiceType) => (
        <DateCell date={new Date(row.created_at)} />
      ),
    },

    {
      title: (
        <HeaderCell
          title="Montant"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'amount'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 200,
      render: (_: any, value: InvoiceType) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value.amount}
        </Text>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Reste a payer"
          sortable
          ascending={
            sortConfig?.direction === 'asc' &&
            sortConfig?.key === 'reste_a_payer'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('reste_a_payer'),
      dataIndex: 'reste_a_payer',
      key: 'reste_a_payer',
      width: 200,
      render: (_: any, value: InvoiceType) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value.reste_a_payer}
        </Text>
      ),
    },

    {
      title: <HeaderCell title="Statut" />,
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 60,
      align: 'center',
      render: (value: string, row: InvoiceType) =>
        getStatusBadge(row.payment_status),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pr-3">
          {user.role === 'admin' && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedInvoiceId(row.id);
                  setModifierModalOpen(true);
                }}
              >
                Modifier
              </Button>
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
          <ModifierModal
            isOpen={isModifierModalOpen}
            onClose={() => setModifierModalOpen(false)}
            onSubmit={handleModifierSubmit}
          />
        </div>
      ),
    },
  ];

  return columns;
};
