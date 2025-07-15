'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import PriceField from '@/components/controlled-table/price-field';
import StatusField from '@/components/controlled-table/status-field';
import { Badge, Text, Button } from 'rizzui';
import { getDateRangeStateValues } from '@/utils/get-formatted-date';
import { useMedia } from '@/hooks/use-media';

const statusOptions = [
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'refunded',
    label: 'Refunded',
  },
];

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

  // Safely access the price filter array and default to empty strings if undefined
  const priceFilter = filters['price'] || ['', ''];
  const createdAtFilter = filters['createdAt'] || [null, null];
  const updatedAtFilter = filters['updatedAt'] || [null, null];

  return (
    <>
      <PriceField
        value={priceFilter} // Use the safely accessed priceFilter
        onChange={(data) => updateFilter('price', data)}
        label={'Price'}
      />
      <DateFiled
        className="w-full"
        selected={getDateRangeStateValues(createdAtFilter[0])}
        startDate={getDateRangeStateValues(createdAtFilter[0])}
        endDate={getDateRangeStateValues(createdAtFilter[1])}
        onChange={(date: any) => {
          updateFilter('createdAt', date);
        }}
        placeholderText="Select created date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Created Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <DateFiled
        className="w-full"
        selected={getDateRangeStateValues(updatedAtFilter[0])}
        startDate={getDateRangeStateValues(updatedAtFilter[0])}
        endDate={getDateRangeStateValues(updatedAtFilter[1])}
        onChange={(date: any) => {
          updateFilter('updatedAt', date);
        }}
        placeholderText="Select modified date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Due Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <StatusField
        options={statusOptions}
        value={filters['status'] || ''}
        onChange={(value: string) => {
          updateFilter('status', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderOptionDisplayValue(option.value)
        }
        displayValue={(selected: string) => renderOptionDisplayValue(selected)}
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
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      ) : null}
    </>
  );
}

function renderOptionDisplayValue(value: string) {
  switch (value.toLowerCase()) {
    case 'draft':
      return (
        <div className="flex items-center">
          <Badge color="secondary" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-gray-600">
            Draft
          </Text>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-orange-dark">
            Pending
          </Text>
        </div>
      );
    case 'shipping':
      return (
        <div className="flex items-center">
          <Badge color="info" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-blue-600">
            Shipping
          </Text>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            Completed
          </Text>
        </div>
      );
    case 'cancelled':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
            Cancelled
          </Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium capitalize text-gray-600">
            {value}
          </Text>
        </div>
      );
  }
}
