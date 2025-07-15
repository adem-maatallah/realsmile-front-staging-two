// financial-overview.tsx
'use client';

import { useState } from 'react';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import {
  PiBank,
  PiCube,
  PiCurrencyCircleDollar,
  PiFolder,
} from 'react-icons/pi';
import TransactionCard, {
  TransactionType,
} from '@/components/cards/transaction-card';
import DropdownAction from '@/components/charts/dropdown-action';

type FinancialOverviewProps = {
  className?: string;
};

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

const initialStatData: TransactionType[] = [
  {
    title: 'Total Income',
    amount: '$16,085k',
    increased: true,
    percentage: '32.45',
    icon: PiBank,
    iconWrapperFill: '#8A63D2',
  },
  {
    title: 'Total Orders',
    amount: '$25,786k',
    increased: false,
    percentage: '32.45',
    icon: PiCube,
    iconWrapperFill: '#00CEC9',
  },
  {
    title: 'Net Profit',
    amount: '$38,503k',
    increased: true,
    percentage: '32.45',
    icon: PiCurrencyCircleDollar,
    iconWrapperFill: '#0070F3',
  },
  {
    title: 'Total Expense',
    amount: '$27,432k',
    increased: false,
    percentage: '32.45',
    icon: PiFolder,
    iconWrapperFill: '#F5A623',
  },
];

export default function FinancialOverview({
  className,
}: FinancialOverviewProps) {
  const [statData, setStatData] = useState<TransactionType[]>(initialStatData);
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
    <div className={cn('relative flex flex-col gap-4', className)}>
      <div className="flex justify-between">
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
      <div className="flex space-x-4 overflow-x-auto">
        {statData.map((stat, index) => (
          <TransactionCard
            key={'transaction-card-' + index}
            transaction={stat}
            className="min-w-[300px]"
          />
        ))}
      </div>
    </div>
  );
}
