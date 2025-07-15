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
  '#3357FF',
  '#33FF57',
  '#FF5733',
  '#AF19FF',
  '#FF8042',
  '#00C49F',
  '#FFBB28',
  '#FFC300',
  '#DAF7A6',
];

export default function SmilesetChart({ className }) {
  const { user } = useAuth();
  const [market, setMarket] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState({
    smilesetLinks: [],
    totalSmilesetLinks: 0,
  });

  const fetchSmilesetData = async () => {
    try {
      const response = await axiosInstance(
        `/admin-dashboard/smileset?market=${market}&startDate=${dateRange[0] ? dateRange[0].toISOString() : ''}&endDate=${dateRange[1] ? dateRange[1].toISOString() : ''}&groupBy=${groupBy}`
      );
      const result = response.data;
      setData({
        smilesetLinks: result.smilesetLinks || [],
        totalSmilesetLinks: result.totalSmilesetLinks || 0,
      });
    } catch (error) {
      console.error('Error fetching smileset data:', error);
      setData({
        smilesetLinks: [],
        totalSmilesetLinks: 0,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSmilesetData();
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
    smilesetLinks: 0,
  }));

  const chartData = defaultChartData.map((monthData, index) => {
    const smilesetData =
      data.smilesetLinks.find((d) => d.label === index + 1) || {};

    return {
      label: monthData.label,
      smilesetLinks: smilesetData.count || 0,
    };
  });

  return (
    <WidgetCard
      titleClassName="text-white"
      title={`Nombre de Smileset Links (Total: ${data.totalSmilesetLinks})`}
      className={cn(
        'min-h-[28rem] @container [background:linear-gradient(135deg,#123456_10%,#654321_90%)]',
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
              setDateRange(dates);
              setGroupBy(
                dates && dates[0] && dates[1]
                  ? dates[0].isSame(dates[1], 'day')
                    ? 'day'
                    : 'month'
                  : 'month'
              );
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
              dataKey="smilesetLinks"
              fill={COLORS[0]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
