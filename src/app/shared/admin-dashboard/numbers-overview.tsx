import { useState, useEffect } from 'react';
import { DatePicker, Select } from 'antd';
import { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayjs from 'dayjs';
import TransactionCard, {
  TransactionType,
} from '@/components/cards/transaction-card';
import { PiUser, PiUserCheck, PiFileText, PiReceipt } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

// Extend dayjs with isoWeek plugin
dayjs.extend(isoWeek);

const { RangePicker } = DatePicker;
const { Option } = Select;

type NumbersOverviewProps = {
  className?: string;
};

export default function NumbersOverview({ className }: NumbersOverviewProps) {
  const [statData, setStatData] = useState<TransactionType[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('total');
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [dateFilter, setDateFilter] = useState<string>('daily');


  useEffect(() => {
    fetchData(selectedMarket, dateRange);
  }, [selectedMarket, dateRange]);

  async function fetchData(
    market: string,
    range: [Dayjs | null, Dayjs | null] | null
  ) {
    let startDate, endDate;

    if (!range) {
      startDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
      endDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');
    } else {
      startDate = range[0]?.format('YYYY-MM-DD');
      endDate = range[1]?.format('YYYY-MM-DD');
    }

    try {
      const response = await axiosInstance.get(
        `/admin-dashboard/numbers-overview?startDate=${startDate}&endDate=${endDate}&market=${market}`
      );

      const result = response.data;

      const chiffreAffairesTunisia = result.chiffreAffairesTunisia || 0;
      const chiffreAffairesMorocco = result.chiffreAffairesMorocco || 0;
      const chiffreAffairesEurope = result.chiffreAffairesEurope || 0;

      const formattedData = [
        {
          title: 'Nombre de nouveaux praticiens',
          amount:
            market === 'total' ? (
              <>
                <div>{result.newPractitionersTunisia || 0} TN</div>
                <div>{result.newPractitionersMorocco || 0} MA</div>
                <div>{result.newPractitionersEurope || 0} EUR</div>
              </>
            ) : (
              result.newPractitioners || 0
            ),
          increased: true,
          icon: PiUserCheck,
          iconWrapperFill: '#0070F3',
        },
        {
          title: 'Nombre de nouveaux cas',
          amount:
            market === 'total' ? (
              <>
                <div>{result.newCasesTunisia || 0} TN</div>
                <div>{result.newCasesMorocco || 0} MA</div>
                <div>{result.newCasesEurope || 0} EUR</div>
              </>
            ) : (
              result.newCases || 0
            ),
          increased: true,
          icon: PiFileText,
          iconWrapperFill: '#F5A623',
        },
        {
          title: 'Nombre de numérisation',
          amount:
            market === 'total' ? (
              <>
                <div>{result.numRenumeratedCasesTunisia || 0} TN</div>
                <div>{result.numRenumeratedCasesMorocco || 0} MA</div>
                <div>{result.numRenumeratedCasesEurope || 0} EUR</div>
              </>
            ) : (
              result.numScans || 0
            ),
          increased: true,
          icon: PiFileText,
          iconWrapperFill: '#00CEC9',
        },
        {
          title: 'Nombre de commandés',
          amount:
            market === 'total' ? (
              <>
                <div>{result.numOrderedCasesTunisia || 0} TN</div>
                <div>{result.numOrderedCasesMorocco || 0} MA</div>
                <div>{result.numOrderedCasesEurope || 0} EUR</div>
              </>
            ) : (
              result.numOrders || 0
            ),
          increased: true,
          icon: PiFileText,
          iconWrapperFill: '#FF6F61',
        },
        {
          title: 'Nombre de cases refusés',
          amount:
            market === 'total' ? (
              <>
                <div>{result.numRejectedCasesTunisia || 0} TN</div>
                <div>{result.numRejectedCasesMorocco || 0} MA</div>
                <div>{result.numRejectedCasesEurope || 0} EUR</div>
              </>
            ) : (
              result.numRejectedCases || 0
            ),
          increased: false,
          icon: PiFileText,
          iconWrapperFill: '#FF6F61',
        },
        {
          title: 'Nombre de cases fabriqués',
          amount:
            market === 'total' ? (
              <>
                <div>{result.numManufacturedCasesTunisia || 0} TN</div>
                <div>{result.numManufacturedCasesMorocco || 0} MA</div>
                <div>{result.numManufacturedCasesEurope || 0} EUR</div>
              </>
            ) : (
              result.numManufacturedCases || 0
            ),
          increased: true,
          icon: PiFileText,
          iconWrapperFill: '#F5A623',
        },
        {
          title: "Chiffre d'affaires",
          amount:
            market === 'total' ? (
              <>
                <div>{chiffreAffairesTunisia.toLocaleString('en-US')} TND</div>
                <div>{chiffreAffairesMorocco.toLocaleString('en-US')} MAD</div>
                <div>{chiffreAffairesEurope.toLocaleString('en-US')} EUR</div>
              </>
            ) : (
              (
                result[
                  `chiffreAffaires${market.charAt(0).toUpperCase() + market.slice(1)}`
                ] || 0
              ).toLocaleString('en-US')
            ),
          increased: true,
          icon: PiReceipt,
          iconWrapperFill: '#8A63D2',
        },
      ];
      setStatData(formattedData);
    } catch (error) {
      console.error('Error fetching numbers overview:', error);
    }
  }

  function handleMarketChange(value: string) {
    setSelectedMarket(value);
  }

  function handleDateRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (!dates || dates.some((date) => date === null)) {
      setDateRange(null);
      setDateFilter('daily');
    } else {
      setDateRange(dates);
    }
  }

  function handleDateFilterChange(value: string) {
    setDateFilter(value);

    let range: [Dayjs | null, Dayjs | null] | null = null;
    const now = dayjs();

    switch (value) {
      case 'daily':
        range = [now.startOf('day'), now.endOf('day')];
        break;
      case 'weekly':
        range = [now.startOf('isoWeek'), now.endOf('isoWeek')];
        break;
      case 'monthly':
        range = [now.startOf('month'), now.endOf('month')];
        break;
      default:
        range = null;
    }

    setDateRange(range);
  }

  return (
    <div className={cn('relative flex flex-col gap-4', className)}>
      <div className="flex space-x-4">
        <Select
          value={selectedMarket}
          onChange={handleMarketChange}
          className="w-48 rounded-md border border-gray-300"
          dropdownClassName="z-10"
        >
          <Option value="total">Total</Option>
          <Option value="tunisia">Tunisie</Option>
          <Option value="morocco">Maroc</Option>
          <Option value="europe">Europe</Option>
        </Select>
        <Select
          value={dateFilter}
          onChange={handleDateFilterChange}
          className="w-48 rounded-md border border-gray-300"
          dropdownClassName="z-10"
        >
          <Option value="daily">Daily</Option>
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
        </Select>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="YYYY-MM-DD"
          className="w-64"
          allowEmpty={[true, true]}
        />
      </div>
      <div
        className={cn(
          'relative grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4',
          className
        )}
      >
        {statData.map((stat, index) => (
          <TransactionCard
            key={'transaction-card-' + index}
            transaction={stat}
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}
