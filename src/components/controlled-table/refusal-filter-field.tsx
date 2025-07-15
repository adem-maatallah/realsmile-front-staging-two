'use client';

import React from 'react';
import { Select, type SelectProps, type SelectOption } from 'rizzui';
import cn from '@/utils/class-names';

const refusalOptions: SelectOption[] = [
  { label: 'Tous les cas', value: '' },
  { label: 'Cas refusé', value: '1' },
  { label: 'Cas non refusé', value: '0' },
];

export default function RefusalFilterField({
  value,
  onChange,
  className,
  label = 'Cas refusé',
  ...props
}: SelectProps<SelectOption> & { label?: string }) {
  return (
    <Select
      options={refusalOptions}
      value={value}
      onChange={onChange}
      getOptionValue={(option) => option.value}
      getOptionDisplayValue={(option) => option.label}
      displayValue={(selected) => {
        const selectedOption = refusalOptions.find(
          (option) => option.value === selected
        );
        return selectedOption ? selectedOption.label : 'Tous les cas';
      }}
      className={cn('w-auto', className)}
      dropdownClassName="!z-10"
      {...props}
    />
  );
}
