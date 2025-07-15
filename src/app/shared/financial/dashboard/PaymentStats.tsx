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

const paymentData = [
  { name: 'Total Invoices', value: 30 },
  { name: 'Fully Paid Invoices', value: 20 },
  { name: 'Partially Paid Invoices', value: 5 },
  { name: 'Unpaid Invoices', value: 5 },
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

export default function PaymentStats() {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [marketFilter, setMarketFilter] = useState('tunisia');

  return (
    <WidgetCard
      title="Payment & Revenue Statistics"
      action={
        <div className="flex gap-2">
          <DropdownAction options={timeFilters} onChange={setTimeFilter} />
          <DropdownAction options={marketFilters} onChange={setMarketFilter} />
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={paymentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
