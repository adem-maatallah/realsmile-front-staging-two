'use client';

import cn from '@/utils/class-names';
import ShipWithContainer from '@/components/icons/ship-with-container';
import ShippingBox from '@/components/icons/shipping-box';
import CargoPallet from '@/components/icons/cargo-pallet';
import MoneyInHand from '@/components/icons/money-in-hand';
import SimpleBar from '@/components/ui/simplebar';

type StatType = {
    id: number;
    count: number | string;
    icon: React.ReactNode;
    label: string;
};

const data = [
    {
        id: 1,
        count: 602,
        icon: <ShipWithContainer />,
        label: 'En cours',
    },
    {
        id: 2,
        count: 102,
        icon: <ShippingBox />,
        label: 'En attente',
    },
    {
        id: 3,
        count: 50,
        icon: <CargoPallet />,
        label: 'Approbation requise',
    },
    {
        id: 4,
        count: 80,
        icon: <MoneyInHand />,
        label: 'En transit',
    },
    // {
    //   id: 5,
    //   count: 130999,
    //   icon: <Containers />,
    //   label: 'Total Shipments',
    // },
];

interface IndexProps {
    className?: string;
}

export default function CaseStats({ className }: IndexProps) {
    return (
        <SimpleBar>
            <div className="grid grid-flow-col gap-5">
                {data.map((item) => (
                    <CaseStat key={item.id} {...item} />
                ))}
            </div>
        </SimpleBar>
    );
}

export function CaseStat({ count, icon, label }: StatType) {
    return (
        <div
            className={cn(
                'grid w-80 grid-cols-[1fr_3fr] items-start gap-4 rounded-lg border border-gray-300 px-6 py-6 3xl:w-auto'
            )}>
            <figure className="relative flex items-center justify-center rounded-full [&>svg]:h-12 [&>svg]:w-12">
                {icon}
            </figure>
            <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="mt-0.5 text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}
