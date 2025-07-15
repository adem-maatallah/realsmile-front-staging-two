import React, { useState, useEffect } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
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
import { Title, Select } from 'rizzui'; // Import Select from rizzui
import cn from '@/utils/class-names';
import TrendingUpIcon from '@/components/icons/trending-up';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../financial/dashboard/total-statistics';
import axiosInstance from '@/utils/axiosInstance';

const marketOptions = [
  { value: 'Tunisie', label: 'Tunisie' },
  { value: 'Maroc', label: 'Maroc' },
  { value: 'Europe', label: 'Europe' },
];

const statOptions = [
  { value: 'praticiens', label: 'Nombre de Praticiens' },
  { value: 'patients', label: 'Nombre de Patients' },
  { value: 'finitions', label: 'Nombre de Cas Finitions (Renumeriser)' },
  { value: 'smileset', label: 'Nombre de Smileset Link Ajouté' },
  { value: 'validés', label: 'Nombre de Cas Validés' },
  { value: 'refusés', label: 'Nombre de Cas Refusés' },
  { value: 'packs', label: 'Nombre de Cas par Packs' },
];

type GeneralStatisticsProps = {
  className?: string;
};

export default function GeneralStatistics({
  className,
}: GeneralStatisticsProps) {
  const { theme } = useTheme();
  const isTablet = useMedia('(max-width: 800px)', false);
  const {user} = useAuth()

  const [selectedMarket, setSelectedMarket] = useState(marketOptions[0].value);
  const [selectedStat, setSelectedStat] = useState(statOptions[0].value);
  const [data, setData] = useState([]);

  const handleMarketChange = (option) => {
    setSelectedMarket(option.value);
  };

  const handleStatChange = (option) => {
    setSelectedStat(option.value);
    if (option.value === 'smileset') {
      setSelectedMarket(''); // Clear market selection when smileset is selected
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const url =
          selectedStat === 'smileset'
            ? `/admin-dashboard?statType=${selectedStat}`
            : `/admin-dashboard?market=${selectedMarket}&statType=${selectedStat}`;

        const response = await axiosInstance.get(url);
        const result = await response.data;

        const formattedData = result.map((item, index) => ({
          label: item.label || `Label ${index + 1}`,
          nombre: item.count || item._sum?.amount || 0,
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (user) {
      fetchData();
    }
  }, [selectedMarket, selectedStat, user]);

  return (
    <WidgetCard
      title={`Statistiques pour ${selectedMarket} - ${statOptions.find((opt) => opt.value === selectedStat)?.label}`}
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
      headerClassName="items-center"
      action={
        <div className="flex items-center gap-5">
          {selectedStat !== 'smileset' && (
            <Select
              options={marketOptions}
              value={selectedMarket}
              onChange={handleMarketChange}
              className="w-40 rounded-md border"
            />
          )}
          <Select
            options={statOptions}
            value={selectedStat}
            onChange={handleStatChange}
            className="w-60 rounded-md border"
          />
        </div>
      }
      className={cn('min-h-[28rem] @container', className)}
    >
      <div className="mb-3 mt-1 flex items-center gap-2 @[28rem]:mb-4">
        <Title as="h2" className="font-semibold">
          {data.reduce((sum, item) => sum + item.nombre, 0)}{' '}
          {/* Display total count */}
        </Title>
        <span className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <span className="font-medium leading-none"> Total</span>
        </span>
      </div>
      <SimpleBar>
        <div className="h-[24rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '1100px' })}
          >
            <ComposedChart
              barGap={8}
              data={data}
              margin={{
                left: -17,
                top: 20,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500  [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(label) => `${label}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="nombre"
                {...(theme && {
                  fill: COLORS[0][theme],
                  stroke: COLORS[0][theme],
                })}
                barSize={28}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
