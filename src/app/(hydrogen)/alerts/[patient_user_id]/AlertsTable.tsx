'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
// import { useSession } from 'next-auth/react';

const FilterElement = dynamic(
  () =>
    import(
      '@/app/shared/custom-realsmile-components/liste/cases-list/filter-element'
    ),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  amount: ['', ''],
  creationDate: [null, null],
  dueDate: [null, null],
  status: '',
};

export default function CasesTable({
  data = [],
  isLoading = false,
}: {
  data: any[];
  isLoading: boolean;
}) {
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    console.log('CasesTable received data:', data);
  }, [data]);

  //  

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
    handleDelete,
    handleReset,
  } = useTable(data, pageSize, filterState);

  // Wrap the onHeaderCellClick function inside a useCallback
  const onHeaderCellClick = useCallback(
    (value: string) => ({
      onClick: () => handleSort(value),
    }),
    [handleSort]
  );

  const columns = useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: handleDelete,
        onChecked: handleRowSelect,
        handleSelectAll,
      }),
    [data, selectedRowKeys, sortConfig, handleDelete, handleRowSelect, handleSelectAll, onHeaderCellClick]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ControlledTable
          tableLayout="auto"
          variant="modern"
          data={tableData}
          isLoading={isLoading}
          showLoadingText={true}
          // @ts-ignore
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
            onSearchClear: () => handleSearch(''),
            onSearchChange: (event) => handleSearch(event.target.value),
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
            <TableFooter
              checkedItems={selectedRowKeys}
              handleDelete={(ids: string[]) => {
                setSelectedRowKeys([]);
                handleDelete(ids);
              }}
            >
              <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
                Télécharger {selectedRowKeys.length}{' '}
                {selectedRowKeys.length > 1 ? 'Cases' : 'Case'}{' '}
              </Button>
            </TableFooter>
          }
          className="rounded-md border border-muted text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
        />
      )}
    </>
  );
}
