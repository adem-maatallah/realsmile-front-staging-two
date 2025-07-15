'use client';

import { useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiDesktop } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Button, Password, Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import { ProfileHeader } from '@/app/shared/account-settings/profile-settings';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  passwordFormSchema,
  PasswordFormTypes,
} from '@/utils/validators/password-settings.schema';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

export default function PasswordSettingsView({
  settings,
}: {
  settings?: PasswordFormTypes;
}) {
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState({});
  const {user} = useAuth()

  const onSubmit: SubmitHandler<PasswordFormTypes> = async (data) => {
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        `/updateMyPassword`,
        JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.data;
      if (response) {
        console.log('Password settings data ->', data);
        setReset({
          currentPassword: '',
          newPassword: '',
          confirmedPassword: '',
        });
        toast.success('Mot de passe mis à jour avec succès.');
      } else {
        throw new Error(result.data || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(
        'Erreur lors de la mise à jour du mot de passe' || error.message
      );
    }

    setLoading(false);
  };

  return (
    <>
      <Form<PasswordFormTypes>
        validationSchema={passwordFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: {
            ...settings,
          },
        }}
      >
        {({ register, control, formState: { errors }, getValues }) => {
          return (
            <>
              <ProfileHeader
                title={
                  user?.user_name ||
                  user?.first_name + '_' + user?.last_name
                }
                description={user?.email}
                image={user?.profile_pic}
              />

              <div className="mx-auto w-full max-w-screen-2xl">
                <HorizontalFormBlockWrapper
                  title="Mot de passe actuel"
                  titleClassName="text-base font-medium"
                >
                  <Password
                    {...register('currentPassword')}
                    placeholder="Entrez votre mot de passe"
                    error={errors.currentPassword?.message}
                  />
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Nouveau mot de passe"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Entrez votre nouveau mot de passe"
                        helperText={
                          getValues().newPassword.length < 8 &&
                          'Votre mot de passe actuel doit contenir plus de 8 caractères'
                        }
                        onChange={onChange}
                        error={errors.newPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Confirmer le nouveau mot de passe"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="confirmedPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Confirmez votre nouveau mot de passe"
                        onChange={onChange}
                        error={errors.confirmedPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <div className="mt-6 flex w-auto items-center justify-end gap-3">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                  <Button type="submit" variant="solid" isLoading={isLoading}>
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </div>
            </>
          );
        }}
      </Form>
      {/* <LoggedDevices className="mt-10" /> */}
    </>
  );
}

// Appareils connectés
function LoggedDevices({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-screen-2xl', className)}>
      <div className="border-b border-dashed border-muted">
        <Title as="h2" className="mb-3 text-xl font-bold text-gray-900">
          Appareils sur lesquels vous êtes connecté
        </Title>
        <Text className="mb-6 text-sm text-gray-500">
          Nous vous alerterons via olivia@untitledui.com s'il y a une activité
          inhabituelle sur votre compte.
        </Text>
      </div>
      <div className="flex items-center gap-6 border-b border-dashed border-muted py-6">
        <PiDesktop className="h-7 w-7 text-gray-500" />
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Title
              as="h3"
              className="text-base font-medium text-gray-900 dark:text-gray-700"
            >
              MacBook Pro 15 pouces de 2018
            </Title>
            <Text
              as="span"
              className="relative hidden rounded-md border border-muted py-1.5 pe-2.5 ps-5 text-xs font-semibold text-gray-900 before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green sm:block"
            >
              Actif maintenant
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-sm text-gray-500">Melbourne, Australie</Text>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <Text className="text-sm text-gray-500">22 janvier à 16h20</Text>
          </div>
          <Text
            as="span"
            className="relative mt-2 inline-block rounded-md border border-muted py-1.5 pe-2.5 ps-5 text-xs font-semibold text-gray-900 before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green sm:hidden"
          >
            Actif maintenant
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-6 py-6">
        <PiDesktop className="h-7 w-7 text-gray-500" />
        <div>
          <Title
            as="h3"
            className="mb-2 text-base font-medium text-gray-900 dark:text-gray-700"
          >
            MacBook Air M1 de 2020
          </Title>
          <div className="flex items-center gap-2">
            <Text className="text-sm text-gray-500">Melbourne, Australie</Text>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <Text className="text-sm text-gray-500">22 janvier à 16h20</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
