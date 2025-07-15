'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Button, Input, Text, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import PhoneNumber from '@/components/ui/phone-input';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

// a reusable form wrapper component
function HorizontalFormBlockWrapper({
  title,
  description,
  children,
  className,
  isModalView = true,
}: React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  isModalView?: boolean;
}>) {
  return (
    <div
      className={cn(
        className,
        isModalView ? '@5xl:grid @5xl:grid-cols-6' : ' '
      )}
    >
      {isModalView && (
        <div className="col-span-2 mb-6 pe-4 @5xl:mb-0">
          <Title as="h6" className="font-semibold">
            {title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">{description}</Text>
        </div>
      )}

      <div
        className={cn(
          'grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5',
          isModalView ? 'col-span-4' : ' '
        )}
      >
        {children}
      </div>
    </div>
  );
}

const userFormSchema = z.object({
  first_name: z.string().min(1, 'Nom est obligatoire'),
  last_name: z.string().min(1, 'Prénom est obligatoire'),
  user_name: z.string().min(1, "Nom d'utilisateur est obligatoire"),
  email: z.string().min(1, 'Email est obligatoire'),
  phone: z.string().min(1, 'Numéro de téléphone est obligatoire'),
  country: z.string().min(1, 'Pays est obligatoire'),
});

type UserFormInput = z.infer<typeof userFormSchema>;

// main user form component for editing user details
export default function EditUser({
  userform,
  isModalView = true,
}: {
  isModalView?: boolean;
  userform?: UserFormInput;
}) {
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { user } = useAuth();

  const onSubmit: SubmitHandler<UserFormInput> = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/users/` + user?.id,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        toast.success("L'utilisateur a été mis à jour avec succès");
        window.location.reload();
        closeModal(); // Close the modal after successful submission
      } else {
        toast.error("Échec de la mise à jour de l'utilisateur");
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Form<UserFormInput>
      validationSchema={userFormSchema}
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: userform,
      }}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      {({ register, control, getValues, setValue, formState: { errors } }) => (
        <>
          <div className="flex-grow pb-10">
            <div
              className={cn(
                'grid grid-cols-1 ',
                isModalView
                  ? 'grid grid-cols-1 gap-8 divide-y divide-dashed  divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
                  : 'gap-5'
              )}
            >
              <HorizontalFormBlockWrapper
                title={'Edit User'}
                description={'Edit user details from here'}
                isModalView={isModalView}
              >
                <Input
                  label="First Name"
                  placeholder="First Name"
                  {...register('first_name')}
                  error={errors.first_name?.message}
                />
                <Input
                  label="Last Name"
                  placeholder="Last Name"
                  {...register('last_name')}
                  error={errors.last_name?.message}
                />
                <Input
                  label="Username"
                  placeholder="Username"
                  {...register('user_name')}
                  error={errors.user_name?.message}
                />
                <Input
                  label="Email"
                  placeholder="Email"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <PhoneNumber
                  label="Numéro de téléphone"
                  placeholder="Numéro de téléphone"
                  rounded="pill"
                  className="[&>label>span]:font-medium"
                  country={'fr'}
                  value={getValues('phone')}
                  onChange={(val, countryData, event, formattedValue) =>
                    setValue('phone', formattedValue)
                  }
                />
                <label className="block">
                  <span className="rizzui-input-label mb-1.5 block text-sm font-medium">
                    Pays
                  </span>
                  <Controller
                    control={control}
                    name="country"
                    rounded="pill"
                    className="[&>label>span]:font-medium"
                    render={({ field }) => (
                      <CountrySelector
                        label="Pays"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        open={isOpen}
                        onToggle={() => setIsOpen(!isOpen)}
                        selectedValue={
                          COUNTRIES.find((c) => c.value === field.value) || {}
                        }
                      />
                    )}
                  />
                </label>
              </HorizontalFormBlockWrapper>
            </div>
          </div>

          <div
            className={cn(
              'sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
              isModalView ? '-mx-10 -mb-7 px-10 py-5' : 'py-1'
            )}
          >
            <Button
              variant="outline"
              className="w-full @xl:w-auto"
              onClick={closeModal}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full @xl:w-auto"
            >
              Modifier l'utilisateur
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
