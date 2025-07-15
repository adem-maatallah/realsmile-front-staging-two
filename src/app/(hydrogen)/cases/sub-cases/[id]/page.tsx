'use client';
import {useEffect, useState} from 'react';
import {routes} from '@/config/routes';
import {invoiceData} from '@/data/invoice-data';
import TableLayout from '@/app/(hydrogen)/tables/table-layout';
import {fetchCasesData, fetchSubCases} from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import CasesTable from '@/app/shared/custom-realsmile-components/liste/cases-list/table';
import {useSession} from 'next-auth/react';
import IncompleteCasesTable from '@/app/shared/custom-realsmile-components/liste/incomplete-cases-list/table';
import SmileSetCasesTable from '@/app/shared/custom-realsmile-components/liste/smileset-cases/table';
import NeedsApprovalCasesTable from '@/app/shared/custom-realsmile-components/liste/needs-approval-cases/table';
import DefaultCasesTable from "@/app/shared/custom-realsmile-components/liste/default-cases-list/table";
import {useParams} from "next/navigation";
import SubCasesTable from "@/app/shared/custom-realsmile-components/liste/sub-cases-list/table";
import { useAuth } from '@/context/AuthContext';

// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
    title: 'Liste des sous cas',
    breadcrumb: [
        {
            name: 'Tous les sous cas',
        },
    ],
};

export default function EnhancedTablePage() {
    const [casesData, setCasesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useAuth();
    const id = useParams()
    useEffect(() => {
        const fetchData = async () => {
            const data: any = await fetchSubCases(
                id.id,
                user
            );
            setCasesData(data);
            setIsLoading(false);
        };
        if (user) fetchData();
    }, [user]);

    return (
        <TableLayout
            title={pageHeader.title}
            breadcrumb={pageHeader.breadcrumb}
            data={invoiceData}
            fileName="cases_data"
            header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
        >
            <SubCasesTable data={casesData} isLoading={isLoading}/>
        </TableLayout>
    );
}
