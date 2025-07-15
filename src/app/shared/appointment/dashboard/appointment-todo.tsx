'use client';
import { useState, useEffect } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { AdvancedCheckbox, Button, Badge } from 'rizzui';
import cn from '@/utils/class-names';
import DropdownAction from '@/components/charts/dropdown-action';
import { PiCheckBold } from 'react-icons/pi';
import DateCell from '@/components/ui/date-cell';
import SimpleBar from 'simplebar-react';
import Link from 'next/link';

export default function DentalAppointments({
  className,
  data,
}: {
  className?: string;
  data: any[];
}) {
  const [filter, setFilter] = useState('Tous');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (filter === 'Tous') {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => item.status === filter);
      setFilteredData(filtered);
    }
  }, [filter, data]);

  function handleChange(option) {
    setFilter(option);
  }

  function getBadgeColor(status) {
    switch (status) {
      case 'En Traitement':
        return 'secondary';
      case 'SmileSet En Cours':
        return 'warning';
      case 'Cas Terminé':
        return 'success';
      case 'Approbation Requise':
        return 'info';
      default:
        return 'secondary';
    }
  }

  return (
    <WidgetCard
      title="Les cas en attente d'approbation"
      titleClassName="text-gray-800 sm:text-lg font-inter"
      headerClassName="items-center"
      className={cn('overflow-hidden bg-gray-50 @container', className)}
      action={
        <DropdownAction
          className="w-full rounded-lg border"
          options={[
            { value: 'Tous', label: 'Tous' },
            { value: 'Soumission Incompléte', label: 'Soumission Incompléte' },
            { value: 'SmileSet En Cours', label: 'SmileSet En Cours' },
            { value: 'Approbation Requise', label: 'Approbation Requise' },
            { value: 'En Traitement', label: 'En Traitement' },
            { value: 'En Fabrication', label: 'En Fabrication' },
            { value: 'Terminés', label: 'Terminés' },
          ]}
          onChange={(option) => {
            handleChange(option);
          }}
          dropdownClassName="!z-0"
          prefixIconClassName="hidden"
        />
      }
    >
      <div className="mt-7 h-[22rem]">
        <SimpleBar className="relative -mx-3 -my-2 h-full w-[calc(100%+24px)]">
          <div className="relative before:absolute before:start-9 before:top-3 before:z-0 before:h-[calc(100%-24px)] before:w-1 before:translate-x-0.5 before:bg-gray-200">
            {filteredData?.map((item, index) => (
              <AdvancedCheckbox
                key={index}
                className="relative z-10 mt-0.5 px-3 py-1.5"
                inputClassName="custom-checkbox-style"
                contentClassName="flex w-full bg-gray-0 dark:bg-gray-50 items-center px-4 py-4 rounded-lg shadow hover:shadow-md transition-shadow border-0"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#D9B34E]">
                  <PiCheckBold className="fill-[#2B7F75] opacity-0" />
                </span>
                <div className="flex items-center pl-4">
                  <Badge
                    color={getBadgeColor(item.status)}
                    className="mr-2 px-2 py-1 text-sm text-white"
                  >
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex-grow text-gray-600">
                    <strong className="font-semibold text-gray-900">
                      {item.patient.first_name} {item.patient.last_name}
                    </strong>
                    {' - '}
                  </div>
                  <DateCell
                    date={item.created_at}
                    dateClassName="font-normal text-gray-500"
                    className="flex gap-2"
                    timeClassName="text-sm"
                    dateFormat="D MMM YYYY, HH:mm"
                  />
                </div>
              </AdvancedCheckbox>
            ))}
          </div>
          <div className="fixed bottom-0 start-0 z-20 flex h-32 w-full items-end justify-center bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pb-6">
            <Link href="/cases">
              <Button
                className="bg-gray-0 text-gray-800 shadow-md transition-shadow hover:bg-gray-0 hover:shadow dark:hover:bg-gray-0"
                rounded="lg"
              >
                Voir tous mes cas
              </Button>
            </Link>
          </div>
        </SimpleBar>
      </div>
    </WidgetCard>
  );
}
