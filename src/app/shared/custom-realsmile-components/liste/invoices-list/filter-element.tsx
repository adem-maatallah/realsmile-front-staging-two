'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from 'rizzui';
import { getDateRangeStateValues } from '@/utils/get-formatted-date';
import { useMedia } from '@/hooks/use-media';

import {
  renderOptionDisplayValue,
  statusOptions,
} from '@/app/shared/custom-realsmile-components/liste/invoices-list/invoices-status-utils';

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
  return (
    <>
      <DateFiled
        className="w-full"
        selected={getDateRangeStateValues(filters['created_at'][0])}
        startDate={getDateRangeStateValues(filters['created_at'][0])}
        endDate={getDateRangeStateValues(filters['created_at'][1])}
        onChange={(date: any) => {
          if (
            filters['created_at'][0] !== date[0] ||
            filters['created_at'][1] !== date[1]
          ) {
            updateFilter('created_at', date);
          }
        }}
        placeholderText="Date De Création"
        {...(isMediumScreen && {
          inputProps: {
            label: 'DATE DE CRÉATION',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <StatusField
        options={statusOptions}
        value={filters['payment_status']}
        onChange={(value: string) => {
          updateFilter('payment_status', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) => renderOptionDisplayValue(selected)}
        dropdownClassName="!z-10"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'Status',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
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
