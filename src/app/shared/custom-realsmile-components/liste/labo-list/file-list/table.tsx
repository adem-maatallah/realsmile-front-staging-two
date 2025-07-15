'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { Button } from 'rizzui';
import { useColumn } from '@/hooks/use-column';
import { getColumns } from '@/app/shared/custom-realsmile-components/liste/labo-list/file-list/columns';
import FileFilters from '@/app/shared/file/manager/file-filters';
import ControlledTable from '@/components/controlled-table';
import FileTableFooter from '@/app/shared/file-table-footer';

const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

export default function CaseFileListTable({
  className,
  data,
  isLoading,
}: {
  className?: string;
  data: any;
  isLoading: boolean;
}) {
  const [pageSize, setPageSize] = useState(10);

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = (id: string) => {
    handleDelete(id);
  };

  const handleDownload = () => {
    console.log('Starting downloads...');
    selectedRowKeys.forEach((id, index) => {
      const file = data.find((item: any) => item.id === id);
      if (file && file.file && file.file.url) {
        // Use a timeout to avoid triggering the browser's popup blocker
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = file.file.url;
          link.setAttribute('download', file.file.name || 'download'); // Ensure the download attribute is set
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link); // Clean up the link
          console.log('Download triggered for:', file.file.name);
        }, 500 * index); // Slight delay between each download
      }
    });
  };

  const {
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
  } = useTable(data, pageSize);

  const columns = useMemo(
    () =>
      getColumns({
        data: data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
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
    ]
  );

  const { visibleColumns } = useColumn(columns);

  return (
    <div className={className}>
      <FileFilters
        filters={filters}
        updateFilter={updateFilter}
        onSearch={handleSearch}
        searchTerm={searchTerm}
      />

      <ControlledTable
        isLoading={isLoading}
        showLoadingText={true}
        data={tableData}
        // @ts-ignore
        columns={visibleColumns}
        scroll={{ x: 1300 }}
        variant="modern"
        tableLayout="auto"
        rowKey={(record) => record.id}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        tableFooter={
          <FileTableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              setSelectedRowKeys([]);
              handleDelete(ids);
            }}
          >
            <Button
              size="sm"
              className="dark:bg-gray-300 dark:text-gray-800"
              onClick={handleDownload}
            >
              Download {selectedRowKeys.length}{' '}
              {selectedRowKeys.length > 1 ? 'Files' : 'File'}
            </Button>
          </FileTableFooter>
        }
      />
    </div>
  );
}
