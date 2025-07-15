import { useState, useEffect, useMemo } from 'react';
import isString from 'lodash/isString';

interface AnyObject {
  [key: string]: any;
}

export function useTable<T extends AnyObject>(
  initialData: T[],
  countPerPage: number = 10,
  initialFilterState?: Partial<Record<string, any>>
) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Handle row selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const handleRowSelect = (recordKey: string) => {
    const selectedKeys = [...selectedRowKeys];
    if (selectedKeys.includes(recordKey)) {
      setSelectedRowKeys(selectedKeys.filter((key) => key !== recordKey));
    } else {
      setSelectedRowKeys([...selectedKeys, recordKey]);
    }
  };
  const handleSelectAll = () => {
    if (selectedRowKeys.length === data.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(data.map((record) => record.id));
    }
  };

  // Handle sorting
  const [sortConfig, setSortConfig] = useState<AnyObject>({
    key: null,
    direction: null,
  });

  function sortData(data: T[], sortKey: string, sortDirection: string) {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const sortedData = useMemo(() => {
    let newData = data;
    if (!sortConfig.key) {
      return newData;
    }
    return sortData(newData, sortConfig.key, sortConfig.direction);
  }, [sortConfig, data]);

  function handleSort(key: string) {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  // Handle pagination
  const [currentPage, setCurrentPage] = useState(1);
  function paginatedData(data: T[] = sortedData) {
    const start = (currentPage - 1) * countPerPage;
    const end = start + countPerPage;

    if (data.length > start) return data.slice(start, end);
    return data;
  }

  function handlePaginate(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

  // Handle delete
  function handleDelete(id: string) {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  }

  // Handle Filters and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(
    initialFilterState ?? {}
  );

  function updateFilter(columnId: string, filterValue: string | any[]) {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnId]: filterValue,
    }));
  }

  function applyFilters() {
    const searchTermLower = searchTerm.toLowerCase();

    const filteredData = sortedData.filter((item) => {
      // Apply column filters first
      const isMatchingItem = Object.entries(filters).every(
        ([columnId, filterValue]) => {
          if (Array.isArray(filterValue)) {
            // If filterValue is an array (e.g., for price or date range), check if it's filled with valid values
            const [min, max] = filterValue;
            if ((min === '' || min === null) && (max === '' || max === null)) {
              return true; // No filtering for this column
            }
            if (columnId === 'amount') {
              const itemAmount = Math.ceil(Number(item[columnId]));
              return itemAmount >= Number(min) && itemAmount <= Number(max);
            }
            if (columnId === 'created_at') {
              const itemDate = new Date(item[columnId]);
              return itemDate >= new Date(min) && itemDate <= new Date(max);
            }
          } else if (isString(filterValue) && filterValue !== '') {
            // If the filter is a string (e.g., case_type, status), apply it only if it's not empty
            if (columnId === 'case_type') {
              return item.type === filterValue; // Exact match for case_type
            }
            if (columnId === 'status') {
              return item.status.toLowerCase() === filterValue.toLowerCase();
            }
            const itemValue = item[columnId]?.toString().toLowerCase();
            return itemValue === filterValue.toString().toLowerCase();
          }
          return true; // No filtering for empty/null values
        }
      );

      // Apply global search after column filters
      const isMatchingSearchTerm = Object.values(item).some((value) =>
        typeof value === 'object'
          ? value &&
            Object.values(value).some(
              (nestedItem) =>
                nestedItem &&
                String(nestedItem).toLowerCase().includes(searchTermLower)
            )
          : value && String(value).toLowerCase().includes(searchTermLower)
      );

      return isMatchingItem && (searchTerm === '' || isMatchingSearchTerm); // Item must match both filters and search term
    });
    return filteredData;
  }

  function handleSearch(searchValue: string) {
    setSearchTerm(searchValue);
  }

  function handleReset() {
    setFilters(initialFilterState ?? {});
    setSearchTerm('');
    setData(initialData);
  }

  const filteredAndSearchedData = useMemo(() => {
    return applyFilters();
  }, [filters, searchTerm, sortedData]);

  const tableData = paginatedData(filteredAndSearchedData);

  return {
    tableData,
    currentPage,
    handlePaginate,
    totalItems: filteredAndSearchedData.length,
    handleSort,
    sortConfig,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    filters,
    updateFilter,
    handleSearch,
    handleReset,
  };
}
