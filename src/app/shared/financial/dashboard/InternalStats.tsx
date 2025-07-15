import React, { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import DropdownAction from '@/components/charts/dropdown-action';

const internalData = [
  { name: 'Design Time', value: 3 },
  { name: 'Validation Time', value: 2 },
  { name: 'Manufacturing Time', value: 5 },
];

const timeFilters = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function InternalStats() {
  const [timeFilter, setTimeFilter] = useState('monthly');

  return (
    <WidgetCard
      title="Internal Processing Times"
      action={<DropdownAction options={timeFilters} onChange={setTimeFilter} />}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={internalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
