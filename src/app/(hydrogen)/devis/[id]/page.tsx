"use client";
import {useEffect, useRef, useState} from "react";
import {useReactToPrint} from 'react-to-print';
import {useParams} from "next/navigation";

import PageHeader from '@/app/shared/page-header';
import PrintButton from '@/app/shared/print-button';
import InvoiceDetails from '@/app/shared/invoice/invoice-details';
import {Button} from 'rizzui';
import {PiDownloadSimpleBold} from 'react-icons/pi';
import {fetchDevisDetails} from "@/app/shared/custom-realsmile-components/liste/devis-list/devis-data";
import {routes} from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

const pageHeader = {
    title: 'Détail de devis',
    breadcrumb: [
        {
            href: routes.devis.list,
            name: 'Tous les devis',
        },
        {
            name: 'Détails',
        },
    ],
};

export default function InvoiceDetailsPage() {
    const {id} = useParams();
    const [devisDetailsData, setDevisDetailsData] = useState();
    const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
    const printRef = useRef(null);

    useEffect(() => {
    if (user && id) {
            const fetchData = async () => {
                const data: any = await fetchDevisDetails(id);
                setDevisDetailsData(data);
                setIsLoading(false);
            };
            fetchData();
        }
  }, [user, id]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        onBeforeGetContent: () => {
            if (!printRef.current) {
                console.error('No content to print');
                throw new Error('No content to print'); // Optionally, throw an error to stop the print process.
            }
        }
    });


    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="mt-4 flex items-center gap-3 @lg:mt-0">
                    {devisDetailsData && <PrintButton onClick={handlePrint}/>}
                    {/*<Button className="w-full @lg:w-auto">*/}
                    {/*    <PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]"/>*/}
                    {/*    Download*/}
                    {/*</Button>*/}
                </div>
            </PageHeader>
            {devisDetailsData && (
                <div ref={printRef}>
                    <InvoiceDetails data={devisDetailsData}/>
                </div>
            )
            }
        </>
    );
}
