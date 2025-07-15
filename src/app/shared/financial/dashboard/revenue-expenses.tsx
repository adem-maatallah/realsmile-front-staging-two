// revenue-expenses.tsx
'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import DropdownAction from '@/components/charts/dropdown-action';
import { useTheme } from 'next-themes';
import cn from '@/utils/class-names';

const data = [
  { label: 'Mon', revenue: 98, expenses: 80 },
  { label: 'Tue', revenue: 87, expenses: 49 },
  // Add more data points as needed
];

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

export default function RevenueExpenses({ className }: { className?: string }) {
  const { theme } = useTheme();
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
      title="Revenue vs Expenses"
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
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
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="revenue"
            fill={theme === 'dark' ? '#38CC79' : '#38CC79'}
          />
          <Bar
            dataKey="expenses"
            fill={theme === 'dark' ? '#273849' : '#111A23'}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
