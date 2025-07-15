import React, { useEffect, useState } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';
import { DatePicker, Select } from 'antd';
import { useAuth } from '@/context/AuthContext';
import moment from 'moment';
import { Badge } from 'rizzui';
import axiosInstance from '@/utils/axiosInstance';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function InvoiceStatisticsChart({
  className,
}: {
  className?: string;
}) {
  const { user } = useAuth();
  const [market, setMarket] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState({
    totalPaidInvoices: [],
    partiallyPaidInvoices: [],
    unpaidInvoices: [],
  });

  const fetchInvoiceData = async () => {
    try {
      const response = await axiosInstance.get(
        `/admin-dashboard/invoice-statistics?market=${market}&startDate=${dateRange[0] ? dateRange[0].toISOString() : ''}&endDate=${dateRange[1] ? dateRange[1].toISOString() : ''}&groupBy=${groupBy}`
      );
      const result = response.data;
      setData({
        totalPaidInvoices: result.totalPaidInvoices || [],
        partiallyPaidInvoices: result.partiallyPaidInvoices || [],
        unpaidInvoices: result.unpaidInvoices || [],
      });
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      setData({
        totalPaidInvoices: [],
        partiallyPaidInvoices: [],
        unpaidInvoices: [],
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoiceData();
    }
  }, [user, market, dateRange, groupBy]);

  const xAxisFormatter = (label: number) => {
    if (groupBy === 'month') {
      return moment(label, 'M').format('MMM');
    } else if (groupBy === 'day') {
      return moment(label).format('D');
    } else if (groupBy === 'week') {
      return moment(label).format('ddd');
    }
  };

  const defaultChartData = Array.from({ length: 12 }, (_, index) => ({
    label: xAxisFormatter(index + 1),
    totalPaidInvoices: 0,
    partiallyPaidInvoices: 0,
    unpaidInvoices: 0,
  }));

  const chartData = defaultChartData.map((monthData, index) => {
    const paidData =
      data.totalPaidInvoices.find((d) => d.label === index + 1) || {};
    const partiallyPaidData =
      data.partiallyPaidInvoices.find((d) => d.label === index + 1) || {};
    const unpaidData =
      data.unpaidInvoices.find((d) => d.label === index + 1) || {};

    return {
      label: monthData.label,
      totalPaidInvoices: paidData.count || 0,
      partiallyPaidInvoices: partiallyPaidData.count || 0,
      unpaidInvoices: unpaidData.count || 0,
    };
  });

  return (
    <WidgetCard
      title={`Statistiques des Factures`}
      titleClassName="text-white"
      className={cn(
        'min-h-[28rem] @container [background:linear-gradient(45deg,#1A202C_15%,#4A5568_90%)]',
        className
      )}
      description={
        <>
          <Badge renderAsDot className="ms-1 bg-[#FFBB28]" /> Non Payé
          <Badge renderAsDot className="me-1 ms-4 bg-[#00C49F]" /> Partiellement
          payé
          <Badge renderAsDot className="me-1 ms-4 bg-[#0088FE]" /> Payé
        </>
      }
      descriptionClassName="text-white mt-1.5"
      action={
        <div className="flex space-x-4">
          <Select
            value={market}
            onChange={(value) => setMarket(value)}
            options={[
              { value: 'all', label: 'Total' },
              { value: 'Tunisie', label: 'Tunisie' },
              { value: 'Maroc', label: 'Maroc' },
              { value: 'Europe', label: 'Europe' },
            ]}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (!dates || dates.length === 0) {
                // Reset date range and resend the API request
                setDateRange([null, null]);
                setGroupBy('month'); // Reset groupBy to default 'month'
              } else {
                setDateRange(dates);
                setGroupBy(
                  dates && dates[0] && dates[1]
                    ? dates[0].isSame(dates[1], 'day')
                      ? 'day'
                      : 'month'
                    : 'month'
                );
              }
            }}
          />
        </div>
      }
    >
      <div className="h-[24rem] w-full pt-6 @lg:pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            barGap={8}
            margin={{ left: -17, top: 20 }}
          >
            <CartesianGrid
              vertical={false}
              strokeOpacity={0.435}
              strokeDasharray="8 10"
            />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={false} />
            <Bar
              dataKey="totalPaidInvoices"
              fill={COLORS[0]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="partiallyPaidInvoices"
              fill={COLORS[1]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="unpaidInvoices"
              fill={COLORS[2]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
