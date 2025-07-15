'use client';

import CommercialModal from '@/app/shared/custom-realsmile-components/liste/commercials-list/commercial-modal';
import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import React, { useState } from 'react';
import { Button } from 'rizzui';

type TableLayoutProps = {
  header: string;
} & PageHeaderTypes;

export default function CommercialTableLayout({
  header,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleCreate = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    console.log('Creating commercial:', data);
    // Perform the create action here (e.g., send data to the API)
  };

  const handleEdit = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    console.log('Editing commercial:', data);
    // Perform the edit action here (e.g., send updated data to the API)
  };

  const openCreateModal = () => {
    setEditData(null); // No initial data for create
    setIsModalOpen(true);
  };

  const openEditModal = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <div className="flex basis-auto justify-end">
            <Button onClick={openCreateModal}>Ajouter un commercial</Button>
          </div>
        </div>
      </PageHeader>

      {children}

      <CommercialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editData ? handleEdit : handleCreate}
        initialData={editData || undefined}
        mode={editData ? 'edit' : 'create'}
      />
    </>
  );
}
