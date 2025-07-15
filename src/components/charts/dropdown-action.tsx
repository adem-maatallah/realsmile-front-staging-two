'use client';

import { useState } from 'react';
import { Select } from 'rizzui';
import cn from '@/utils/class-names';
import { PiCaretDownBold } from 'react-icons/pi';

type Options = {
  value: string;
  label: string;
};

type DropdownActionProps = {
  name?: string;
  options: Options[];
  defaultActive?: string;
  onChange: (data: string) => void;
  className?: string;
  dropdownClassName?: string;
  activeClassName?: string;
  prefixIconClassName?: string;
  suffixIconClassName?: string;
  selectClassName?: string;
};

export default function DropdownAction({
  options,
  onChange,
  className,
  prefixIconClassName,
  suffixIconClassName,
  selectClassName,
  dropdownClassName,
}: DropdownActionProps) {
  const [viewType, setViewType] = useState(options[0]);
  function handleOnChange(data: Options) {
    setViewType(data);
    onChange && onChange(data.value);
  }

  return (
    <Select
      variant="text"
      value={viewType.value}
      options={options}
      onChange={handleOnChange}
      displayValue={(selected) =>
        options.find((option) => option.value === selected)?.label
      }
      selectClassName={cn(
        'py-1 px-2 leading-[32px] h-8', // This line is ensuring a consistent dropdown display
        selectClassName
      )}
      optionClassName="py-2 px-2 leading-[24px] min-h-[48px]" // Styling the dropdown options
      dropdownClassName={cn('w-full p-2 gap-1 grid !z-0', dropdownClassName)}
      placement="bottom-end"
      suffix={
        <PiCaretDownBold className={cn('ml-2 h-3 w-3', suffixIconClassName)} />
      }
      className={cn('w-auto', className)}
    />
  );
}
