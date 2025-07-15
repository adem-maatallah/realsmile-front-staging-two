import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import CountryField from '@/components/controlled-table/country-field';
import { Button, SelectOption, Text } from 'rizzui';
import { useMedia } from '@/hooks/use-media';
import {
  renderStatusOptionDisplayValue,
  statusOptions,
  renderCountryOptionDisplayValue,
} from '@/app/shared/custom-realsmile-components/liste/users-list/user-status-utils';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';

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
        selected={filters['creationDate'][0]}
        startDate={filters['creationDate'][0]}
        endDate={filters['creationDate'][1]}
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

      <CountryField
        options={COUNTRIES}
        value={filters['country']}
        onChange={(value: string) => {
          updateFilter('country', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderCountryOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) =>
          renderCountryOptionDisplayValue(selected)
        }
        dropdownClassName="!z-10"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'Country',
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
