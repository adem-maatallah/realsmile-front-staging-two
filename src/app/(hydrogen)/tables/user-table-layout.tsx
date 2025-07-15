'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import ImportButton from '@/app/shared/import-button';
import ExportButton from '@/app/shared/export-button';
import ModalButton from '@/app/shared/modal-button';
import CreateUser from '@/app/shared/roles-permissions/create-user';
import React from 'react';

type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
} & PageHeaderTypes;

export default function UserTableLayout({
  data,
  header,
  fileName,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {/*<ExportButton data={data} fileName={fileName} header={header} />*/}
          {/*<div className="flex basis-auto justify-end">*/}
          {/*  <ModalButton*/}
          {/*    label="Ajouter un utilisateur"*/}
          {/*    view={<CreateUser />}*/}
          {/*    customSize="600px"*/}
          {/*    className="mt-0"*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      </PageHeader>

      {children}
    </>
  );
}
