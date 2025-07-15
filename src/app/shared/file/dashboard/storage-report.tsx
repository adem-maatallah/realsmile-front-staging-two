import WidgetCard from '@/components/cards/widget-card';
import { Title, Text, Badge } from 'rizzui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import TrendingUpIcon from '@/components/icons/trending-up';
import SimpleBar from '@/components/ui/simplebar';
import { LoadingSpinner } from '../../custom-realsmile-components/customDropZone/customDropZone';

function CustomYAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {`${payload.value} Cas`}
      </text>
    </g>
  );
}

export default function AgeGroupReport({
  data, // Receive the data as a prop
  loading,
  className,
}) {
  const isTablet = useMedia('(max-width: 800px)', false);

  if (loading || !data) {
    return <LoadingSpinner />;
  }

  // Calculate total cases function
  const calculateTotalCases = () => {
    return Object.values(data).reduce(
      (acc, group) => acc + group.Homme + group.Femme,
      0
    );
  };

  // Prepare data array for the bar chart, ensure data is available
  const chartData = data
    ? Object.entries(data).map(([ageGroup, counts]) => ({
        ageGroup,
        Homme: counts.Homme,
        Femme: counts.Femme,
      }))
    : [];

  return (
    <WidgetCard
      title="Nombre de cas par tranche d'âge"
      titleClassName="font-normal text-gray-700 sm:text-base font-inter"
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            Cas totaux : {calculateTotalCases()}
          </Title>
        </div>
      }
      className={className}
    >
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <BarChart
              data={chartData}
              barSize={isTablet ? 32 : 46}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Homme" fill="#4052F6" />
              <Bar dataKey="Femme" fill="#FF7043" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
