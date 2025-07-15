// ActivityTable Component
import React, { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { useAuth } from '@/context/AuthContext';
import { getActivityColumns } from './columns'; // Ensure this is the correct path

const FilterElement = dynamic(
  () =>
    import(
      '@/app/shared/custom-realsmile-components/liste/activity-list/filter-element'
    ),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  created_at: [null, null],
  unseen: '',
  userId: '',
};

export default function ActivityTable({
  data = [],
  isLoading = false,
  setActivityData,
  activityData,
}: {
  data: any[];
  isLoading: boolean;
  setActivityData?: any;
  activityData?: any;
}) {
  const [pageSize, setPageSize] = useState(10);
  const {user} = useAuth()
  const [ownerOptions, setOwnerOptions] = useState([]);

  useEffect(() => {
    // Extract unique owners from the notifications data
    const owners = Array.from(new Set(data.map((item) => item.userId))).map(
      (userId) => {
        const user = data.find((item) => item.userId === userId);
        return {
          value: userId,
          label: user.userName,
        };
      }
    );
    setOwnerOptions(owners);
  }, [data]);

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const columns = React.useMemo(
    () =>
      getActivityColumns({
        data: tableData, // Use filtered data
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: handleDelete,
        onChecked: handleRowSelect,
        handleSelectAll,
        setActivityData,
        activityData,
        token: user,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
      tableData,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <>
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
            ownerOptions={ownerOptions} // Pass owner options to the filter element
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
              {selectedRowKeys.length > 1 ? 'Patients' : 'Patient'}{' '}
            </Button>
          </TableFooter>
        }
        className="rounded-md border border-muted text-sm shadow-sm"
      />
    </>
  );
}
