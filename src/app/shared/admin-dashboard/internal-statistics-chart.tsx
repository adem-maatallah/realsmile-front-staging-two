'use client';

import { useState, useEffect } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { DatePicker } from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { Badge, cn } from 'rizzui';
import moment from 'moment';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

export default function InternalStatisticsChart({
  className,
}: {
  className?: string;
}) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const [dateRange, setDateRange] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);
  const [data, setData] = useState([]);
  const { user } = useAuth();

  const fetchStatisticsData = async (startDate?: string, endDate?: string) => {
    try {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/admin-dashboard/internal-statistics`
      );
      // Add parameters only if they are defined
      if (startDate && endDate) {
        url.searchParams.append('startDate', startDate);
        url.searchParams.append('endDate', endDate);
      }

      const response = await axiosInstance.get(url.toString());

      const result = response.data;
      console.log('Internal Statistics Data:', result);
      const formattedData = result.map((item: any) => ({
        month: moment(`${item.month}-01`, 'M-YYYY').format('MMM'),
        conception: parseFloat(item.avg_conception_delay),
        validation: parseFloat(item.avg_validation_delay),
        fabrication: parseFloat(item.avg_fabrication_delay),
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching internal statistics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatisticsData(); // Fetch data on mount with default empty range
    }
  }, [user]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1] && user) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      fetchStatisticsData(startDate, endDate);
    } else if (!dateRange[0] && !dateRange[1]) {
      // Fetch data without date range (default behavior)
      fetchStatisticsData();
    }
  }, [dateRange, user]);

  return (
    <WidgetCard
      titleClassName="text-white"
      title={'Statistiques Internes - Délai Moyenne'}
      description={
        <>
          <Badge renderAsDot className="ms-1 bg-[#10b981]" /> Conception
          <Badge renderAsDot className="me-1 ms-4 bg-[#0470f2]" /> Validation
          <Badge renderAsDot className="me-1 ms-4 bg-[#f2a104]" /> Fabrication
        </>
      }
      descriptionClassName="text-white mt-1.5"
      action={
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates || [null, null])} // Ensure dateRange is set correctly
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      }
      className={cn(
        'min-h-[28rem] @container',
        className,
        '[background:linear-gradient(29deg,#1E2022_12.96%,#4A3C2C_94.88%)]' // Adding the background style
      )}
    >
      <SimpleBar>
        <div className="h-[480px] w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <AreaChart
              data={data}
              margin={{
                left: -16,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="conception" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffdadf" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="validation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dbeafe" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0470f2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fabrication" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff2da" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f2a104" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className=" "
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value} h`}
                className=" "
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="natural"
                dataKey="conception"
                stroke="#10b981"
                strokeWidth={2.3}
                fillOpacity={1}
                fill="url(#conception)"
              />
              <Area
                type="natural"
                dataKey="validation"
                stroke="#0470f2"
                strokeWidth={2.3}
                fillOpacity={1}
                fill="url(#validation)"
              />
              <Area
                type="natural"
                dataKey="fabrication"
                stroke="#f2a104"
                strokeWidth={2.3}
                fillOpacity={1}
                fill="url(#fabrication)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
