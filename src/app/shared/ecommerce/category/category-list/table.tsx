'use client';
import dynamic from 'next/dynamic';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import { useTable } from '@/hooks/use-table';
import { getColumns } from '@/app/shared/ecommerce/category/category-list/columns';
import { useModal } from '@/app/shared/modal-views/use-modal'; // For handling modals
import { CreateCategoryModalView } from '@/app/(hydrogen)/categories/category-page-header';
import axios from 'axios';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance'; // Custom axios instance for API calls
// Fetch function using fetch API
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

const TableFooter = dynamic(
  () => import('@/app/shared/ecommerce/category/category-list/table-footer'),
  { ssr: false }
);

export default function CategoryTable() {
  const [pageSize, setPageSize] = useState(10);

  // Fetch categories data using useSWR
  const {
    data: categories,
    error,
    mutate,
    isLoading,
  } = useSWR(`/categories`, fetcher);

  const { openModal } = useModal(); // Modal handler

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
  }, []);

  const onEditItem = (category: any) => {
    openModal({
      view: (
        <CreateCategoryModalView
          id={category.id}
          category={category} // Pass category data for editing
        />
      ),
      customSize: '720px',
    });
  };

  const handleDeleteItem = async (id: string) => {
    try {
      // Send the DELETE request
      await axiosInstance.delete(`/categories/${id}`);

      // Revalidate the data
      mutate();

      // Show success message
      toast.success('Category deleted successfully!');
    } catch (error) {
      // Show error message
      toast.error('Failed to delete category.');
    }
  };

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const onChecked = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    if (event.target.checked) {
      setCheckedItems((prevItems) => [...prevItems, id]);
    } else {
      setCheckedItems((prevItems) => prevItems.filter((item) => item !== id));
    }
  };

  const {
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    handleDelete,
  } = useTable(categories || [], pageSize);

  const columns = useMemo(
    () =>
      getColumns({
        sortConfig,
        onHeaderCellClick,
        onDeleteItem: handleDeleteItem,
        onChecked,
        onEditItem, // Pass onEditItem to the columns for triggering edit modal
      }),
    [
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      onChecked,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  if (error) return <div>Failed to load categories</div>;
  if (isLoading) return <div>Loading categories...</div>;

  return (
    <ControlledTable
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
      tableFooter={
        <TableFooter
          checkedItems={checkedItems}
          handleDelete={(ids: string[]) => {
            handleDelete(ids);
            setCheckedItems([]);
          }}
        />
      }
      className="rounded-md border border-muted text-sm shadow-sm"
    />
  );
}
