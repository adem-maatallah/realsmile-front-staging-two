'use client';

import { Text, Tooltip, Badge, Button } from 'rizzui';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';
import { useState } from 'react';
import { AlertItemType } from './alerts-data';
import { CheckCircleIcon } from 'lucide-react';
import TrashIcon from '@/components/icons/trash';
import DateAgeCell from '@/components/ui/date-cell';
import { HeaderCell } from '@/components/ui/table';
import Popover from '@/components/ui/menu/popover/popover';

function getStatusBadge(status: boolean) {
  switch (status) {
    case false:
      return (
        <div className="flex items-center font-medium text-red-700 dark:text-red-600">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium text-red-dark">Non Résolu</Text>
        </div>
      );
    case true:
      return (
        <div className="ml-4 flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium text-green-dark">Résolu</Text>
        </div>
      );
    default:
      return (
        <div className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium text-gray-600">{status}</Text>
        </div>
      );
  }
}

type Columns = {
  onResolveAlert: (value: number) => void;
  onDeleteItem: (value: number) => void;
};

export const getAlertColumns = ({ onResolveAlert, onDeleteItem }: Columns) => {
  const VideoModal = ({ videoLink }: { videoLink: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <span
          className="text-primary hover:underline hover:cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          Voir Vidéo
        </span>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-[80vw] h-[80vh]">
              <Dialog.Title className="text-lg font-semibold">Vidéo Preview</Dialog.Title>
              <div className="mt-4 w-full h-[80%]">
                <iframe
                  src={`https://embed.api.video/vod/${videoLink}`}
                  title="Video Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                ></iframe>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setIsOpen(false)}>Fermer</Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </>
    );
  };

  return [
    {
      title: <HeaderCell title="Référence de l'alerte" />,
      dataIndex: 'Référence de l\'alerte',
      key: 'patient',
      render: (_: string, row: AlertItemType) => (
        <Link href="/" className="duration-200 hover:text-gray-900 hover:underline">
          {'#RSP-' + row.id}
        </Link>
      ),
    },
    {
      title: <HeaderCell title="Titre" />,
      dataIndex: 'title',
      key: 'title',
      render: (value: string) => (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {value}
        </span>
      ),
    },
    {
      title: <HeaderCell title="Description" />,
      dataIndex: 'description',
      key: 'description',
      render: (value: string) => (
        <Popover>
          <Popover.Trigger>
            <span className="block truncate max-w-[150px] hover:cursor-pointer hover:text-primary">
              {value}
            </span>
          </Popover.Trigger>
          <Popover.Content>
            <div className="max-w-[300px]">
              <Text>{value}</Text>
            </div>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      title: 'Lien du Vidéo',
      dataIndex: 'video_link',
      key: 'video_link',
      render: (value: string) => <VideoModal videoLink={value} />,
    },
    {
      title: <HeaderCell title="Date de création" />,
      dataIndex: 'Date de création',
      key: 'created_at',
      render: (value: string, row: AlertItemType) => <DateAgeCell date={new Date(row.created_at)} />,
    },
    {
      title: <HeaderCell title="Statut" />,
      dataIndex: 'resolved',
      key: 'resolved',
      render: (value: string, row: AlertItemType) => getStatusBadge(row.resolved),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      render: (_: any, row: AlertItemType) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          <Tooltip size="sm" content={'Résoudre l\'alerte'} placement="top" color="invert">
            <button
              type="button"
              onClick={() => onResolveAlert(row.id)}
              className="mt-0 w-7 h-7 p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-dark transition focus:outline-none focus-visible:ring-[1.8px] focus-visible:ring-muted focus-visible:ring-offset-2 ring-offset-background"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
          </Tooltip>
          {/* <Tooltip size="sm" content={'Supprimer l\'alerte'} placement="top" color="invert">
            <button type="button" onClick={() => onDeleteItem(row.id)} className="hover:text-gray-700">
              <TrashIcon className="h-4 w-4" />
            </button>
          </Tooltip> */}
        </div>
      ),
    },
  ];
};
