'use client';

import React, { useCallback, useState } from 'react';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/custom-realsmile-components/liste/ai-cases-list/columns';
import { useAuth } from '@/context/AuthContext';

const TableFooter = React.lazy(() => import('@/app/shared/table-footer'));

export default function AICasesTable({
  data = [],
  isLoading = false,
  setCasesData,
  caseData,
}: {
  data: any[];
  isLoading: boolean;
  setCasesData?: any;
  caseData?: any;
}) {
  const [pageSize, setPageSize] = useState(10);
  const {user} = useAuth()

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
  }, []);

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
  } = useTable(data, pageSize);

  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: handleDelete,
        onChecked: handleRowSelect,
        handleSelectAll,
        setCasesData,
        caseData,
        token: user,
      }),
    [
      data,
      sortConfig,
      selectedRowKeys,
      handleRowSelect,
      handleDelete,
      handleSelectAll,
      user,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
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
            {selectedRowKeys.length > 1 ? 'Cases' : 'Case'}
          </Button>
        </TableFooter>
      }
      className="rounded-md border border-muted text-sm shadow-sm"
    />
  );
}
