'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader,
  Input,
  Text,
  RadioGroup,
  AdvancedRadio,
  FileInput,
  Button,
  // You can import Modal from rizzui if available, or build your own.
} from 'rizzui';
import AsyncSelect from 'react-select/async';
import { DatePicker } from '@/components/ui/datepicker';
import StatusField from '@/components/controlled-table/status-field';
import FormSummary from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/form-summary';
import UserIcon from '@/components/custom-icons/user-icon';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { BiCheckCircle } from 'react-icons/bi';
import { ImgComparisonSlider } from '@img-comparison-slider/react';
import Image from 'next/image';

// Import your zod schema from StepOne
import {
  FormStep1Schema,
  formStep1Schema,
} from '@/utils/validators/multistep-form.schema';
import PageHeader from '@/app/shared/page-header';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

interface Patient {
  value: string;
  label: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
}

type FormValues = FormStep1Schema; // Contains firstName, lastName, dateDeNaissance, sexe

export default function FutureTreatmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const pageHeader = {
    title: 'RealSmile AI',
    breadcrumb: [
      {
        href: '/',
        name: 'Home',
      },
      {
        name: 'RealSmile AI',
      },
    ],
  };

  // ----- Guidelines Popup State -----
  const [showPopup, setShowPopup] = useState(true);

  // Hide popup if user clicks the close button
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formStep1Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateDeNaissance: null,
      sexe: '',
    },
    mode: 'onChange',
  });

  // ----- Radio selection state -----
  const [selection, setSelection] = useState<'select' | 'create'>('create');

  // ----- Patients (for select mode) -----
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  // ----- Image state -----
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Status options for sexe -----
  const statusOptions = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' },
  ];

  // ----- Fetch patients when in select mode -----
  const fetchAllPatients = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/patients`);

      const patients = data.data.patients.map((item: any) => ({
        value: item.id.toString(),
        label: item.patient.name,
        avatar: item.patient.avatar[0] || 'https://via.placeholder.com/150',
        dateOfBirth: item.patient.dateOfBirth,
        gender: item.patient.gender,
      }));

      setAllPatients(patients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      toast.error('Error fetching patients');
    }
  }, [user]);

  useEffect(() => {
    if (selection === 'select') {
      fetchAllPatients();
    }
  }, [selection, fetchAllPatients]);

  const filterPatients = useCallback(
    (inputValue: string) => {
      return allPatients.filter((patient) =>
        patient.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    },
    [allPatients]
  );

  const loadOptions = useCallback(
    (inputValue: string, callback: (options: Patient[]) => void) => {
      setTimeout(() => {
        callback(filterPatients(inputValue));
      }, 500);
    },
    [filterPatients]
  );

  const handlePatientChange = useCallback(
    (selectedOption: Patient | null) => {
      if (selectedOption) {
        // Autofill form fields based on the selected patient:
        const names = selectedOption.label.split(' ');
        setValue('firstName', names[0] || '');
        setValue('lastName', names[1] || '');
        setValue('dateDeNaissance', new Date(selectedOption.dateOfBirth));
        setValue('sexe', selectedOption.gender);
        trigger();
      } else {
        reset();
        trigger();
      }
    },
    [setValue, trigger, reset]
  );

  // ----- Handle image file selection -----
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setError(null);
    }
  };

  // ----- Submission handler -----
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!selectedImage) {
      toast.error('Veuillez télécharger une image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add image file to FormData
      formData.append('image', selectedImage);

      // Create a consistent payload structure
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateDeNaissance:
          data.dateDeNaissance instanceof Date
            ? data.dateDeNaissance.toISOString()
            : data.dateDeNaissance,
        sexe: data.sexe,
        doctorId: user?.id || 'unknown',
      };

      // Append each key-value pair to FormData
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });

      const processResponse = await axiosInstance.post(
        `/cases/step1-ai`,
        formData,

      );

      if (!processResponse) {
        throw new Error("Échec du traitement de l'image");
      }

      const responseData = await processResponse.data;
      const { caseId, message } = responseData;

      if (caseId) {
        toast.success(message || 'Image traitée avec succès');
        router.push(`/realsmile-ai/${caseId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Une erreur est survenue');
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Guidelines Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-11/12 max-w-md overflow-hidden rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Directives relatives aux images
            </h2>
            <Image
              src="/assets/guidelines.jpg"
              alt="Guidelines"
              width={500}
              height={300}
              className="mb-4 rounded"
            />
            <Text className="mb-4 text-gray-700">
              ✅ Bonne image :
              <br />
              Photo de portrait claire et nette
              <br />
              Une seule personne sur l'image
              <br />
              En regardant directement la caméra
              <br />
              Sourire avec des dents visibles
              <br />
              <br />
              ❌ Mauvaise image :
              <br />
              Photo floue ou peu claire
              <br />
              Ne pas faire face directement à la caméra
              <br />
              Plusieurs personnes sur l'image
              <br />
              Bouche fermée ou dents non visibles
            </Text>

            <Button onClick={handleClosePopup} className="w-full">
              Commencer
            </Button>
          </div>
        </div>
      )}

      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="col-span-full pb-2 text-center text-base @5xl:col-span-5">
        <article className="mt-4 @3xl:mt-9">
          <h1 className="text-xl @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl">
            Informations pour le patient : Ajoutez les détails nécessaires pour
            le patient
          </h1>
          <p className="mt-3 text-sm leading-relaxed @3xl:text-base">
            Votre fiche patient est bien plus qu'une simple compilation de
            données - c'est un portrait de soins personnalisés en attente d'être
            conçu. Partager avec précision les détails requis nous aide à créer
            une fiche patient captivante.
          </p>
        </article>
      </div>

      <div className="col-span-full flex items-center justify-center @5xl:col-span-7">
        <div className="col-span-full grid flex-grow gap-6 rounded-lg bg-white p-5 shadow-lg @4xl:p-7 dark:bg-gray-0 lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
            {/* Radio group for patient mode */}
            <RadioGroup
              value={selection}
              setValue={setSelection}
              className="mx-auto mb-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {[
                {
                  value: 'select',
                  title: 'Sélectionner un de vos patients',
                  description:
                    'Choisissez un patient existant dans votre liste.',
                },
                {
                  value: 'create',
                  title: 'Créer un nouveau patient',
                  description:
                    'Ajoutez les détails pour créer un nouveau patient.',
                },
              ].map((item) => (
                <AdvancedRadio
                  key={item.value}
                  valueClassName="min-h-[120px] relative"
                  keyId={item.value}
                  inputId={`radio-${item.value}`}
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

            {/* If "select" mode, show AsyncSelect */}
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

            {/* If "create" mode, show patient info form fields */}
            {selection === 'create' && (
              <div className="-mx-2 flex flex-wrap">
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Prénom"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire un prénom..."
                    {...register('firstName', { required: 'Prénom requis' })}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Nom de famille"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire le nom de famille..."
                    {...register('lastName', { required: 'Nom requis' })}
                    error={errors.lastName?.message}
                  />
                </div>
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Controller
                    name="dateDeNaissance"
                    control={control}
                    rules={{ required: 'Date de naissance est requise' }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <label className="mb-2 block font-semibold text-gray-900">
                          Date de naissance
                        </label>
                        <DatePicker
                          maxDate={new Date()}
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date)}
                          placeholderText="Ajouter une date de naissance"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={120}
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
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Controller
                    name="sexe"
                    control={control}
                    rules={{ required: 'Sélection de sexe est requis' }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <label className="mb-2 block font-semibold text-gray-900">
                          Sexe
                        </label>
                        <StatusField
                          placeholder="Sélectionner le sexe du patient"
                          options={statusOptions}
                          value={field.value}
                          onChange={field.onChange}
                          getOptionValue={(option: any) => option.value}
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
              </div>
            )}

            {/* Image upload field (common to both modes) */}
            <div className="mb-4 mt-4">
              <FileInput
                accept="image/*"
                onChange={handleImageChange}
                className="mb-6"
                label="Téléchargez l'image"
                inputClassName="border border-gray-300 rounded-lg p-2"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-indigo-600 py-3 text-white transition hover:bg-indigo-700"
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </form>

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 bg-opacity-75">
              <Loader size="md" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
