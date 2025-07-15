'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import PriceField from '@/components/controlled-table/price-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from 'rizzui';
import { getDateRangeStateValues } from '@/utils/get-formatted-date';
import { useMedia } from '@/hooks/use-media';
import {
  inLatestatusOptions,
  renderIsLateOptionDisplayValue,
  renderOptionDisplayValue,
  statusOptions,
} from '@/app/shared/custom-realsmile-components/liste/labo-list/labo-status-utils';

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
      <StatusField
        options={statusOptions}
        value={filters['require_smile_set_upload']}
        onChange={(value: string) => {
          updateFilter('require_smile_set_upload', value);
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


<StatusField
        options={inLatestatusOptions}
        value={filters['isLate']}
        onChange={(value: string) => {
          updateFilter('isLate', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderIsLateOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) => renderIsLateOptionDisplayValue(selected)}
        dropdownClassName="!z-10"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'is Late',
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
                  <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Supprimer les filtres
              </Button>
          ) : null}
    </>
  );
}
