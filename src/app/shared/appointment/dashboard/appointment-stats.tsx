'use client';

import React from 'react';
import { useScrollableSlider } from '@/hooks/use-scrollable-slider';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import { IconType } from 'react-icons/lib';
import {
  PiCalendarCheck,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCheckCircle,
  PiClock,
  PiPhoneSlash,
  PiArrowDownRight,
} from 'react-icons/pi';
import { Skeleton } from '@/components/ui/skeleton';
import AllCasesIcon from '@/components/custom-icons/AllCasesIcon';
import SmileSetIcon from '@/components/custom-icons/SmileSetIcon';
import NeedsApprovalIcon from '@/components/custom-icons/NeedsApprovalIcon';
import EnFabricationIcon from '@/components/custom-icons/EnFabricationIcon';
import TermineIcon from '@/components/custom-icons/TermineIcon';

type StatType = {
  icon: IconType;
  title: string;
  amount: number;
  increased: boolean;
  percentage: string;
};

type StatCardProps = {
  className?: string;
  transaction: StatType;
};

const StatCardSkeleton = () => (
  <div className="group w-full min-w-[300px] rounded-[14px] border border-gray-300 px-6 py-7">
    <div className="flex items-center gap-5">
      <span className="flex rounded-[14px] bg-[#a16207] p-2.5">
        <Skeleton className="h-6 w-6" />
      </span>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </div>
  </div>
);

function StatCard({ className, transaction }: StatCardProps) {
  const { icon: Icon, title, amount, increased, percentage } = transaction;
  return (
    <div
      className={cn(
        'group w-full rounded-[14px] border border-gray-300 px-6 py-7',
        className
      )}
    >
      <div className="flex items-center gap-5">
        <span className="flex rounded-[14px] bg-[#a16207] p-2.5 text-gray-0">
          <Icon className="h-auto w-[30px]" />
        </span>
        <div className="space-y-1.5">
          <p className="font-medium text-gray-500">{title}</p>
          <p className="text-lg font-bold text-gray-900">{amount}</p>
        </div>
      </div>
    </div>
  );
}

function StatGrid({ data, isLoading }: { data: any; isLoading: boolean }) {
  const statData: StatType[] = [
    {
      title: 'Tous les cas',
      amount: data?.totalCases,
      increased: true,
      percentage: '15.00%',
      icon: AllCasesIcon,
    },
    {
      title: 'Conception du SmileSet',
      amount: data?.pending,
      increased: false,
      percentage: '20.50%',
      icon: SmileSetIcon,
    },
    {
      title: 'Approbation Requise',
      amount: data?.needs_approval,
      increased: false,
      percentage: '-5.00%',
      icon: NeedsApprovalIcon,
    },
    {
      title: 'En Fabrication',
      amount: data?.in_construction,
      increased: false,
      percentage: '18.75%',
      icon: EnFabricationIcon,
    },
    {
      title: 'Cas Terminés',
      amount: data?.complete,
      increased: false,
      percentage: '12.00%',
      icon: TermineIcon,
    },
  ];

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }, (_, index) => (
          <StatCardSkeleton key={`skeleton-${index}`} />
        ))}
      </>
    );
  }

  return (
    <>
      {statData.map((stat, index) => (
        <StatCard
          key={`stat-card-${index}`}
          transaction={stat}
          className="min-w-[300px]"
        />
      ))}
    </>
  );
}

export default function AppointmentStats({
  className,
  data,
  isLoading,
}: {
  className?: string;
  data: any;
  isLoading: boolean;
}) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  return (
    <div
      className={cn(
        'relative flex w-auto items-center overflow-hidden',
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={scrollToTheLeft}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth"
        >
          <StatGrid data={data} isLoading={isLoading} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={scrollToTheRight}
        className="!absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 pe-2 text-gray-500 hover:text-gray-900"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}
