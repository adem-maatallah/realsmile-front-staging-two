'use client';

import {useRouter} from 'next/navigation'; // Correct import of useRouter
import React, {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useParams, useSearchParams} from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import CaseFileListTable from '@/app/shared/custom-realsmile-components/liste/labo-list/file-list/table';
import CaseFileStats from '@/app/shared/custom-realsmile-components/liste/labo-list/file-list/file-stats';
import {fetchCaseFiles} from '@/app/shared/custom-realsmile-components/liste/labo-list/file-list/files-data';
import {routes} from '@/config/routes';
import {Button} from 'rizzui';
import Link from 'next/link';
import ModalButton from '@/app/shared/modal-button';
import IiwglModal from '@/app/shared/custom-realsmile-components/modals/IiwglModal';
import folderIcon from '@public/folder-icon.svg';
import docIcon from '@public/doc-icon.svg';
import { useAuth } from '@/context/AuthContext';

export default function PageLayout() {
    const pageHeader = {
        title: 'Case files',
        breadcrumb: [
            {
                name: 'List',
            },
        ],
    };
    const searchParams = useSearchParams();
    const {id}: any = useParams();

    const [stlFiles, setStlFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [pdfFile, setPdfFile] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [remainingTime, setRemainingTime] = useState({}); //[...stlFiles, ...imageFiles
    const [lateTime, setLateTime] = useState({}); //[...stlFiles, ...imageFiles
    const [isLate, setIsLate] = useState({}); //[...stlFiles, ...imageFiles
    const [isRequired, setIsRequired] = useState(false);
    const {user} = useAuth();
    const router = useRouter();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const caseFilesData = await fetchCaseFiles(id, user);

                const stls = caseFilesData.stls || [];
                const images = caseFilesData.images || [];

                const stlFiles = stls.map((file: any, index: number) => ({
                    id: `${id}_stl_${index}`,
                    file: {
                        name: file.file.name,
                        url: file.file.url,
                        avatar: folderIcon, // You can set the avatar here if needed
                    },
                    size: file.size,
                    type: file.type,
                    totalFiles: '50',
                    modified: file.modified,
                }));

                const imageFiles = images.map((file: any, index: number) => ({
                    id: `${id}_image_${index}`,
                    file: {
                        name: file.file.name,
                        avatar: docIcon, // You can set the avatar here if needed
                        url: file.file.url,
                    },
                    size: file.size,
                    type: file.type,
                    totalFiles: '50',
                    modified: file.modified,
                }));

                const pdfFile = caseFilesData.pdf || [];

                const fetchedData = {
                    stlFiles: stlFiles,
                    imageFiles: imageFiles,
                    isLate: caseFilesData.isLate,
                    pdfFile: pdfFile,
                    remainingTime: caseFilesData.remainingTime,
                    lateTime: caseFilesData.lateTime,
                    isRequired: caseFilesData.isRequired,
                };

                setStlFiles(fetchedData.stlFiles);
                setImageFiles(fetchedData.imageFiles);
                setPdfFile(fetchedData.pdfFile);
                setRemainingTime(fetchedData.remainingTime);
                setLateTime(fetchedData.lateTime);
                setIsLate(fetchedData.isLate);
                setIsRequired(fetchedData.isRequired);
                setIsLoading(false);
            } catch (error: any) {
                console.error('Error fetching case details:', error);
                setIsLoading(false);
                if (error.response) {
                    const {status} = error.response;
                    if (status == 404 || status == 400) {
                        window.location.replace('/not-found');
                        router.replace('/not-found');
                    } else if (status == 403) {
                        window.location.replace('/access-denied');
                        router.replace('/access-denied');
                    }
                } else {
                    window.location.replace('/access-denied');
                    router.replace('/access-denied');
                }
            }
        };
        if (user) fetchData();
    }, [user]);

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="flex">
                    <ModalButton
                        label="Add New SmileSet"
                        view={<IiwglModal caseId={id}/>}
                        customSize="600px"
                        className="mr-4"
                    />
                    <Link href={routes.laboratory.iiwgl(id)} passHref>
                        <Button>Go to SmileSets list</Button>
                    </Link>
                </div>
            </PageHeader>
            <CaseFileStats
                stsLen={stlFiles.length}
                imagesLen={imageFiles.length}
                lateTime={lateTime}
                remainingTime={remainingTime}
                isLate={isLate}
                isRequired={isRequired}
                isLoading={isLoading}
                className="mb-6 @5xl:mb-8 @7xl:mb-11"
            />
            <CaseFileListTable
                data={[...stlFiles, ...imageFiles,...pdfFile]}
                isLoading={isLoading}
            />
        </>
    );
}
