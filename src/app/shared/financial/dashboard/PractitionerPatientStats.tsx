import React, { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import DropdownAction from '@/components/charts/dropdown-action';

const data = [
  { name: 'New Practitioners', value: 10 },
  { name: 'Total Practitioners', value: 100 },
  { name: 'New Patients', value: 20 },
  { name: 'Total Patients', value: 300 },
  { name: 'Finished Cases', value: 50 },
  { name: 'Added Links', value: 200 },
  { name: 'Validated Cases', value: 40 },
  { name: 'Refused Cases', value: 5 },
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

export default function PractitionerPatientStats() {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [marketFilter, setMarketFilter] = useState('tunisia');

  return (
    <WidgetCard
      title="Practitioner & Patient Statistics"
      action={
        <div className="flex gap-2">
          <DropdownAction options={timeFilters} onChange={setTimeFilter} />
          <DropdownAction options={marketFilters} onChange={setMarketFilter} />
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
