import PageHeader from '@/app/shared/page-header';
import {routes} from '@/config/routes';
import Link from 'next/link';
import {metaObject} from '@/config/site.config';
import CreateRenumere from "@/app/shared/custom-realsmile-components/cases/renumere/create-renumere";
import Advancement from "@/app/shared/custom-realsmile-components/cases/advancement/advancement-page";

export const metadata = {
    ...metaObject('Advancement'),
};

const pageHeader = {
    title: 'Avancement',
    breadcrumb: [
        {
            name: "Suivi de l'avancement",
        },
    ],
};



export default function CreateCategoryPage() {

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
            <Advancement/>
        </>
    );
}
