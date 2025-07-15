'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { PhoneNumber } from '@/components/ui/phone-input';
import { Input, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { useState } from 'react';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import { useAuth } from '@/context/AuthContext';

interface AddressInfoProps {
  type: string;
  title?: string;
  className?: string;
  isReadOnly?: boolean; // New prop to make fields read-only
}

export default function AddressInfo({
  type,
  title,
  className,
  isReadOnly = false,
}: AddressInfoProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const {user} = useAuth()

  const [isCountrySelectorOpen, setCountrySelectorOpen] = useState(false); // State to toggle country selector
  const [selectedCountry, setSelectedCountry] = useState({
    value: 'US', // Default to 'US', you can set any default
    label: 'United States',
  });

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {title && (
        <Title as="h3" className="col-span-full font-semibold">
          {title}
        </Title>
      )}

      <Input
        label="Customer Name"
        placeholder="Customer name"
        {...register(`${type}.customerName`)}
        error={errors?.[type]?.customerName?.message as string}
      />
      <Controller
        name={`${type}.phoneNumber`}
        control={control}
        render={({ field: { value, onChange } }) => (
          <PhoneNumber
            label="Phone Number"
            country="us"
            value={value}
            onChange={onChange}
            error={errors?.[type]?.phoneNumber?.message as string}
          />
        )}
      />

      {/* Country Selector with label */}
      <div className="">
        <label className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <Controller
          name={`${type}.country`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <CountrySelector
              id={`${type}-country`}
              open={isCountrySelectorOpen}
              disabled={isReadOnly}
              onToggle={() => setCountrySelectorOpen(!isCountrySelectorOpen)}
              onChange={(val) => {
                onChange(val); // Update form state
                setSelectedCountry(
                  COUNTRIES.find((country) => country.value === val)
                ); // Update selected country
              }}
              selectedValue={COUNTRIES.find(
                (country) => country.value === user?.country || 'US'
              )} // Prefill country from session, default to US if not found
            />
          )}
        />
      </div>

      <Input
        label="State"
        placeholder="State"
        {...register(`${type}.state`)}
        error={errors?.[type]?.state?.message as string}
      />
      <Input
        label="City"
        placeholder="City"
        {...register(`${type}.city`)}
        error={errors?.[type]?.city?.message as string}
      />
      <Input
        label="ZIP / Postcode"
        placeholder="ZIP / postcode"
        {...register(`${type}.zip`)}
        error={errors?.[type]?.zip?.message as string}
      />
      <Input
        label="Street Address"
        placeholder="Street Address"
        className="col-span-full"
        {...register(`${type}.street`)}
        error={errors?.[type]?.street?.message as string}
      />
      <Input
        label="Address 2"
        placeholder="Apartment, suite, etc."
        className="col-span-full"
        {...register(`${type}.address2`)}
        error={errors?.[type]?.address2?.message as string}
      />
    </div>
  );
}
