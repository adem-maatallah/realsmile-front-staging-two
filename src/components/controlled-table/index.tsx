import React from 'react';
import dynamic from 'next/dynamic';
import isEmpty from 'lodash/isEmpty';
import Table, { type TableProps } from '@/components/ui/table';
import cn from '@/utils/class-names';
import type { TableFilterProps } from '@/components/controlled-table/table-filter';
import type { TablePaginationProps } from '@/components/controlled-table/table-pagination';

const TableFilter = dynamic(
  () => import('@/components/controlled-table/table-filter'),
  { ssr: false }
);
const TablePagination = dynamic(
  () => import('@/components/controlled-table/table-pagination'),
  { ssr: false }
);

type ControlledTableProps = {
  isLoading?: boolean;
  showLoadingText?: boolean;
  filterElement?: React.ReactElement;
  filterOptions?: TableFilterProps;
  paginatorOptions?: TablePaginationProps;
  tableFooter?: React.ReactNode;
  className?: string;
  paginatorClassName?: string;
} & TableProps;

export default function ControlledTable({
  isLoading,
  filterElement,
  filterOptions,
  paginatorOptions,
  tableFooter,
  showLoadingText,
  paginatorClassName,
  className,
  ...tableProps
}: ControlledTableProps) {
  return (
    <>
      {!isEmpty(filterOptions) && (
        <TableFilter {...filterOptions}>{filterElement}</TableFilter>
      )}

      <div className="relative">
        <Table
          scroll={{ x: '100%' }}
          rowKey={(record) => record.id}
          className={cn('min-w-full', className)}
          isLoading={isLoading}
          columns={tableProps.columns}
          {...tableProps}
        />

        {tableFooter ? tableFooter : null}
      </div>

      {!isEmpty(paginatorOptions) && (
        <TablePagination
          paginatorClassName={paginatorClassName}
          {...paginatorOptions}
        />
      )}
    </>
  );
}
