import PageHeader from '@/app/shared/page-header';
import {routes} from '@/config/routes';
import Link from 'next/link';
import {metaObject} from '@/config/site.config';
import CreateRenumere from "@/app/shared/custom-realsmile-components/cases/renumere/create-renumere";
import CreateRetainingGutters
    from "@/app/shared/custom-realsmile-components/retaining-gutters/create-retaining-gutters";

export const metadata = {
    ...metaObject('Création du gouttières de  contentions'),
};

const pageHeader = {
    title: 'Création du gouttières de  contentions',
    breadcrumb: [
        {
            name: 'Gouttières de  contentions',
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
            <CreateRetainingGutters/>
        </>
    );
}
