import React, { useState } from 'react';
import { Button, Title, ActionIcon, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {useParams, useRouter} from 'next/navigation';

export default function CommandModal({ caseId }: any) {
    const { closeModal } = useModal();
    const {user} = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = `${apiUrl}/cases/command`;

        try {
            setIsLoading(true);
            const postData = { caseId: caseId };
            const response = await toast.promise(
                axios.post(url, postData, {
                    withCredentials: true
                }),
                {
                    loading: 'Traitement...',
                    success: 'Données enregistrées avec succès',
                    error: (error) => 'La sauvegarde des données a échoué.',
                }
            );
            closeModal();
            router.push(`/cases/${response.data.newCaseId}`); // Redirecting to the page with the new case ID
        } catch (error) {
            console.error(error);
            toast.error("Error saving data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="container p-6"
        >
            <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">Confirmer la Commande des aligneurs</Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                    <PiXBold className="h-auto w-5" />
                </ActionIcon>
            </div>
            <div className="mt-4">
                <Text className="text-sm pb-5">
                    Soyez extrêmement vigilant lors de votre sélection, car une fois que vous aurez<br />
                    accepté ce la commande, il vous sera impossible de revenir en arrière ou d'annuler votre décision.
                </Text>
            </div>

            {/*<Title as="h6" className="font-semibold pb-5">Vérifier le code otp</Title>*/}

            {/*<PinCode length={6} />*/}

            <div className="mt-4 flex items-center justify-end gap-4">
                <Button variant="outline" onClick={closeModal} disabled={isLoading}>Annuler</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Traitement...' : 'Valider'}
                </Button>
            </div>
        </form>
    );
}
