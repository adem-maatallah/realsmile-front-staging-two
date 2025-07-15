'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  FileInput,
  Text,
  Loader,
  Input,
  RadioGroup,
  AdvancedRadio,
} from 'rizzui';
import { ImgComparisonSlider } from '@img-comparison-slider/react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncSelect from 'react-select/async';
import { DatePicker } from '@/components/ui/datepicker';
import StatusField from '@/components/controlled-table/status-field';
import UserIcon from '@/components/custom-icons/user-icon';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { BiCheckCircle } from 'react-icons/bi';

// Import your zod schema from StepOne
import {
  FormStep1Schema,
  formStep1Schema,
} from '@/utils/validators/multistep-form.schema';
import axiosInstance from '@/utils/axiosInstance';

interface Patient {
  value: string;
  label: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
}

type FormValues = FormStep1Schema; // Contains firstName, lastName, dateDeNaissance, sexe

export default function ProcessImage() {
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

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
      // ... any other fields from your schema
    },
    mode: 'onChange',
  });

  // ----- Radio selection state -----
  const [selection, setSelection] = useState<'select' | 'create'>('create');

  // ----- Patients (for select mode) -----
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ----- Image state -----
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Status options for sexe -----
  const statusOptions = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' },
  ];

  // ----- Fetch patients when in select mode -----
  const fetchAllPatients = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axiosInstance.get(`/patients`);

      const patients = data.data.patients.map((item: any) => ({
        value: item.id,
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
        setSelectedPatient(selectedOption);
        // Autofill form fields based on the selected patient:
        const names = selectedOption.label.split(' ');
        setValue('firstName', names[0] || '');
        setValue('lastName', names[1] || '');
        setValue('dateDeNaissance', new Date(selectedOption.dateOfBirth));
        setValue('sexe', selectedOption.gender);
        trigger();
      } else {
        setSelectedPatient(null);
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
      setPreviewImage(URL.createObjectURL(file));
      setProcessedImage(null);
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
    let caseId = '';

try {
  const formData = new FormData();
  formData.append('image', selectedImage);
  formData.append('case_id', caseId);

  const processResponse = await axiosInstance.post(
    '/step1-ai',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Authorization header if needed manually:
        // 'Authorization': `Bearer ${yourToken}`,
      },
      responseType: 'blob', // 👈 MUST be set to receive Blob
    }
  );

  const blob = processResponse.data; // 👈 Axios puts the blob in `.data`
  const processedImgUrl = URL.createObjectURL(blob);
  setProcessedImage(processedImgUrl);
  toast.success('Image traitée avec succès');

} catch (err: any) {
  console.error('Error:', err);
  setError(err.message || 'Une erreur est survenue');
  toast.error(err.message || 'Une erreur est survenue');
} finally {
  setIsLoading(false);
}


  return (
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
                description: 'Choisissez un patient existant dans votre liste.',
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

        {/* Before/After Comparison Slider */}
        {previewImage && processedImage && (
          <div className="mt-8">
            <Text className="mb-4 text-center text-xl font-semibold text-gray-700">
              Before / After Comparison
            </Text>
            <div className="flex justify-center">
              <ImgComparisonSlider className="w-full max-w-2xl overflow-hidden rounded-lg">
                <figure slot="first" className="relative">
                  <Image
                    src={previewImage}
                    alt="Before"
                    layout="responsive"
                    width={1200}
                    height={800}
                    className="rounded-lg object-cover"
                  />
                  <figcaption className="absolute left-2 top-2 rounded-md bg-gray-900 px-2 py-1 text-sm text-white">
                    Before
                  </figcaption>
                </figure>
                <figure slot="second" className="relative">
                  <Image
                    src={processedImage}
                    alt="After"
                    layout="responsive"
                    width={1200}
                    height={800}
                    className="rounded-lg object-cover"
                  />
                  <figcaption className="absolute right-2 top-2 rounded-md bg-gray-900 px-2 py-1 text-sm text-white">
                    After
                  </figcaption>
                </figure>
              </ImgComparisonSlider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
}