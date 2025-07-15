'use client';

import { useEffect, useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import Select, { components } from 'react-select';
import { Button, Input, Text, Textarea, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { fetchDoctorsData } from './custom-realsmile-components/liste/doctors-list/doctors-data';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';

export const announcementFormSchema = z.object({
  title: z.string().min(1, { message: 'Titre est requis' }),
  description: z.string().min(1, { message: 'Description est requise' }),
  imageURL: z.string().optional(),
  doctors: z
    .array(z.string())
    .min(1, { message: 'Veuillez sélectionner au moins un médecin' }),
  country: z.string().optional(),
});

// generate form types from zod validation schema
export type AnnouncementFormInput = z.infer<typeof announcementFormSchema>;

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

const CountryOption = (props: any) => {
  return (
    <components.Option {...props}>
      <span className="flex items-center truncate">
        {props.data.value !== 'all' && (
          <Image
            alt={`${props.data.value}`}
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${props.data.value}.svg`}
            className={'mr-2 inline h-4 rounded-sm'}
            width={16}
            height={16}
          />
        )}
        {props.data.label}
      </span>
    </components.Option>
  );
};

const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <span className="flex items-center truncate">
        {props.data.value !== 'all' && (
          <Image
            alt={`${props.data.value}`}
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${props.data.value}.svg`}
            className={'mr-2 inline h-4 rounded-sm'}
            width={16}
            height={16}
          />
        )}
        {props.data.label}
      </span>
    </components.SingleValue>
  );
};

export default function CreateAnnouncement({
  isModalView = true,
}: {
  isModalView?: boolean;
}) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [reset, setReset] = useState<AnnouncementFormInput>({
    title: '',
    description: '',
    imageURL: '',
    doctors: [],
    country: 'all', // Set default country to 'all'
  });
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (user) {
        try {
          const data = await fetchDoctorsData(user, true);
          const formattedDoctors = data.map((doctor: any) => ({
            value: doctor.id,
            label: doctor.full_name,
            country: doctor.country, // Make sure country is included
          }));
          setDoctors(formattedDoctors);
          setFilteredDoctors(formattedDoctors); // Initialize with all doctors
        } catch (error) {
          console.error('Error fetching doctors:', error);
        } finally {
          setDoctorsLoading(false);
        }
      }
    };

    fetchDoctors();
  }, [user]);

  const handleCountryChange = (selectedCountry: string) => {
    let filtered;
    if (selectedCountry === 'all') {
      filtered = doctors;
    } else {
      filtered = doctors.filter((doctor) => doctor.country === selectedCountry);
    }

    const allOption = {
      value: 'all',
      label: `Tous les médecins de ${
        selectedCountry === 'all' ? 'tous les pays' : selectedCountry
      }`,
    };
    setFilteredDoctors([allOption, ...filtered]);
  };

  const sendNotification = async (data: any) => {
    setLoading(true);
    const requestData = {
      customerIds: data.doctors.includes('all')
        ? filteredDoctors
            .filter((doc) => doc.value !== 'all')
            .map((doc) => doc.value)
        : data.doctors,
      title: data.title,
      description: data.description,
      imageURL: data.imageURL,
    };

    try {
      const response = await axiosInstance.post(
        `/notifications/send-notifications`,
        JSON.stringify(requestData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        console.log('Notification sent successfully');
      } else {
        console.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
      setReset({
        title: '',
        description: '',
        imageURL: '',
        doctors: [],
        country: 'all',
      });
    }
  };

  const onSubmit: SubmitHandler<AnnouncementFormInput> = async (data) => {
    toast.promise(sendNotification(data), {
      loading: "En Cours d'envois",
      success: 'Envoyé avec succés',
      error: "Erreur Lors de l'envoie",
    });
  };

  return (
    <Form<AnnouncementFormInput>
      validationSchema={announcementFormSchema}
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{ mode: 'onChange' }}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      {({ register, control, getValues, setValue, formState: { errors } }) => (
        <>
          <div className="flex-grow pb-10">
            <div
              className={cn(
                'grid grid-cols-1',
                isModalView
                  ? 'grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
                  : 'gap-5'
              )}
            >
              <HorizontalFormBlockWrapper
                title={'Ajouter une nouvelle annonce :'}
                description={'Modifier les informations de votre annonce ici'}
                isModalView={isModalView}
              >
                <Input
                  label="Titre de l'annonce"
                  placeholder="titre de l'annonce"
                  {...register('title')}
                  error={errors.title?.message}
                />
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        value={value}
                        onChange={onChange}
                        label="Description"
                        className="min-h-[100px]"
                        labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                      />
                    )}
                  />
                </div>
              </HorizontalFormBlockWrapper>
              <HorizontalFormBlockWrapper
                title="URL de l'image miniature"
                description="Entrez l'URL de l'image de votre annonce"
                isModalView={isModalView}
              >
                <Input
                  label="URL de l'image"
                  placeholder="https://example.com/image.jpg"
                  {...register('imageURL')}
                  error={errors.imageURL?.message}
                />
              </HorizontalFormBlockWrapper>
              <HorizontalFormBlockWrapper
                title="Sélectionner un pays"
                description="Choisissez un pays pour filtrer les médecins"
                isModalView={isModalView}
              >
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="country"
                    defaultValue="all"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={[
                          { label: 'Tous les pays', value: 'all' },
                          { label: 'Tunisie', value: 'TN' },
                          { label: 'France', value: 'FR' },
                          { label: 'Maroc', value: 'MA' },
                          { value: 'BE', label: 'Belgique' },
                        ]}
                        components={{ SingleValue, Option: CountryOption }}
                        onChange={(selected) => {
                          onChange(selected.value);
                          handleCountryChange(selected.value);
                        }}
                        value={{
                          label: value === 'all' ? 'Tous les pays' : value,
                          value,
                        }}
                        placeholder="Sélectionner un pays"
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }} // Ensure the dropdown is above other elements
                      />
                    )}
                  />
                </div>
              </HorizontalFormBlockWrapper>
              <HorizontalFormBlockWrapper
                title="Sélectionner des médecins"
                description="Choisissez les médecins à qui envoyer l'annonce"
                isModalView={isModalView}
              >
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="doctors"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        isMulti
                        options={filteredDoctors}
                        isLoading={doctorsLoading}
                        components={{ Option: CountryOption }}
                        onChange={(selected) => {
                          const allDoctorsOptionSelected = selected.some(
                            (s) => s.value === 'all'
                          );
                          if (allDoctorsOptionSelected) {
                            onChange(
                              filteredDoctors
                                .filter((doc) => doc.value !== 'all')
                                .map((doc) => doc.value)
                            );
                          } else {
                            onChange(
                              selected ? selected.map((s) => s.value) : []
                            );
                          }
                        }}
                        value={filteredDoctors.filter((doc) =>
                          Array.isArray(value) ? value.includes(doc.value) : []
                        )}
                        placeholder="Sélectionner des médecins"
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }} // Ensure the dropdown is above other elements
                      />
                    )}
                  />
                  {errors.doctors && (
                    <Text className="mt-1 text-sm text-red-600">
                      {errors.doctors.message}
                    </Text>
                  )}
                </div>
              </HorizontalFormBlockWrapper>
            </div>
          </div>
          <div
            className={cn(
              'sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
              isModalView ? '-mx-10 -mb-7 px-10 py-5' : 'py-1'
            )}
          >
            <Button variant="outline" className="w-full @xl:w-auto">
              <Link href="/">Annuler</Link>
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full @xl:w-auto"
            >
              Créer l'annonce
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
