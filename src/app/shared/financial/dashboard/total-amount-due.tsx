import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import moment from 'moment';
import cn from '@/utils/class-names';
import { DatePicker } from 'antd';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#FF5733', '#33FF57', '#3357FF'];

export function TotalAmountDueChart({
  data,
  region,
  className,
  onDateChange,
  dateRange,
}: {
  region: string;
  className?: string;
  data: { label: number; amount: number }[];
  onDateChange: (dates: [moment.Moment | null, moment.Moment | null]) => void;
  dateRange: [moment.Moment | null, moment.Moment | null];
}) {
  const xAxisFormatter = (label: number) => {
    return moment(label, 'M').format('MMM');
  };

  const getCurrencySymbol = (region: string) => {
    switch (region) {
      case 'TN':
        return 'TND';
      case 'MA':
        return 'DH';
      case 'EUR':
        return '€';
      default:
        return '$';
    }
  };

  return (
    <WidgetCard
      title={`Chiffre d'affaires (${region})`}
      titleClassName="text-white"
      className={cn(`min-h-[28rem] @container`, className)}
      action={
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (
              !dates ||
              dates.length === 0 ||
              dates.every((date) => date === null)
            ) {
              // Reset the date range to default (null or your desired default range)
              onDateChange([null, null]);
            } else {
              onDateChange(dates);
            }
          }}
        />
      }
    >
      <div className="h-[24rem] w-full pt-6 @lg:pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 2, right: 5, bottom: 10 }}>
            <defs>
              <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#FFFFFF' }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${getCurrencySymbol(region)} ${value}`}
              tick={{ fill: '#FFFFFF' }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{ color: '#FFFFFF', backgroundColor: '#333333' }}
              formatter={(value: number) =>
                `${getCurrencySymbol(region)} ${value}`
              }
            />
            <Area
              dataKey="amount"
              stroke={COLORS[0]}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#amountGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

export default function TotalAmountDueRow() {
  const { user } = useAuth();
  const [dateRangeTN, setDateRangeTN] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);
  const [dateRangeMA, setDateRangeMA] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);
  const [dateRangeEUR, setDateRangeEUR] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);

  const [totalData, setTotalData] = useState({
    TN: [],
    MA: [],
    EUR: [],
  });

  const fetchTotalDueData = async (
    market: string,
    dates: [moment.Moment | null, moment.Moment | null]
  ) => {
    if (!user) return;

    try {
      const startDate = dates[0] ? dates[0].toISOString() : '';
      const endDate = dates[1] ? dates[1].toISOString() : '';

      const response = await axiosInstance.get(
        `/admin-dashboard/total-due?startDate=${startDate}&endDate=${endDate}&market=${market}`
      );

      const result = await response.data;
      setTotalData((prevState) => ({
        ...prevState,
        [market]: result.data.map((entry:any) => ({
          label: entry.label,
          amount: entry.amount,
        })),
      }));
    } catch (error) {
      console.error(`Error fetching total due for ${market}:`, error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTotalDueData('TN', dateRangeTN);
    }
  }, [user, dateRangeTN]);

  useEffect(() => {
    if (user) {
      fetchTotalDueData('MA', dateRangeMA);
    }
  }, [user, dateRangeMA]);

  useEffect(() => {
    if (user) {
      fetchTotalDueData('EUR', dateRangeEUR);
    }
  }, [user, dateRangeEUR]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <TotalAmountDueChart
        region="TN"
        className="[background:linear-gradient(29deg,#1E2022_12.96%,#4A3C2C_94.88%)]"
        data={totalData.TN}
        onDateChange={setDateRangeTN}
        dateRange={dateRangeTN}
      />
      <TotalAmountDueChart
        region="MA"
        className="[background:linear-gradient(29deg,#2A2022_12.96%,#3A4B2C_94.88%)]"
        data={totalData.MA}
        onDateChange={setDateRangeMA}
        dateRange={dateRangeMA}
      />
      <TotalAmountDueChart
        region="EUR"
        className="[background:linear-gradient(29deg,#3B4D3F_12.96%,#4B2C1E_94.88%)]"
        data={totalData.EUR}
        onDateChange={setDateRangeEUR}
        dateRange={dateRangeEUR}
      />
    </div>
  );
}
