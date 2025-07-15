'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import PriceField from '@/components/controlled-table/price-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from 'rizzui';
import { getDateRangeStateValues } from '@/utils/get-formatted-date';
import { useMedia } from '@/hooks/use-media';
import CaseTypeField from '@/components/controlled-table/case-type-field';
import RefusalFilterField from '@/components/controlled-table/refusal-filter-field';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const caseTypeOptions = [
    { label: 'Normale', value: 'Normale' },
    { label: 'Commandé', value: 'Commandé' },
    { label: 'Rénumérisé', value: 'Rénumérisé' },
  ];
  return (
    <>
      {/*<PriceField*/}
      {/*  value={filters['amount']}*/}
      {/*  onChange={(data) => updateFilter('amount', data)}*/}
      {/*/>*/}
      <DateFiled
        className="w-full"
        selected={getDateRangeStateValues(filters['created_at'][0])}
        startDate={getDateRangeStateValues(filters['created_at'][0])}
        endDate={getDateRangeStateValues(filters['created_at'][1])}
        onChange={(date: any) => {
          updateFilter('created_at', date);
        }}
        placeholderText="Select created date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Created Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <CaseTypeField
        options={caseTypeOptions}
        value={filters['case_type']}
        onChange={(value: string) => {
          updateFilter('case_type', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { label: string }) => option.label}
        displayValue={(selected: string) => selected || 'Normale'}
        dropdownClassName="!z-10"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'Type de cas',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <RefusalFilterField
        value={filters['is_refused']}
        onChange={(value: string) => {
          updateFilter('is_refused', value);
        }}
        label="Cas refusé"
        className="w-auto"
        {...(isMediumScreen && {
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      {/*<DateFiled*/}
      {/*  className="w-full"*/}
      {/*  selected={getDateRangeStateValues(filters['dueDate'][0])}*/}
      {/*  startDate={getDateRangeStateValues(filters['dueDate'][0])}*/}
      {/*  endDate={getDateRangeStateValues(filters['dueDate'][1])}*/}
      {/*  onChange={(date: any) => {*/}
      {/*    updateFilter('dueDate', date);*/}
      {/*  }}*/}
      {/*  placeholderText="Select due date"*/}
      {/*  {...(isMediumScreen && {*/}
      {/*    inputProps: {*/}
      {/*      label: 'Due Date',*/}
      {/*      labelClassName: 'font-medium text-gray-700',*/}
      {/*    },*/}
      {/*  })}*/}
      {/*/>*/}

      {isFiltered ? (
        <Button
          size="sm"
          onClick={() => {
            handleReset();
          }}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Supprimer les
          filtres
        </Button>
      ) : null}
    </>
  );
}
