'use client';

import React, { useState } from 'react';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button, Title } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
import dynamic from 'next/dynamic';

const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  amount: ['', ''],
  created_at: [null, null],
  dueDate: [null, null],
  status: '',
};

export default function DoctorInvoicesTable({
  data = [],
  isLoading = false,
  caseData,
}: {
  data: any[];
  isLoading: boolean;
  caseData?: any;
}) {
  const [pageSize, setPageSize] = useState(10);
  console.log(data);

  const {
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
  } = useTable(data, pageSize, filterState);

  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        handleSort,
        handleRowSelect,
        handleSelectAll,
        handleDelete,
        caseData,
      }),
    [
      selectedRowKeys,
      sortConfig.key,
      sortConfig.direction,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <div>
      <Title as="h3" className="mb-4 text-lg font-semibold text-gray-700">
        Liste des factures
      </Title>
      <ControlledTable
        tableLayout="auto"
        variant="modern"
        data={tableData}
        isLoading={isLoading}
        showLoadingText={true}
        columns={visibleColumns}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        tableFooter={
          <TableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              setSelectedRowKeys([]);
              handleDelete(ids);
            }}
          >
            <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
              Télécharger {selectedRowKeys.length}{' '}
              {selectedRowKeys.length > 1 ? 'Factures' : 'Facture'}{' '}
            </Button>
          </TableFooter>
        }
        className="rounded-md border border-muted text-sm shadow-sm"
      />
    </div>
  );
}
