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
  { label: 'New Practitioners', value: 10 },
  { label: 'Total Practitioners', value: 150 },
  { label: 'New Patients', value: 20 },
  { label: 'Total Patients', value: 300 },
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

export default function PractitionerStats({
  className,
}: {
  className?: string;
}) {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [marketFilter, setMarketFilter] = useState('tunisia');

  const handleTimeFilterChange = (value: string) => setTimeFilter(value);
  const handleMarketFilterChange = (value: string) => setMarketFilter(value);

  return (
    <WidgetCard
      title="Practitioner & Patient Statistics"
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
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
