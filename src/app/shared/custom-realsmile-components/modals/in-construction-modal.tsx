import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Input, Button, Title, ActionIcon} from 'rizzui';
import {PiXBold} from 'react-icons/pi';
import toast from 'react-hot-toast';
import {useModal} from '@/app/shared/modal-views/use-modal';
import {useSession} from 'next-auth/react';
import axios from 'axios';
import UploadZone from '@/components/ui/file-upload/upload-zone';
import PdfUploadZone from '@/app/shared/custom-realsmile-components/customDropZone/PdfUploadZone';
import ZipUploadZone from "@/app/shared/custom-realsmile-components/customDropZone/ZipUploadZone";
import { useAuth } from '@/context/AuthContext';

const inputSchema = z.object({
    singleInput: z.string().min(1, 'Link cannot be empty'),
    pdfFile: z.any(),
});

export default function InConstructionModal({caseId}: { caseId: string }) {
    const {closeModal} = useModal();
    const {user} = useAuth();
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        getValues,
        setValue,
    } = useForm({
        resolver: zodResolver(inputSchema),
    });

    const saveData = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `/laboratories/addIiwglLink`;
        const url = `${apiUrl}${endpoint}`;

        const postData = {
            caseId: caseId,
            iiwglLink: data.singleInput,
            pdfFile: data.pdfFile,
        };

        return axios.post(url, postData, {
            withCredentials: true, // Ensure cookies are sent with the request
        });
    };

    const onSubmit = async (data: any) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const endpoint = `/laboratories/addIiwglLink`;
            const url = `${apiUrl}${endpoint}`;

            const formData = new FormData();
            formData.append('caseId', caseId);
            formData.append('iiwglLink', data.singleInput);
            formData.append('pdf', data.pdfFile);
            console.log("data.pdf ", data.pdfFile);

            await axios.post(url, formData, {
                withCredentials: true, // Ensure cookies are sent with the request
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Data saved successfully');
            reset();
            closeModal();
            window.location.reload(); // Redirecting to the users page after successful activation
        } catch (error: any) {
            toast.error(`${error.response?.data?.message || error.message}`);
        }
    };

    console.log('errors :', errors);
    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="container p-6"
        >
            <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                    Upload files
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                    <PiXBold className="h-auto w-5"/>
                </ActionIcon>
            </div>


            <div className="mt-4">
                <div className="mb-4">
                    <label className="mb-1 block pb-2 text-sm font-medium">
                        PDF file
                    </label>
                    <ZipUploadZone
                        className="col-span-full"
                        name="diagramme_de_mouvement_recapitulatif_file"
                        getValues={getValues}
                        setValue={setValue}
                        caseId={caseId}
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
                <Button variant="outline" onClick={closeModal}>
                    Cancel
                </Button>
                <Button type="submit">Submit</Button>
            </div>
        </form>
    );
}
