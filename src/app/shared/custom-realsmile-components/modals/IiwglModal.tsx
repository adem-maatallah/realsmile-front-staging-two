import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Title, ActionIcon, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import PdfUploadZone from '@/app/shared/custom-realsmile-components/customDropZone/PdfUploadZone';
import { SkeletonGeneral } from "@/components/ui/skeleton-general";

const inputSchema = z.object({
    singleInput: z.string().min(1, 'Link cannot be empty'),
    pdfFile: z.any(),
    packId: z.string().optional(),
    reduction: z.number().min(0).max(100).default(0), // percentage reduction
});

export default function IiwglModal({ caseId }: { caseId: string }) {
    const { closeModal } = useModal();
    const {user} = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        setValue,
        setError,
        clearErrors,
        watch,
        control,
    } = useForm({
        resolver: zodResolver(inputSchema),
        defaultValues: {
            singleInput: '',
            pdfFile: null,
            reduction: 0,
            packId: '', // Default value for packId, it will be updated after fetching packs
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [packs, setPacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const packId = watch('packId');
    const reduction = watch('reduction');

    useEffect(() => {
        if (user?.role === 'admin') {
            setIsAdmin(true);
        }

        async function fetchCaseDetails() {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const url = `${apiUrl}/cases/${caseId}`;

            if (!user) {
                toast.error('Le jeton d\'authentification est manquant');
                return;
            }

            try {
                const response = await axios.get(url, {
                    withCredentials: true
                });
                const caseDetails = response.data;
                return caseDetails.case_type;
            } catch (error) {
                console.error('Échec de la récupération des détails du cas:', error);
                toast.error('Erreur lors de la récupération des détails du cas');
                return null;
            }
        }

        async function fetchPacks(caseType: string) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const url = `${apiUrl}/packs`;
            console.log('caseType', caseType)
            if (!user) {
                toast.error('Le jeton d\'authentification est manquant');
                return;
            }

            try {
                const response = await axios.get(url, {
                    withCredentials: true
                });
                const fetchedPacks = response.data?.data || [];
                setPacks(fetchedPacks);

                if (fetchedPacks.length > 0) {
                    if (caseType === 'Rénumérisé') {
                        const finitionPack = fetchedPacks.find((pack: any) => pack.name === 'Finition');
                        if (finitionPack) {
                            console.log('finitionPack', finitionPack)
                            setValue('packId', finitionPack.id);
                        }
                    } else {
                        setValue('packId', fetchedPacks[0].id); // Set the default packId
                    }
                }
            } catch (error) {
                console.error('Échec de la récupération des packs:', error);
                toast.error('Erreur lors de la récupération des packs');
                setPacks([]);
            } finally {
                setIsLoading(false);
            }
        }

        if (isAdmin) {
            fetchCaseDetails().then(caseType => {
                if (caseType) {
                    fetchPacks(caseType);
                }
            });
        } else {
            setIsLoading(false);
        }
    }, [user, user?.role, isAdmin, setValue, caseId]);

    const validateReduction = (value: any) => {
        if (value < 0 || value > 100) {
            setError('reduction', {
                type: 'manual',
                message: `La réduction doit être entre 0 et 100`,
            });
        } else {
            clearErrors('reduction');
        }
    };

    useEffect(() => {
        validateReduction(reduction);
    }, [reduction]);

    const onSubmit = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = `${apiUrl}/laboratories/addIiwglLink`;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('caseId', caseId);
            formData.append('iiwglLink', data.singleInput);
            formData.append('pdf', data.pdfFile);

            if (isAdmin) {
                if (data.packId) {
                    formData.append('packId', data.packId);
                }
                if (data.reduction !== undefined) {
                    formData.append('reduction', data.reduction.toString());
                }
            }

            await toast.promise(
                axios.post(url, formData, {
                    withCredentials: true,
                }),
                {
                    loading: 'Saving data...',
                    success: 'Data saved successfully',
                    error: 'Error saving data',
                }
            );

            reset();
            closeModal();
            window.location.reload();
        } catch (error: any) {
            toast.error(`${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="container p-6"
        >
            <div className="flex items-center justify-between">
                {isLoading ? (
                    <SkeletonGeneral className="h-6 w-full" />
                ) : (
                    <Title as="h4" className="font-semibold">
                        Add a New SmileSet Link
                    </Title>
                )}
                <ActionIcon size="sm" variant="text" onClick={closeModal} disabled={isSubmitting}>
                    <PiXBold className="h-auto w-5" />
                </ActionIcon>
            </div>
            <div className="mt-4">
                {isLoading ? (
                    <>
                        <SkeletonGeneral className="h-6 w-full mt-2" />
                        <SkeletonGeneral className="h-6 w-full mt-4" />
                        <SkeletonGeneral className="h-6 w-full mt-4" />
                        <SkeletonGeneral className="h-6 w-full mt-4" />
                    </>
                ) : (
                    <>
                        <Input
                            className="mt-2 pb-2"
                            label="Link"
                            prefix="https://"
                            placeholder="Enter your SmileSet link here"
                            {...register('singleInput')}
                            error={errors.singleInput?.message as string | undefined}
                            disabled={isSubmitting}
                        />

                        {isAdmin && packs.length > 0 && (
                            <>
                                <div className="mt-4">
                                    <Text className="pb-5 text-sm">
                                        Choisissez un pack à attribuer à cet SmileSet, et soyez prudent car
                                        une fois accepté, vous ne pourrez pas revenir en arrière.
                                    </Text>
                                    <select
                                        {...register('packId')}
                                        className="form-select block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        aria-label="Sélectionner un pack"
                                        disabled={isSubmitting}
                                    >
                                        {packs.map((pack: any) => (
                                            <option key={pack.id} value={pack.id}>
                                                {pack.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-4 flex items-center space-x-2">
                                    <Controller
                                        name="reduction"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Réduction (%)"
                                                type="number"
                                                className="mt-2 w-full"
                                                placeholder="Entrer le pourcentage de réduction"
                                                error={errors.reduction?.message as string | undefined}
                                                disabled={isSubmitting}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value);
                                                    field.onChange(value);
                                                    validateReduction(value);
                                                }}
                                            />
                                        )}
                                    />
                                    <span className="mt-8">%</span>
                                </div>
                            </>
                        )}

                        <div className="mt-4">
                            <div className="mb-4">
                                <label className="mb-1 block pb-2 text-sm font-medium">
                                    PDF file
                                </label>
                                <PdfUploadZone
                                    className="col-span-full"
                                    name="diagramme_de_mouvement_recapitulatif_file"
                                    getValues={getValues}
                                    setValue={setValue}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-4">
                            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                Submit
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
}
