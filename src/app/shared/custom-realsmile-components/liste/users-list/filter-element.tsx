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
  renderRoleOptionDisplayValue,
  renderStatusOptionDisplayValue,
  roleOptions,
  statusOptions,
} from '@/app/shared/custom-realsmile-components/liste/users-list/user-status-utils';

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
        selected={getDateRangeStateValues(filters['creationDate'][0])}
        startDate={getDateRangeStateValues(filters['creationDate'][0])}
        endDate={getDateRangeStateValues(filters['creationDate'][1])}
        onChange={(date: any) => {
          updateFilter('creationDate', date);
        }}
        placeholderText="Select created date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Created Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <StatusField
        options={roleOptions}
        value={filters['role']}
        onChange={(value: string) => {
          updateFilter('role', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderRoleOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) =>
          renderRoleOptionDisplayValue(selected)
        }
        dropdownClassName="!z-10"
        className={'w-auto'}
        placeholder="Selectionnez le role"
        {...(isMediumScreen && {
          label: 'Status',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <StatusField
        options={statusOptions}
        value={filters['status']}
        onChange={(value: string) => {
          updateFilter('status', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderStatusOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) =>
          renderStatusOptionDisplayValue(selected)
        }
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
