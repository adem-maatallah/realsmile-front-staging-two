import { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import ControlledTable from '@/components/controlled-table';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { Input } from 'rizzui';
import { useAuth } from '@/context/AuthContext';
import { getColumns } from './columns';
import axiosInstance from '@/utils/axiosInstance';

export default function BestClientsTable({
  className,
}: {
  className?: string;
}) {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(7);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('total');

  useEffect(() => {
    const fetchTopClients = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/admin-dashboard/top-clients?market=${selectedMarket}`
        );
        const result = response.data;

        // Check if the result is an array
        if (Array.isArray(result)) {
          setData(result);
        } else {
          // Handle cases where the result is not an array
          console.error('Expected an array, but received:', result);
          setData([]); // Set to an empty array to avoid errors
        }
      } catch (error) {
        console.error('Error fetching top clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopClients();
  }, [user, selectedMarket]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implement search filtering here if needed
  };

  const handleMarketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMarket(event.target.value);
  };

  const columns = getColumns({
    data,
    sortConfig: {}, // Update as needed
    checkedItems: [], // Implement if needed
    onHeaderCellClick: () => {}, // Implement if needed
    onDeleteItem: (id) => {}, // Implement if needed
    onChecked: (id) => {}, // Implement if needed
    handleSelectAll: () => {}, // Implement if needed
  });

  return (
    <WidgetCard
      className={className}
      headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="w-full ps-0 items-center"
      titleClassName="w-[19ch]"
      title="Les 10 meilleurs clients"
      action={
        <div className="mt-4 flex w-full flex-col-reverse items-center justify-between gap-3 @[35rem]:flex-row @[57rem]:mt-0">
          <Input
            className="w-full @[35rem]:w-auto @[70rem]:w-80"
            type="search"
            inputClassName="h-9"
            placeholder="Search for user details..."
            value={searchTerm}
            onClear={() => handleSearch('')}
            onChange={(event) => handleSearch(event.target.value)}
            clearable
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          />

          <select
            className="mt-4 w-full @[35rem]:mt-0 @[35rem]:w-auto @[70rem]:w-80"
            value={selectedMarket}
            onChange={handleMarketChange}
          >
            <option value="total">Total</option>
            <option value="tunisie">Tunisie</option>
            <option value="maroc">Maroc</option>
            <option value="europe">Europe</option>
          </select>
        </div>
      }
    >
      <ControlledTable
        variant="modern"
        data={data}
        isLoading={isLoading}
        showLoadingText={true}
        // @ts-ignore
        columns={columns}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: data.length,
          current: 1,
          onChange: (page: number) => console.log('Page changed:', page), // Implement pagination if needed
        }}
        className="-mx-5 lg:-mx-7"
      />
    </WidgetCard>
  );
}
