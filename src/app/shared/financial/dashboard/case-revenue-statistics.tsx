import React, { useState, useEffect } from 'react';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { Title, Select } from 'rizzui';
import cn from '@/utils/class-names';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import WidgetCard from '@/components/cards/widget-card';
import axiosInstance from '@/utils/axiosInstance';

const marketOptions = [
  { value: 'Tunisie', label: 'Tunisie' },
  { value: 'Maroc', label: 'Maroc' },
  { value: 'Europe', label: 'Europe' },
];

export default function CasesRevenueStatistics({ className }) {
  const { theme } = useTheme();
  const isTablet = useMedia('(max-width: 800px)', false);
  const {user} = useAuth()
  const [selectedMarket, setSelectedMarket] = useState(marketOptions[0].value);
  const [data, setData] = useState([]);

  const handleMarketChange = (option) => setSelectedMarket(option.value);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin-dashboard?market=${selectedMarket}&statType=casesRevenue`;

        const response = await axiosInstance.get(url, {
          withCredentials: true
        });
        const result = response.data;

        const formattedData = result.map((item) => ({
          label: item.label,
          finitions: item.finitions,
          validés: item.validés,
          refusés: item.refusés,
          revenue: item.revenue,
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (user) fetchData();
  }, [selectedMarket, user]);

  return (
    <WidgetCard
      title={`Statistiques des Cas et Chiffre d'Affaires pour ${selectedMarket}`}
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
      headerClassName="items-center"
      action={
        <Select
          options={marketOptions}
          value={selectedMarket}
          onChange={handleMarketChange}
          className="w-40 rounded-md border"
        />
      }
      className={cn('min-h-[28rem] @container', className)}
    >
      <SimpleBar>
        <div className="h-[24rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '1100px' })}
          >
            <ComposedChart
              data={data}
              margin={{ left: -17, top: 20 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20"
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
                dataKey="finitions"
                name="Finitions"
                fill="#ff7300"
                barSize={10}
              />
              <Bar
                dataKey="validés"
                name="Validés"
                fill="#387908"
                barSize={10}
              />
              <Bar
                dataKey="refusés"
                name="Refusés"
                fill="#d00000"
                barSize={10}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Chiffre d'Affaires"
                stroke="#8884d8"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
