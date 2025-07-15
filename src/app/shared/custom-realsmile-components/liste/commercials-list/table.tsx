'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from 'rizzui';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns'; // Adjust path if necessary
import { useTable } from '@/hooks/custom_realsmile_hooks/use-table';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useColumn } from '@/hooks/use-column';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from './delete-commercial-modal';
import AssignDoctorModal from './assign-doctor-modal';
import CommercialModal from './commercial-modal'; // Reusable modal component

const FilterElement = dynamic(
  () => import('./filter-element'), // Adjust path if necessary
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  creationDate: [null, null],
  status: '',
  country: 'all',
};

export default function CommercialsTable() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const {user} = useAuth()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
  const [selectedCommercial, setSelectedCommercial] = useState(null);

  const fetchCommercials = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/commercials`,
        {
          withCredentials: true
        }
      );
      setData(response.data.commercials || []);
    } catch (error) {
      console.error('Error fetching commercials:', error);
      toast.error('Failed to fetch commercials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/commercials`,
        formData,
        {
          withCredentials: true
        }
      );
      toast.success('Commercial created successfully');
      fetchCommercials(); // Refresh data
    } catch (error) {
      console.error('Error creating commercial:', error);
      toast.error('Failed to create commercial');
    }
  };

  const handleEdit = async (formData) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/commercials/${selectedCommercial?.id}`,
        formData,
        {
          withCredentials: true
        }
      );
      toast.success('Commercial updated successfully');
      fetchCommercials(); // Refresh data
    } catch (error) {
      console.error('Error editing commercial:', error);
      toast.error('Failed to update commercial');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/commercials/${selectedCommercial?.id}`,
        {
          withCredentials: true
        }
      );
      toast.success('Commercial deleted successfully');
      fetchCommercials(); // Refresh data
    } catch (error) {
      console.error('Error deleting commercial:', error);
      toast.error('Failed to delete commercial');
    }
  };

  const handleAssignDoctors = async (doctorIds) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/commercials/${selectedCommercial?.id}/assign-doctors`,
        { doctorIds },
        {
          withCredentials: true
        }
      );
      toast.success('Doctors assigned successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error assigning doctors:', error);
      toast.error('Failed to assign doctors');
    }
  };

  useEffect(() => {
    fetchCommercials();
  }, [session]);

  const {
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm = '',
    handleSearch = () => {},
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleReset,
  } = useTable(data, pageSize, filterState);

  const columns = React.useMemo(
    () =>
      getColumns({
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick: (value) => ({
          onClick: () => handleSort(value),
        }),
        onChecked: handleRowSelect,
        handleSelectAll,
        data: data || [],
        onEditClick: (commercial) => {
          setSelectedCommercial(commercial);
          setModalMode('edit');
          setIsEditModalOpen(true);
        },
        onDeleteClick: (commercial) => {
          setSelectedCommercial(commercial);
          setIsDeleteModalOpen(true);
        },
        onAssignClick: (commercial) => {
          setSelectedCommercial(commercial);
          setIsAssignModalOpen(true);
        },
      }),
    [
      selectedRowKeys,
      sortConfig?.key,
      sortConfig?.direction,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <div className="table-container overflow-x-auto">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ControlledTable
            tableLayout="auto"
            variant="modern"
            data={tableData || []}
            isLoading={isLoading}
            columns={visibleColumns || []}
            paginatorOptions={{
              pageSize,
              setPageSize,
              total: totalItems,
              current: currentPage,
              onChange: (page) => handlePaginate(page),
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
            tableFooter={
              <TableFooter
                checkedItems={selectedRowKeys}
                handleDelete={(ids) => {
                  setSelectedRowKeys([]);
                  handleDelete(ids);
                }}
              >
                <Button size="sm">
                  Télécharger {selectedRowKeys.length} Commercial(s)
                </Button>
              </TableFooter>
            }
          />
          <CommercialModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
            initialData={modalMode === 'edit' ? selectedCommercial : undefined}
            mode={modalMode}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            commercialId={selectedCommercial?.id || null}
          />
          <AssignDoctorModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            assignedDoctors={selectedCommercial?.assigned_doctors || []}
            commercialId={selectedCommercial?.id || null}
            onSave={handleAssignDoctors}
          />
        </>
      )}
    </div>
  );
}
