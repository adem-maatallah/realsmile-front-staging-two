"use client"
import PageHeader from '@/app/shared/page-header';
import {routes} from '@/config/routes';
import Link from 'next/link';
import {metaObject} from '@/config/site.config';
import CreateRenumere from "@/app/shared/custom-realsmile-components/cases/renumere/create-renumere";
import {useParams} from "next/navigation";

// export const metadata = {
//     ...metaObject('Create a Category'),
// };

const pageHeader = {
    title: 'Rénumériser le cas',
    breadcrumb: [
        {
            name: 'Rénumériser le cas',
        },
    ],
};



export default function CreateCategoryPage() {
    const {id}: any = useParams();

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <Link
                    href={routes.eCommerce.categories}
                    className="mt-4 w-full @lg:mt-0 @lg:w-auto"
                >
                    {/*<Button as="span" className="w-full @lg:w-auto" variant="outline">*/}
                    {/*  Annuler*/}
                    {/*</Button>*/}
                </Link>
            </PageHeader>
            <CreateRenumere id={id}/>
        </>
    );
}
