import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  ResponsiveContainer,
} from 'recharts';
import DropdownAction from '@/components/charts/dropdown-action';

const data = [
  { label: 'Total Invoices', value: 30 },
  { label: 'Fully Paid Invoices', value: 20 },
  { label: 'Partially Paid Invoices', value: 5 },
  { label: 'Unpaid Invoices', value: 5 },
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

export default function InvoiceStats({ className }: { className?: string }) {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [marketFilter, setMarketFilter] = useState('tunisia');

  const handleTimeFilterChange = (value: string) => setTimeFilter(value);
  const handleMarketFilterChange = (value: string) => setMarketFilter(value);

  return (
    <WidgetCard
      title="Invoice & Revenue Statistics"
      className={className}
      action={
        <div className="flex gap-2">
          <DropdownAction
            options={timeFilters}
            onChange={handleTimeFilterChange}
          />
          <DropdownAction
            options={marketFilters}
            onChange={handleMarketFilterChange}
          />
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
