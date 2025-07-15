'use client';
import React, { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { useParams } from 'next/navigation';
import { fetchLaboIIwglsData } from '@/app/shared/custom-realsmile-components/liste/labo-list/iiwgl-list/iiwgl-data';
import LaboIiwglTable from '@/app/shared/custom-realsmile-components/liste/labo-list/iiwgl-list/table';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { Button } from 'rizzui';
import ModalButton from '@/app/shared/modal-button';
import IiwglModal from '@/app/shared/custom-realsmile-components/modals/IiwglModal';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { userInfo } from 'os';

const pageHeader = {
    title: 'List of All SmileSets',
    breadcrumb: [
        {
            href: routes.eCommerce.dashboard,
            name: 'Dashboard',
        },
        {
            name: 'All SmileSets',
        },
    ],
};

export default function EnhancedTablePage() {
    const [iiwglData, setIiwglData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { id }: any = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchLaboIIwglsData(id);
                const formattedLinksData = data.data.links.map(
                    (link: {
                        adminId: any;
                        doctorId: any;
                        doctor_note: any;
                        admin_note: any;
                        url: any;
                        created_at: string | number | Date;
                        adminStatus: any;
                        doctorStatus: any;
                        id: any;
                    }) => ({
                        url: link.url,
                        createdAt: new Date(link.created_at), // Converting string date to Date object
                        adminStatus: link.adminStatus,
                        doctorStatus: link.doctorStatus,
                        id: link.id,
                        admin_note: link.admin_note,
                        doctor_note: link.doctor_note,
                        doctorId: link.doctorId ? link.doctorId : "null",
                        adminId: link.adminId ? link.adminId : "null",
                    })
                );
                setIiwglData(formattedLinksData);
            } catch (error: any) {
                console.error('Error fetching case details:', error);
                if (error.response) {
                    const { status } = error.response;
                    if (status === 404 || status === 400) {
                        router.replace('/not-found');
                    } else if (status === 403) {
                        router.replace('/access-denied');
                    }
                } else {
                    router.replace('/access-denied');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [user, id, router]);


    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="flex">
                    <ModalButton
                        label="Add New SmileSet"
                        view={<IiwglModal caseId={id} />}
                        customSize="600px"
                        className="mr-4"
                    />
                    <Link href={routes.laboratory.files(id)} passHref>
                        <Button className="mt-0">Aller à Fichier de cas</Button>
                    </Link>
                </div>
            </PageHeader>

            <LaboIiwglTable data={iiwglData} isLoading={isLoading} />
        </>
    );
}
