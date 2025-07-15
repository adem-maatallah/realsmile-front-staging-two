import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Input, Button, Title, ActionIcon, Textarea} from 'rizzui';
import {PiXBold} from 'react-icons/pi';
import toast from 'react-hot-toast';
import {useModal} from '@/app/shared/modal-views/use-modal';
import {useSession} from 'next-auth/react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const inputSchema = z.object({
    noteInput: z.string().optional(),
});

export default function RefuseModal({linkId}: { linkId: string }) {
    const {closeModal} = useModal();
    const {user} = useAuth();
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm({
        resolver: zodResolver(inputSchema),
    });

    const saveData = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let apiDist = '';
        if (user.role === 'admin') {
            apiDist = 'adminUpdateIIWGLLinkStatus';
        }
        if (user.role === 'doctor') {
            apiDist = 'doctorUpdateIIWGLLinkStatus';

        }
        const endpoint = `/iiwgl/${apiDist}`;
        const url = `${apiUrl}${endpoint}`;

        const postData = {
            linkId,
            status : 'rejected',
            note: data.noteInput,
        };

        try {
            const response = await axios.post(url, postData, {
                withCredentials: true, // Ensure cookies are sent with the request
            });
            return response.data; // Return data if needed
        } catch (error) {
            throw error; // Rethrow error to be caught by the toast
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await toast.promise(saveData(data), {
                loading: 'Enregistrement des données ...',
                success: 'Données enregistrées avec succès',
                error: (error) => {
                    return `${error.response?.data?.message || error.message}`;
                },
            });
            reset();
            closeModal();
            window.location.reload(); // Redirecting to the users page after successful activation

        } catch (error) {
            // Handle error if needed
            console.error(error);
            toast.error(
                "Une erreur s'est produite lors de l'enregistrement des données"
            );
        }
    };

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="container p-6"
        >
            <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                    Ajouter votre raison
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                    <PiXBold className="h-auto w-5"/>
                </ActionIcon>
            </div>
            <Textarea
                className="mt-2"
                label="Note"
                placeholder="Votre raison de refus"
                {...register('noteInput')}
                error={errors.noteInput?.message as string | undefined}
                defaultValue={''}
            />

            <div className="mt-4 flex items-center justify-end gap-4">
                <Button variant="outline" onClick={closeModal}>
                    Annuler
                </Button>
                <Button type="submit">Valider</Button>
            </div>
        </form>
    );
}
