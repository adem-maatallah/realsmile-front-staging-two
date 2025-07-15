'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateField from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from 'rizzui';
import { getDateRangeStateValues } from '@/utils/get-formatted-date';
import { useMedia } from '@/hooks/use-media';
import { useAuth } from '@/context/AuthContext';
import cn from '@/utils/class-names';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
  ownerOptions: { value: string; label: string }[]; // Add owner options prop
};

const viewOptions = [
  { value: '0', label: 'Vu' },
  { value: '1', label: 'Non Vu' },
];

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
  ownerOptions,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const {user} = useAuth()
  console.log('filters : ', filters);

  const getSelectedLabel = (
    value: string,
    options: { value: string; label: string }[]
  ) => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : '';
  };

  return (
    <>
      <DateField
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
        options={viewOptions}
        value={getSelectedLabel(filters['unseen'], viewOptions)}
        onChange={(option: { value: string }) => {
          console.log('unseen filterValue:', option.value); // Debugging helper
          updateFilter('unseen', option.value); // Pass only the value
        }}
        dropdownClassName="!z-10"
        placeholder="Vu ou non vu"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'Vu et Non Vu',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      {user.role === 'admin' && (
        <StatusField
          options={ownerOptions}
          value={getSelectedLabel(filters['userId'], ownerOptions)}
          onChange={(option: { value: string }) => {
            console.log('userId filterValue:', option.value); // Debugging helper
            updateFilter('userId', option.value);
          }}
          dropdownClassName="!z-10"
          className={'w-auto'}
          placeholder="Le propriétaire"
          {...(isMediumScreen && {
            label: 'Propriétaire',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
      )}
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
