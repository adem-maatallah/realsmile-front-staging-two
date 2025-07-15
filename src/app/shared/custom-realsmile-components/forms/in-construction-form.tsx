'use client';

import {useState} from 'react';
import {useForm, Controller, SubmitHandler} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Input, Button, Title, ActionIcon} from 'rizzui';
import {PiXBold} from 'react-icons/pi';
import toast from 'react-hot-toast';
import {useModal} from '@/app/shared/modal-views/use-modal';
import ZipUploadZone from '@/app/shared/custom-realsmile-components/customDropZone/ZipUploadZone';
import axios from 'axios';
import {useSession} from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

const inputSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty'),
    zipFile: z.any(),
});

type FormInputType = z.infer<typeof inputSchema>;

interface CreateTemplateUploadFormProps {
    caseId: string;
}

const initialValues = {
    name: '',
    zipFile: null,
};

export default function CreateTemplateUploadForm({caseId}: CreateTemplateUploadFormProps) {
    const {closeModal} = useModal();
    const {user} = useAuth();
    const [isLoading, setLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: {errors},
        reset,
        getValues,
        setValue,
    } = useForm<FormInputType>({
        resolver: zodResolver(inputSchema),
        defaultValues: initialValues,
    });

    const onSubmit: SubmitHandler<FormInputType> = async (formData) => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const endpoint = `/laboratories/uploadTemplateZipFile`;
            const url = `${apiUrl}${endpoint}`;

            const postData = new FormData();
            postData.append('caseId', caseId);
            postData.append('name', formData.name);
            postData.append('zipFile', formData.zipFile);

            await axios.post(url, postData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            toast.success('Template uploaded successfully');
            reset(initialValues);
            closeModal();
        } catch (error: any) {
            toast.error(`${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="container max-w-full rounded-md p-6"
        >
            <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                    Upload Zip Files
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                    <PiXBold className="h-auto w-5"/>
                </ActionIcon>
            </div>

            <div className="mt-4 grid gap-6">
                <Controller
                    control={control}
                    name="zipFile"
                    render={({field: {value}}) => (
                        <ZipUploadZone
                            caseId={caseId}
                            className="col-span-full"
                            name="zipFile"
                            getValues={getValues}
                            setValue={setValue}
                        />
                    )}
                />
            </div>

        </form>
    );
}
