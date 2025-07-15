// transaction-history-overview.tsx
'use client';

import WidgetCard from '@/components/cards/widget-card';
import ControlledTable from '@/components/controlled-table';
import { useState } from 'react';
import DropdownAction from '@/components/charts/dropdown-action';
import cn from '@/utils/class-names';

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

export default function TransactionHistoryOverview({
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
      title="Transaction History Overview"
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
      <ControlledTable />
    </WidgetCard>
  );
}
