'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useColumn } from '@/hooks/use-column';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { useAuth } from '@/context/AuthContext';
import { useTable } from '@/hooks/custom_realsmile_hooks/use-table';
import { getTransactionColumns } from './columns';

const FilterElement = dynamic(() => import('./filter-element'), { ssr: false });
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  amount: ['', ''],
  date: [null, null],
  method: '',
  status: '',
};

export default function TransactionsTable({
  data = [],
  isLoading = false,
}: {
  data: any[];
  isLoading: boolean;
}) {
  const [pageSize, setPageSize] = useState(10);

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const {user} = useAuth()

  const {
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleReset,
  } = useTable(data, pageSize, filterState);

  const isntDoctor = user?.role != 'doctor'; // Assuming you have a role property in the session

  const columns = React.useMemo(
    () =>
      getTransactionColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onChecked: handleRowSelect,
        handleSelectAll,
        isntDoctor,
      }),
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      handleRowSelect,
      handleSelectAll,
      isntDoctor,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <div className="table-container overflow-x-auto">
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
        filterOptions={{
          searchTerm,
          onSearchClear: () => {
            handleSearch('');
          },
          onSearchChange: (event) => {
            handleSearch(event.target.value);
          },
          hasSearched: isFiltered,
          columns,
          checkedColumns,
          setCheckedColumns,
        }}
        filterElement={
          <FilterElement
            isFiltered={isFiltered}
            filters={filters}
            updateFilter={updateFilter}
            handleReset={handleReset}
          />
        }
        tableFooter={
          <TableFooter checkedItems={selectedRowKeys}>
            <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
              Exporter {selectedRowKeys.length}{' '}
              {selectedRowKeys.length > 1 ? 'Transactions' : 'Transaction'}
            </Button>
          </TableFooter>
        }
        className="min-w-full rounded-md border border-muted text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </div>
  );
}
