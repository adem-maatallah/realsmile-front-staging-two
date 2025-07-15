import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
  Tooltip,
} from 'recharts';
import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';
import { DatePicker, Select } from 'antd';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FFC300',
  '#DAF7A6',
  '#C70039',
  '#581845',
];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  const sin = Math.sin(-RADIAN * props.midAngle);
  const cos = Math.cos(-RADIAN * props.midAngle);
  const sx = cx + (outerRadius + 30) * cos;
  const sy = cy + (outerRadius + 30) * sin;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export default function PacksPieChart({ className }) {
  const { user } = useAuth();
  const [market, setMarket] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchPacksData = async () => {
    try {
      const response = await axiosInstance.get(
        `/admin-dashboard/packs?market=${market}` +
          (dateRange[0] ? `&startDate=${dateRange[0].toISOString()}` : '') +
          (dateRange[1] ? `&endDate=${dateRange[1].toISOString()}` : '')
      );
      const result = response.data;
      setData(Array.isArray(result.packs) ? result.packs : []);
    } catch (error) {
      console.error('Error fetching packs data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPacksData();
    }
  }, [user, market, dateRange]);

  const onMouseOver = useCallback((_, index) => setActiveIndex(index), []);
  const onMouseLeave = useCallback(() => setActiveIndex(0), []);

  const totalCases = data.reduce((acc, pack) => acc + pack.value, 0);

  return (
    <WidgetCard
      titleClassName="text-white"
      title={`Nombre de Cas selon les Packs (Total: ${totalCases})`}
      className={cn(
        'min-h-[28rem] @container [background:linear-gradient(120deg,#234567_20%,#765432_80%)]',
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
              } else {
                setDateRange(dates);
              }
            }}
          />
        </div>
      }
    >
      <div className="h-[24rem] w-full pt-6 @lg:pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              data={data}
              innerRadius={60}
              outerRadius={120}
              fill={COLORS[0]}
              dataKey="value"
              activeShape={renderActiveShape}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
