'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { Button, Input, Text, Title, RadioGroup, AdvancedRadio } from 'rizzui';
import cn from '@/utils/class-names';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import StlUploadZone from '@/app/shared/custom-realsmile-components/customDropZone/StlUploadZone';
import toast from 'react-hot-toast';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { DatePicker } from '@/components/ui/datepicker';
import StatusField from '@/components/controlled-table/status-field';
import UserIcon from '@/components/custom-icons/user-icon';
import { BiCheckCircle } from 'react-icons/bi';
import { routes } from '@/config/routes';

// Messages for validation
const messages = {
  stlRequired: 'Tous les fichiers STL sont requis',
};

// Define the form schema for Step 1 and Step 2 combined
const formSchema = z.object({
  firstName: z.string().min(1, 'Prénom est requis'),
  lastName: z.string().min(1, 'Nom de famille est requis'),
  dateDeNaissance: z.date({ required_error: 'Date de naissance est requise' }),
  sexe: z.string().min(1, 'Sélection du sexe est requis'),
  stls: z
    .array(z.any())
    .length(1, 'Un fichier STL est requis')
    .refine((stls) => true, {
      message: 'Validation error message',
      path: [],
    }),
});
export type FormSchema = z.infer<typeof formSchema>;

type FormDataType = {
  firstName: string;
  lastName: string;
  dateDeNaissance: Date;
  sexe: string;
  stls: string[];
};

const initialFormData: FormDataType = {
  firstName: '',
  lastName: '',
  dateDeNaissance: new Date(),
  sexe: '',
  stls: ['', ''],
};

// A reusable form wrapper component
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
          'grid grid-cols-1 gap-3 @lg:gap-4 @2xl:gap-5',
          isModalView ? 'col-span-4' : ' '
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Main form component for creating and updating entries
export default function CreateRetainingGutters({
  isModalView = true,
}: {
  isModalView?: boolean;
}) {
  const [isLoading, setLoading] = useState(false);
  const {user} = useAuth()
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });
  console.log('get values', getValues('stls'));

  // Watch form values and log them
  const formValues = useWatch({ control });
  useEffect(() => {
    console.log('Form values:', formValues);
  }, [formValues]);

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('dateDeNaissance', data.dateDeNaissance.toISOString());
    formData.append('sexe', data.sexe);
    // Append STL files
    data.stls.forEach((stl: any) => {
      if (stl) {
        formData.append('stls', stl); // Use the correct field name 'stls'
      }
    });

    console.log('Form data before submission:', data);

    if (!user) {
      console.log('User is not authenticated');
      toast.error('Authentication token is missing');
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/retainingGutters/create`;

    console.log('url :', url);

    await toast
      .promise(
        axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, // Ensure cookies are sent with the request
        }),
        {
          loading: 'Soumission du formulaire en cours...',
          success: 'La goutiére de contention a été ajoutée avec succès !',
          error: 'Erreur lors du traitement.',
        },
        {
          success: {
            duration: 5000,
            icon: '✅',
          },
          error: {
            duration: 5000,
            icon: '❌',
          },
        }
      )
      .then(() => {
        setValue('stls', ['', '']);
        router.push('/retaining-gutters');
      })
      .catch((error) => {
        console.error('Submission error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [selection, setSelection] = useState<'select' | 'create'>('create');
  const [showForm, setShowForm] = useState(false);
  const [allPatients, setAllPatients] = useState<
    {
      value: string;
      label: string;
      dateOfBirth: string;
      gender: string;
    }[]
  >([]);

  const fetchAllPatients = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(`${apiUrl}/patients`, {
        withCredentials: true
      });

      const patients = data.data.patients.map((item: any) => ({
        value: item.id,
        label: item.patient.name,
        dateOfBirth: item.patient.dateOfBirth,
        gender: item.patient.gender,
      }));

      setAllPatients(patients);
    } catch (error) {
      console.error('Error fetching all patients:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  const filterPatients = useCallback(
    (inputValue: string) => {
      return allPatients.filter((patient) =>
        patient.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    },
    [allPatients]
  );

  const loadOptions = useCallback(
    (
      inputValue: string,
      callback: (options: { value: string; label: string }[]) => void
    ) => {
      setTimeout(() => {
        callback(filterPatients(inputValue));
      }, 1000);
    },
    [filterPatients]
  );

  const handlePatientChange = useCallback(
    (selectedOption: { value: string; label: string } | null) => {
      if (selectedOption) {
        const patient = allPatients.find(
          (p) => p.value === selectedOption.value
        );
        if (patient) {
          setValue('firstName', patient.label.split(' ')[0]);
          setValue('lastName', patient.label.split(' ')[1]);
          setValue('dateDeNaissance', new Date(patient.dateOfBirth));
          setValue('sexe', patient.gender);
          trigger(); // Trigger validation to ensure the form is valid
        }
      } else {
        // Handle clearing the select
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('dateDeNaissance', new Date());
        setValue('sexe', '');
        trigger(); // Trigger validation to ensure the form is valid
      }
    },
    [allPatients, setValue, trigger]
  );

  useEffect(() => {
    if (selection === 'select') {
      setShowForm(false);
    } else {
      setShowForm(true);
      // Clear the form fields when switching to 'create'
      setValue('firstName', '');
      setValue('lastName', '');
      setValue('dateDeNaissance', new Date());
      setValue('sexe', '');
      trigger(); // Trigger validation to ensure the form is valid
    }
  }, [selection, setValue, trigger]);

  const statusOptions = useMemo(
    () => [
      { value: 'Homme', label: 'Homme' },
      { value: 'Femme', label: 'Femme' },
    ],
    []
  );

  const radioOptions = useMemo(
    () => [
      {
        value: 'select',
        title: 'Sélectionner un de vos patients',
        description: 'Choisissez un patient existant dans votre liste.',
      },
      {
        value: 'create',
        title: 'Créer un nouveau patient',
        description: 'Ajoutez les détails pour créer un nouveau patient.',
      },
    ],
    []
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      ref={formRef}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      <div className="flex-grow pb-10">
        <div
          className={cn(
            'grid grid-cols-1',
            isModalView
              ? 'gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
              : 'gap-5'
          )}
        >
          <HorizontalFormBlockWrapper
            title={'Ajouter les informations du patient :'}
            description={'Ajouter les informations du patient ici'}
            isModalView={isModalView}
          >
            <RadioGroup
              value={selection}
              setValue={setSelection}
              className="mx-auto mb-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {radioOptions.map((item) => (
                <AdvancedRadio
                  key={item.value}
                  valueClassName="min-h-[120px] relative"
                  keyId={item.value}
                  inputId="group-selection"
                  value={item.value}
                  inputClassName="[&:checked~span_.icon]:block"
                >
                  <span className="flex justify-between">
                    <Text as="b">{item.title}</Text>
                    <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                  </span>
                  <Text>{item.description}</Text>
                </AdvancedRadio>
              ))}
            </RadioGroup>
            {selection === 'select' && (
              <div className="col-span-full">
                <label htmlFor="patient-select" className="form-label">
                  Rechercher et sélectionner un patient
                </label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions={allPatients}
                  onChange={handlePatientChange}
                  placeholder="Chercher un patient..."
                  noOptionsMessage={() => 'Aucun patient trouvé'}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
            )}
            {showForm && (
              <>
                <div className="mb-4">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Prénom"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire un prénom..."
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="mb-4">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Nom de famille"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire le nom de famille ..."
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
                <div className="mb-4">
                  <Controller
                    name="dateDeNaissance"
                    control={control}
                    rules={{ required: 'Date de naissance est requise' }}
                    render={({
                      field: { onChange, onBlur, value, ref },
                      fieldState: { error },
                    }) => (
                      <>
                        <label className="mb-2 block font-semibold text-gray-900">
                          Date de naissance
                        </label>
                        <DatePicker
                          maxDate={new Date()}
                          inputRef={ref}
                          onBlur={onBlur}
                          selected={value ? new Date(value) : null}
                          onChange={(date) => onChange(date)}
                          placeholderText="Ajouter une date de naissance"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={120}
                          dateFormat="dd/MM/yyyy"
                        />
                        {error && (
                          <div className="mt-2 text-sm text-red-500">
                            {error.message}
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="mb-4">
                  <Controller
                    name="sexe"
                    control={control}
                    rules={{ required: 'Sélection de sexe est requis' }}
                    render={({
                      field: { onChange, onBlur, value, ref },
                      fieldState: { error },
                    }) => (
                      <>
                        <label className="mb-2 block font-semibold text-gray-900">
                          Sexe
                        </label>
                        <StatusField
                          placeholder="Sélectionner le sexe du patient"
                          options={statusOptions}
                          value={value}
                          onChange={onChange}
                          getOptionValue={(option) => option.value}
                          className="w-full"
                        />
                        {error && (
                          <div className="mt-2 text-sm text-red-500">
                            {error.message}
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
              </>
            )}
          </HorizontalFormBlockWrapper>

          <HorizontalFormBlockWrapper
            title="Ajouter les fichiers STL :"
            description="Mettez à jour les fichiers STL du patient ici"
            isModalView={isModalView}
          >
            <div className="grid grid-cols-12 gap-4">
              {[
                { fileKey: 'stl_1', label: 'Empreinte maxillaire .stl' },
                { fileKey: 'stl_2', label: 'Empreinte mandibule .stl' },
              ].map((file, index) => (
                <div key={file.fileKey} className="col-span-6">
                  <StlUploadZone
                    label={file.label}
                    name={`stls[${index}]`}
                    getValues={getValues}
                    setValue={setValue}
                    error={errors.stls?.[index]?.message}
                  />
                </div>
              ))}
              <div className="col-span-12 mt-10 text-center">
                <p className="text-red-600">
                  Veuillez insérer seulement l’empreinte de l’arcade Concernée
                  par la contention
                </p>
              </div>
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
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full @xl:w-auto"
        >
          Ajouter La rénumeration
        </Button>
      </div>
    </form>
  );
}
