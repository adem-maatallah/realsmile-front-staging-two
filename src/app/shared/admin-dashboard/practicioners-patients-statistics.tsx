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
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

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

export default function PractitionersPatientsChart({ className }) {
  const { user } = useAuth();
  const [market, setMarket] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState({
    practitioners: [],
    patients: [],
    totalPractitioners: 0,
    totalPatients: 0,
  });

  const fetchPractitionersPatientsData = async () => {
    try {
      const response = await axiosInstance.get(
        `/admin-dashboard/practitioners-patients?market=${market}&startDate=${dateRange[0] ? dateRange[0].toISOString() : ''}&endDate=${dateRange[1] ? dateRange[1].toISOString() : ''}&groupBy=${groupBy}`
      );
      const result = response.data;
      setData({
        practitioners: result.practitioners || [],
        patients: result.patients || [],
        totalPractitioners: result.totalPractitioners || 0,
        totalPatients: result.totalPatients || 0,
      });
    } catch (error) {
      console.error('Error fetching practitioners and patients data:', error);
      setData({
        practitioners: [],
        patients: [],
        totalPractitioners: 0,
        totalPatients: 0,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPractitionersPatientsData();
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
    practitioners: 0,
    patients: 0,
  }));

  const chartData = defaultChartData.map((monthData, index) => {
    const practitionerData =
      data.practitioners.find((d) => d.label === index + 1) || {};
    const patientData = data.patients.find((d) => d.label === index + 1) || {};

    return {
      label: monthData.label,
      practitioners: practitionerData.count || 0,
      patients: patientData.count || 0,
    };
  });

  return (
    <WidgetCard
      titleClassName="text-white"
      title={`Nombre de Praticiens et Patients (Total Praticiens: ${data.totalPractitioners}, Total Patients: ${data.totalPatients})`}
      className={cn(
        'min-h-[28rem] @container [background:linear-gradient(29deg,#0E1012_12.96%,#6C4F3E_94.88%)]',
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
                setGroupBy('month');
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
              dataKey="practitioners"
              fill={COLORS[0]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="patients"
              fill={COLORS[1]}
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
