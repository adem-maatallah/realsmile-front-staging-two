import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Title, ActionIcon } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const inputSchema = z.object({
    noteInput: z.string().optional(),
});

export default function AdminExpideModal({ caseId, isLabo = false }: { caseId: string, isLabo?: boolean }) {
    const { closeModal } = useModal();
    const {user} = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(inputSchema),
    });
    const router = useRouter();

    const saveData = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `/cases/changeStatusToExpidie`;
        const url = `${apiUrl}${endpoint}`;

        const postData = {
            caseId: caseId,
            noteInput: data.noteInput,
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
            setIsLoading(true);
            await toast.promise(
                saveData(data),
                {
                    loading: 'Enregistrement des données ...',
                    success: 'Données enregistrées avec succès',
                    error: (error) => {
                        return `${error.response?.data?.message || error.message}`;
                    }
                }
            );
            reset();
            closeModal();

            // Role-based redirection
            if (user?.role === 'admin') {
                window.location.reload(); // Refresh the page for admin
            } else if (user?.role === 'hachem') {
                router.push('/cases/in-construction'); // Redirect to /cases/in-construction for hachem
            }
        } catch (error) {
            console.error(error);
            toast.error('Une erreur s\'est produite lors de l\'enregistrement des données');
        } finally {
            setIsLoading(false);
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
                    {isLabo ? 'Lire la note' : 'Changer vers expédié'}
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal} disabled={isLoading}>
                    <PiXBold className="h-auto w-5" />
                </ActionIcon>
            </div>
            <Input
                label="Url"
                prefix="https://"
                className="mt-2"
                placeholder={isLabo ? 'Lire la note' : 'Ajouter le lien de livraison ici ...'}
                {...register('noteInput')}
                error={errors.noteInput?.message as string | undefined}
                readOnly={isLabo} // Rend la zone de texte en lecture seule si isLabo est vrai
            />

            <div className="flex items-center justify-end gap-4 mt-4">
                <Button variant="outline" onClick={closeModal} disabled={isLoading}>
                    {isLabo ? 'Annuler' : 'Annuler'}
                </Button>

                {!isLabo && (
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Ajouter'}
                    </Button>
                )}
            </div>
        </form>
    );
}
