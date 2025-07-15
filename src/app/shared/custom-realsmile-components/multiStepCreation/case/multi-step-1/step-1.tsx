'use client';
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAtom } from 'jotai';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import FormSummary from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/form-summary';
import { Loader, Input, Text, RadioGroup, AdvancedRadio } from 'rizzui';
import {
  formDataAtom,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import {
  FormStep1Schema,
  formStep1Schema,
} from '@/utils/validators/multistep-form.schema';
import { DatePicker } from '@/components/ui/datepicker';
import StatusField from '@/components/controlled-table/status-field';
import toast from 'react-hot-toast';
import axios from 'axios';
import { errorLoadingAtom } from '@/store/multistep-atom';
import UserIcon from '@/components/custom-icons/user-icon';
import { useRouter } from 'next/navigation';
import { BiCheckCircle } from 'react-icons/bi';
import AsyncSelect from 'react-select/async';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

interface StepOneProps {
  CaseIDPassed?: string | null;
  doctorId?: string | null;
}

interface Patient {
  value: string;
  label: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
}

export default function StepOne({
  CaseIDPassed = null,
  doctorId = null,
}: StepOneProps) {
  const { step, gotoNextStep } = useStepperOne();
  const [formData, setFormData] = useAtom(formDataAtom);
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<FormStep1Schema>({
    resolver: zodResolver(formStep1Schema),
    defaultValues: {
      ...formData,
      caseId: CaseIDPassed ? CaseIDPassed : formData.caseId,
    },
    mode: 'onChange',
  });

  const [errorLoading, setErrorLoading] = useAtom(errorLoadingAtom);
  const [showForm, setShowForm] = useState(!!CaseIDPassed);
  const [selection, setSelection] = useState<'select' | 'create'>('create');
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setErrorLoading((prev) => ({
      ...prev,
      isValid,
    }));
  }, [isValid, setErrorLoading]);

  const fetchCaseInfo = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/cases/getStep1InfoByCaseId/${
      CaseIDPassed || formData.caseId
    }`;

    if (user) {
      toast.error('Authentication token is missing');
      return;
    }

    try {
      const response = await axiosInstance.get(`/cases/getStep1InfoByCaseId/${
      CaseIDPassed || formData.caseId
    }`)
      const data = response.data;
      console.log('Fetched case info:', data);
      const fieldsToUpdate = [
        { field: 'firstName', value: data.firstName },
        { field: 'lastName', value: data.lastName },
        { field: 'dateDeNaissance', value: new Date(data.dateOfBirth) },
        { field: 'sexe', value: data.gender },
      ];

      fieldsToUpdate.forEach((item) =>
        setValue(item.field, item.value, { shouldValidate: true })
      );

      setFormData((prev) => ({
        ...prev,
        ...fieldsToUpdate.reduce(
          (acc, item) => ({ ...acc, [item.field]: item.value }),
          {}
        ),
      }));
    } catch (error) {
      console.error('Failed to fetch case info:', error);
      toast.error('Error fetching case info');
      router.replace('/not-found');
    }
  }, [
    CaseIDPassed,
    user,
    setValue,
    formData.caseId,
    setFormData,
    router,
  ]);

  useEffect(() => {
    if (CaseIDPassed || formData.caseId) {
      fetchCaseInfo();
    }
  }, [CaseIDPassed, fetchCaseInfo]);

  const fetchAllPatients = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axiosInstance.get(
        `/patients?doctorId=${doctorId}`
      );

      const patients = data.data.patients.map((item: any) => ({
        value: item.id,
        label: item.patient.name,
        avatar: item.patient.avatar[0] || 'https://via.placeholder.com/150',
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

  const saveData = useCallback(
    async (data: FormStep1Schema) => {
      setErrorLoading((prev) => ({ ...prev, isLoading: true }));

      const updatedData = { ...data, doctorId: doctorId ?? undefined };

      try {
        const response = await axiosInstance.post(
          `/cases/step1`,
          updatedData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const responseData = await response.data;

        if (response) {
          setFormData((prev) => ({
            ...prev,
            caseId: responseData.id,
            personalizedPlan: responseData.personalizedPlan || 'self_managed',
            archSelection: responseData.archSelection,
            generalInstructions: responseData.generalInstructions,
            ...responseData.caseJsonData,
          }));

          setErrorLoading({ isLoading: false, error: '', isValid: true });
          toast.success('Les données ont été enregistrées avec succès');
          gotoNextStep();
        } else {
          // Check for specific error messages from the API
          const errorMessage = responseData.error || 'Failed to submit data';
          toast.error(errorMessage);
          setErrorLoading({
            isLoading: false,
            error: errorMessage,
            isValid: false,
          });
        }
      } catch (error) {
        console.error('Error submitting data:', error);
        toast.error(
          "Une erreur s'est produite lors de l'enregistrement des données"
        );
        setErrorLoading({
          isLoading: false,
          error: 'Failed to submit data',
          isValid: false,
        });
      }
    },
    [doctorId, user, setFormData, gotoNextStep, setErrorLoading]
  );

  const onSubmit: SubmitHandler<FormStep1Schema> = async (data) => {
    await saveData(data);
  };

  const statusOptions = useMemo(
    () => [
      { value: 'Homme', label: 'Homme' },
      { value: 'Femme', label: 'Femme' },
    ],
    []
  );

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
      }, 1000);
    },
    [filterPatients]
  );

  const handlePatientChange = useCallback(
    (selectedOption: Patient | null) => {
      if (selectedOption) {
        const patient = selectedOption;
        setValue('firstName', patient.label.split(' ')[0]);
        setValue('lastName', patient.label.split(' ')[1]);
        setValue('dateDeNaissance', new Date(patient.dateOfBirth));
        setValue('sexe', patient.gender);
        setFormData((prev) => ({
          ...prev,
          firstName: patient.label.split(' ')[0],
          lastName: patient.label.split(' ')[1],
          dateDeNaissance: new Date(patient.dateOfBirth),
          sexe: patient.gender,
        }));
        trigger(); // Trigger validation to ensure the form is valid
      } else {
        // Handle clearing the select
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('dateDeNaissance', null);
        setValue('sexe', '');
        setFormData((prev) => ({
          ...prev,
          firstName: '',
          lastName: '',
          dateDeNaissance: null,
          sexe: '',
        }));
        trigger(); // Trigger validation to ensure the form is valid
      }
    },
    [setValue, setFormData, trigger]
  );

  useEffect(() => {
    if (selection === 'select') {
      setShowForm(false);
    } else {
      setShowForm(true);
      // Clear the form fields when switching to 'create'
      setValue('firstName', '');
      setValue('lastName', '');
      setValue('dateDeNaissance', null);
      setValue('sexe', '');
      setFormData((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        dateDeNaissance: null,
        sexe: '',
      }));
      trigger(); // Trigger validation to ensure the form is valid
    }
  }, [selection, setValue, setFormData, trigger]);

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

  useEffect(() => {
    const handleFormSubmit = () => {
      formRef.current?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    };

    window.addEventListener('formSubmit', handleFormSubmit);

    return () => {
      window.removeEventListener('formSubmit', handleFormSubmit);
    };
  }, []);

  return (
    <>
      <FormSummary
        title="Informations pour le patient : Ajoutez les détails nécessaires pour le patient"
        description="Votre fiche patient est bien plus qu'une simple compilation de données - c'est un portrait de soins personnalisés en attente d'être conçu. Partager avec précision les détails requis nous aide à créer une fiche patient captivante."
        className="col-span-full pb-2 text-center @5xl:col-span-5"
      />

      <div className="col-span-full flex items-center justify-center @5xl:col-span-7">
        <div className="col-span-full grid flex-grow gap-6 rounded-lg bg-white p-5 shadow-lg @4xl:p-7 dark:bg-gray-0 lg:col-span-7">
          <form
            id={`rhf-${step.toString()}`}
            onSubmit={handleSubmit(onSubmit)}
            ref={formRef}
          >
            {!CaseIDPassed && (
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
            )}
            {selection === 'select' && !CaseIDPassed && (
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
            {(showForm || CaseIDPassed) && (
              <div className="-mx-2 flex flex-wrap">
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Prénom"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire un prénom..."
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="mb-4 w-full px-2 md:w-1/2">
                  <Input
                    prefix={<UserIcon className="w-5" />}
                    label="Nom de famille"
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire le nom de famille ..."
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
                <div className="mb-4 w-full px-2 md:w-1/2">
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
                <div className="mb-4 w-full px-2 md:w-1/2">
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
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
