import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateField from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button, SelectOption, Text } from 'rizzui';
import { useMedia } from '@/hooks/use-media';
import {
  renderStatusOptionDisplayValue,
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
      {/* Date Filter */}
      <DateField
        className="w-full"
        selected={filters['date'][0]}
        startDate={filters['date'][0]}
        endDate={filters['date'][1]}
        onChange={(date: any) => {
          updateFilter('date', date);
        }}
        placeholderText="Sélectionnez la date de la transaction"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Date de la transaction',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />

      {/* Status Filter */}
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
          label: 'Statut',
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
