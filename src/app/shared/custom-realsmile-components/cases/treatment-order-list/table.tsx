import React, { useMemo } from 'react';
import { Tooltip, ActionIcon, Text } from 'rizzui';
import cn from '@/utils/class-names';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import DateCell from '@/components/ui/date-cell';
import { BiClipboard } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { routes } from "@/config/routes";
import Link from "next/link";

export const getColumns = () => {
    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Lien copié dans le presse-papier');
        });
    };

    return [
        {
            title: 'Ordre de traitement',
            dataIndex: 'order', // Corrected key to match your data structure
            key: 'order',
            width: 100,
            render: (order: any, record: any) => (
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
                        {order}
                    </div>
                    <Link href={routes.cases.details(record.id)} className="duration-200 hover:text-gray-900 hover:underline">
                        <Text className="ml-2 text-gray-700 font-semibold">Partie {order}</Text>
                    </Link>
                </div>
                
            ),
        },
        {
            title: 'Date de création',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (created_at: any) => <DateCell date={new Date(created_at)} />,
        },
    ];
};

function TreatmentOrderTable({ caseDetails, isLoading }: any) {
    const columns = useMemo(() => getColumns(), []);
    console.log('linkedCases', caseDetails?.linkedCases)
    return (
        <div className="overflow-hidden">
            <BasicTableWidget
                title="Historique du traitement"
                className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
                data={caseDetails?.linkedCases}
                getColumns={() => columns}
                noGutter
                enableSearch={false}
                scroll={{ x: 900 }}
                isLoading={isLoading}
            />
        </div>
    );
}

export default TreatmentOrderTable;
