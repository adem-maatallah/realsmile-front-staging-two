// Import necessary modules
'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/ecommerce/product/product-list/columns';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

// Fetcher function for SWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

const FilterElement = dynamic(
  () => import('@/app/shared/ecommerce/product/product-list/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  priceTnd: ['', ''],
  createdAt: [null, null],
  status: '',
};

export default function ProductsTable() {
  const [pageSize, setPageSize] = useState(10);

  // Fetch products using SWR
  const { data: products = [], error } = useSWR(
    `/products`,
    fetcher
  );

  if (error) return <div>Failed to load products</div>;
  if (!products) return <div>Loading...</div>;

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback(async (slug: string) => {
    try {
      const response = await axiosInstance.delete(
        `/products/${slug}`
      );

      if (!response) {
        throw new Error('Failed to delete product');
      }

      // After deleting, you can refresh the SWR cache to fetch the latest product data
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/products`);

      toast.success('Product successfully deleted');
    } catch (error) {
      toast.error('Error deleting product');
    }
  }, []);

  const {
    isLoading,
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
  } = useTable(products, pageSize, filterState);

  const columns = useMemo(
    () =>
      getColumns({
        data: products,
        sortConfig,
        checkedItems: selectedRowKeys,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
      }),
    [
      selectedRowKeys,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <ControlledTable
      tableLayout="auto"
      variant="modern"
      isLoading={isLoading}
      showLoadingText={true}
      data={tableData}
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize,
        total: totalItems,
        current: currentPage,
        onChange: handlePaginate,
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => handleSearch(''),
        onSearchChange: (event) => handleSearch(event.target.value),
        hasSearched: isFiltered,
        columns,
        checkedColumns,
        setCheckedColumns,
        enableDrawerFilter: true,
      }}
      filterElement={
        <FilterElement
          filters={filters}
          isFiltered={isFiltered}
          updateFilter={updateFilter}
          handleReset={handleReset}
        />
      }
      tableFooter={
        <TableFooter
          checkedItems={selectedRowKeys}
          handleDelete={(slugs: string[]) => {
            setSelectedRowKeys([]);
            handleDelete(slugs);
          }}
        >
          <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
            Download {selectedRowKeys.length}{' '}
            {selectedRowKeys.length > 1 ? 'Products' : 'Product'}
          </Button>
        </TableFooter>
      }
      className="rounded-md border border-muted text-sm shadow-sm"
    />
  );
}
