import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Title, ActionIcon, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { DatePicker } from '@/components/ui/datepicker';

const formSchema = z.object({
    treatmentDate: z.date({
        required_error: 'Date de traitement est obligatoire',
        invalid_type_error: 'Format de date invalide',
    }).nullable().refine(date => date !== null, {
        message: 'Date de traitement est obligatoire',
    }),
});

export default function ExpidieModal({ caseId, isLabo = false }: any) {
    const { closeModal } = useModal();
    const {user} = useAuth()
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            treatmentDate: new Date(), // Set default date to current date
        },
    });

    const saveData = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `/cases/updateIntreatment`;
        const url = `${apiUrl}${endpoint}`;

        const postData = {
            caseId: caseId,
            treatmentDate: data.treatmentDate,
        };

        try {
            const response = await axios.put(url, postData, {
                withCredentials: true, // Ensure cookies are sent with the request
            });
            return response.data; // Return data if needed
        } catch (error: any) {
            throw new Error(`Failed to save data: ${error.response?.data?.message || error.message}`);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true);
            await toast.promise(saveData(data), {
                loading: 'Enregistrement des données ...',
                success: 'Données enregistrées avec succès',
                error: "Une erreur s'est produite lors de l'enregistrement",
            });
            reset();
            closeModal();
            window.location.reload(); // Reload the page after successful data submission

        } catch (error) {
            console.error(error);
            toast.error("Une erreur s'est produite lors de l'enregistrement des données");
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
                    {isLabo ? 'Lire la note' : 'Changer vers en traitement'}
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal} disabled={isLoading}>
                    <PiXBold className="h-auto w-5" />
                </ActionIcon>
            </div>

            <div className="mt-4">
                <Text className="pb-5 text-sm">
                    Soyez extrêmement vigilant lors de votre sélection, car une fois que
                    vous aurez validé, il vous sera impossible de revenir en
                    arrière
                    ou d'annuler votre décision.
                </Text>
            </div>

            <div className="mb-4 w-full px-2">
                <Controller
                    control={control}
                    name="treatmentDate"
                    rules={{ required: 'Date de traitement est obligatoire' }}
                    render={({ field, fieldState }) => (
                        <>
                            <label className="mb-2 block font-semibold text-gray-900">
                                Date de début du traitement
                            </label>
                            <DatePicker
                                selected={field.value ? new Date(field.value) : new Date()}
                                onChange={(date) => field.onChange(date)}
                                placeholderText="Ajouter une date de début du traitement"
                                showYearDropdown
                                scrollableYearDropdown
                                className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                            />
                            {fieldState.error && (
                                <div className="mt-2 text-sm text-red-500">
                                    {fieldState.error.message}
                                </div>
                            )}
                        </>
                    )}
                />
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
                <Button variant="outline" onClick={closeModal} disabled={isLoading}>
                    {isLabo ? 'Annuler' : 'Annuler'}
                </Button>

                {!isLabo && (
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Valider'}
                    </Button>
                )}
            </div>
        </form>
    );
}
