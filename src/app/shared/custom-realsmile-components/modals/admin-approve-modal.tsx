import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Title, ActionIcon, Text, Input } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { SkeletonGeneral } from '@/components/ui/skeleton-general';

const inputSchema = z.object({
  packId: z.string().optional(),
  reduction: z.number().min(0).max(100).default(0), // percentage reduction
});

export default function AdminApproveModal({
  linkId,
  caseType,
}: {
  linkId: string;
  caseType: string;
}) {
  const { closeModal } = useModal();
  const {user} = useAuth()
  const [packs, setPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      reduction: 0,
      packId: '', // Default value for packId, it will be updated after fetching packs
    },
  });

  const packId = watch('packId');
  const reduction = watch('reduction');

  useEffect(() => {
    async function fetchPacks() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/packs`;

      if (!user) {
        toast.error("Le jeton d'authentification est manquant");
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
            const finitionPack = fetchedPacks.find(
              (pack: any) => pack.name === 'Finition'
            );
            if (finitionPack) {
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

    fetchPacks();
  }, [user, setValue, caseType]);

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
    const url = `${apiUrl}/iiwgl/adminUpdateIIWGLLinkStatus`;

    try {
      setIsLoading(true);
      const postData = {
        linkId: linkId,
        status: 'accepted',
        packId: data.packId,
        reduction: data.reduction,
      };
      await toast.promise(
        axios.post(url, postData, {
          withCredentials: true
        }),
        {
          loading: 'Enregistrement des données...',
          success: 'Données enregistrées avec succès',
          error: (error) => `${error.response?.data?.message || error.message}`,
        }
      );
      reset();
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement des données");
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
        {isLoading ? (
          <SkeletonGeneral className="h-6 w-full" />
        ) : (
          <Title as="h4" className="font-semibold">
            Approuver le SmileSet
          </Title>
        )}
        <ActionIcon
          size="sm"
          variant="text"
          onClick={closeModal}
          disabled={isLoading}
        >
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <>
            <SkeletonGeneral className="mt-2 h-6 w-full" />
            <SkeletonGeneral className="mt-4 h-6 w-full" />
          </>
        ) : (
          <>
            <Text className="pb-5 text-sm">
              Choisissez un pack à attribuer à cet SmileSet, et soyez prudent
              car une fois accepté, vous ne pourrez pas revenir en arrière.
            </Text>
            <select
              {...register('packId')}
              className="form-select block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              aria-label="Sélectionner un pack"
              disabled={isLoading}
            >
              {packs.map((pack: any) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        {isLoading ? (
          <SkeletonGeneral className="h-6 w-full" />
        ) : (
          <Controller
            name="reduction"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Réduction"
                type="number"
                className="mt-2 w-full"
                placeholder="Entrer le pourcentage de la réduction"
                error={errors.reduction?.message}
                disabled={isLoading}
                defaultValue={0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(value);
                  validateReduction(value);
                }}
              />
            )}
          />
        )}
        {isLoading ? (
          <SkeletonGeneral className="mt-8 h-6 w-10" />
        ) : (
          <span className="mt-8">%</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={closeModal} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Approuver'}
        </Button>
      </div>
    </form>
  );
}
