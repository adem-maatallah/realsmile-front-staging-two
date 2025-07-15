'use client'
import {useEffect, useState} from 'react';
import {routes} from '@/config/routes';
import {invoiceData} from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import {fetchCasesData} from "@/app/shared/custom-realsmile-components/liste/cases-list/case-data";
import CasesTable from "@/app/shared/custom-realsmile-components/liste/cases-list/table";
import { useAuth } from '@/context/AuthContext';
import IncompleteCasesTable from '@/app/shared/custom-realsmile-components/liste/incomplete-cases-list/table';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
    title: 'Liste des soumissions incompléte',
    breadcrumb: [

        {
            name: 'Tous les cas incompléte',
        },
    ],
};

export default function EnhancedTablePage() {

    const [casesData, setCasesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useAuth();
    const role = user?.role;
    const doctorId = role === 'doctor' ? user?.id : null;
    useEffect(() => {
        const fetchData = async () => {
            const data: any = await fetchCasesData(null,doctorId?.toString(),"incomplete",user);
            setCasesData(data);
            setIsLoading(false);
        };
        if(user)
        fetchData();
    }, [user]);

    return (
        <TableLayout
            title={pageHeader.title}
            breadcrumb={pageHeader.breadcrumb}
            data={invoiceData}
            fileName="cases_data"
            header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
        >
            <IncompleteCasesTable data={casesData} isLoading={isLoading}/>
        </TableLayout>
    );
}
