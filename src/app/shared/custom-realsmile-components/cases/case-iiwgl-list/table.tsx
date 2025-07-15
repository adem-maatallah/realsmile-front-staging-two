import React, {useMemo} from 'react';
import {Text, Button, Badge, ActionIcon, Tooltip} from 'rizzui';
import cn from '@/utils/class-names';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import EyeIcon from '@/components/icons/eye';
import DateCell from '@/components/ui/date-cell';
import ExpidieModal from '@/app/shared/custom-realsmile-components/modals/sent-modal';
import ModalButton from '@/app/shared/modal-button';
import PdfModalButton from '@/app/shared/custom-realsmile-components/modals/buttons/pdf-modal-button';
const PdfReaderModal = dynamic(
  () =>
    import('@/app/shared/custom-realsmile-components/modals/pdf-reader-modal'),
  { ssr: false }
);
import {BiClipboard} from 'react-icons/bi';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const statusColors: any = {
    Rejeté: 'danger',
    Pending: 'secondary',
    Approuvé: 'success',
};

export const getColumns = (
    setOnyxcephUrl: any,
    stlViewerRef: any,
    setLinkStatus: any,
    isLaboratory?: any
) => {
    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Lien copié dans le presse-papier');
        });
    };

    return [
        {
            title: isLaboratory ? (
                <span className="ml-6 block">STL Link</span>
            ) : (
                <span className="ml-6 block">Lien STL</span>
            ),
            dataIndex: 'url',
            key: 'url',
            width: 10,

            render: (url: any) => {
                return (
                    <div className="flex justify-center items-center">
                        <Tooltip
                            size="sm"
                            content={'Copy link'}
                            placement="top"
                            color="invert"
                        >
                            <ActionIcon onClick={() => handleCopy(url)}>
                                <BiClipboard className="ml-0 h-4 w-4"/>
                            </ActionIcon>
                        </Tooltip>
                    </div>

                );
            },
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            width: 20,

            render: (status: any) => (
                <Badge color={statusColors[status]} rounded="md">
                    {status}
                </Badge>
            ),
        },
        {
            title: isLaboratory ? (
                <span className="ml-6 block">Creation date</span>
            ) : (
                <span className="ml-6 block">Date de création</span>
            ),
            width: 100,
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at: any) => <DateCell date={new Date(created_at)}/>,
        },

        ...(!isLaboratory
            ? [
                {
                    title: 'Actions',
                    dataIndex: '',
                    key: 'actions',
                    width: 20,
                    render: (_: any, record: any) => (
                        <div style={{display: 'flex', gap: '8px'}}>
                            <Tooltip
                                size="sm"
                                content={'Visualiser le smileSet'}
                                placement="top"
                                color="invert"
                            >
                                <ActionIcon
                                    onClick={() => {
                                        setOnyxcephUrl(record.url);
                                        setLinkStatus(record.status);
                                        stlViewerRef.current?.scrollIntoView({
                                            behavior: 'smooth',
                                        });
                                    }}
                                >
                                    <EyeIcon className="ml-0 h-4 w-4"/>
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip
                                size="sm"
                                content={'Afficher le PDF'}
                                placement="top"
                                color="invert"
                            >
                                <PdfModalButton
                                    label=""
                                    view={<PdfReaderModal pdfUrl={record.pdfFile}/>}
                                    className="mt-0 w-36" // Adjusted width
                                />
                            </Tooltip>
                        </div>
                    ),
                },
            ]
            : []),
    ];
};

function StlHistoryTable({
                             caseDetails,
                             setOnyxcephUrl,
                             stlViewerRef,
                             isLoading,
                             setLinkStatus,
                             isLaboratory = false,
                         }: any) {
    const columns = useMemo(
        () => getColumns(setOnyxcephUrl, stlViewerRef, setLinkStatus, isLaboratory),
        [setOnyxcephUrl, stlViewerRef, setLinkStatus, isLaboratory]
    );
    return (
        <BasicTableWidget
            title={isLaboratory ? 'SmileSets History' : 'Historique des SmileSets'}
            className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
            data={caseDetails?.links}
            getColumns={() => columns}
            noGutter
            enableSearch={false}
            scroll={{x: 900}}
            isLoading={isLoading}
        />
    );
}

export default StlHistoryTable;
