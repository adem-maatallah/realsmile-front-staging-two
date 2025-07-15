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
import moment from 'moment';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

const COLORS = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF8042',
  '#AF19FF',
  '#00C49F',
  '#FFBB28',
  '#FFC300',
  '#DAF7A6',
];

export default function CasesSummaryChart({ className }) {
  const { user } = useAuth();
  const [market, setMarket] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState({
    finitions: [],
    validatedCases: [],
    refusedCases: [],
    totalFinitions: 0,
    totalValidatedCases: 0,
    totalRefusedCases: 0,
  });

  const fetchCasesSummaryData = async () => {
    try {
      const response = await axiosInstance.get(
        `/admin-dashboard/cases-summary?market=${market}&startDate=${dateRange[0] ? dateRange[0].toISOString() : ''}&endDate=${dateRange[1] ? dateRange[1].toISOString() : ''}&groupBy=${groupBy}`
      );
      const result = response.data;
      setData({
        finitions: result.finitions || [],
        validatedCases: result.validatedCases || [],
        refusedCases: result.refusedCases || [],
        totalFinitions: result.totalFinitions || 0,
        totalValidatedCases: result.totalValidatedCases || 0,
        totalRefusedCases: result.totalRefusedCases || 0,
      });
    } catch (error) {
      console.error('Error fetching cases summary data:', error);
      setData({
        finitions: [],
        validatedCases: [],
        refusedCases: [],
        totalFinitions: 0,
        totalValidatedCases: 0,
        totalRefusedCases: 0,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCasesSummaryData();
    }
  }, [user, market, dateRange, groupBy]);

  const xAxisFormatter = (label) => {
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
    finitions: 0,
    validatedCases: 0,
    refusedCases: 0,
  }));

  const chartData = defaultChartData.map((monthData, index) => {
    const finitionsData =
      data.finitions.find((d) => d.label === index + 1) || {};
    const validatedData =
      data.validatedCases.find((d) => d.label === index + 1) || {};
    const refusedData =
      data.refusedCases.find((d) => d.label === index + 1) || {};

    return {
      label: monthData.label,
      finitions: finitionsData.count || 0,
      validatedCases: validatedData.count || 0, // Ensure it's count and not sum
      refusedCases: refusedData.count || 0,
    };
  });

  return (
    <WidgetCard
      titleClassName="text-white"
      title={`Résumé des Cas (Finitions, Validés, Refusés) (Total Finitions: ${data.totalFinitions}, Total Validés: ${data.totalValidatedCases}, Total Refusés: ${data.totalRefusedCases})`}
      className={cn(
        'min-h-[28rem] @container [background:linear-gradient(45deg,#1B1D1F_15%,#4B423C_90%)]',
        className
      )}
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
              if (
                !dates ||
                dates.length === 0 ||
                dates.every((date) => date === null)
              ) {
                // Reset to default values
                setDateRange([null, null]);
                setGroupBy('month'); // Reset groupBy to default (month)
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
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#FFFFFF' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#FFFFFF' }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{ color: '#FFFFFF', backgroundColor: '#333333' }}
            />
            <Bar
              dataKey="finitions"
              fill={COLORS[0]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="validatedCases"
              fill={COLORS[1]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="refusedCases"
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