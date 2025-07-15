// investment-overview.tsx
'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import DropdownAction from '@/components/charts/dropdown-action';
import cn from '@/utils/class-names';
import { CustomCircleChartStatic } from './investment/investment';

const timeFilters = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const marketFilters = [
  { value: 'tunisia', label: 'Tunisia' },
  { value: 'morocco', label: 'Morocco' },
  { value: 'europe', label: 'Europe' },
];

export default function InvestmentOverview({
  className,
}: {
  className?: string;
}) {
  const [selectedTime, setSelectedTime] = useState<string>('monthly');
  const [selectedMarket, setSelectedMarket] = useState<string>('tunisia');

  function handleTimeChange(value: string) {
    setSelectedTime(value);
    // Fetch and update data based on selected time filter
  }

  function handleMarketChange(value: string) {
    setSelectedMarket(value);
    // Fetch and update data based on selected market filter
  }

  return (
    <WidgetCard
      title="Investment Overview"
      className={cn('min-h-[28rem]', className)}
      action={
        <div className="flex gap-2">
          <DropdownAction
            className="rounded-md border"
            options={timeFilters}
            onChange={handleTimeChange}
            dropdownClassName="!z-0"
          />
          <DropdownAction
            className="rounded-md border"
            options={marketFilters}
            onChange={handleMarketChange}
            dropdownClassName="!z-0"
          />
        </div>
      }
    >
      <CustomCircleChartStatic />
    </WidgetCard>
  );
}
