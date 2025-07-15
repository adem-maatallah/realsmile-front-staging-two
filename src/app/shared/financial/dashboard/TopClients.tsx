import React, { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import DropdownAction from '@/components/charts/dropdown-action';

const topClients = [
  { name: 'Client A', cases: 100, totalInvoices: 10000 },
  { name: 'Client B', cases: 80, totalInvoices: 8000 },
  { name: 'Client C', cases: 70, totalInvoices: 7000 },
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

export default function TopClients() {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [marketFilter, setMarketFilter] = useState('tunisia');

  return (
    <WidgetCard
      title="Top Clients"
      action={
        <div className="flex gap-2">
          <DropdownAction options={timeFilters} onChange={setTimeFilter} />
          <DropdownAction options={marketFilters} onChange={setMarketFilter} />
        </div>
      }
    >
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Client</th>
            <th>Cases Processed</th>
            <th>Total Invoices (€)</th>
          </tr>
        </thead>
        <tbody>
          {topClients.map((client, index) => (
            <tr key={index}>
              <td>{client.name}</td>
              <td>{client.cases}</td>
              <td>{client.totalInvoices}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}
