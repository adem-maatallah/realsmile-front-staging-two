import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Step,
  formDataAtom,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdvancedCheckbox,
  AdvancedRadio,
  CheckboxGroup,
  RadioGroup,
  Select,
  Text,
} from 'rizzui';
import { BiCheckCircle } from 'react-icons/bi';
import FormSummary from './form-summary';
import {
  FormStep5Schema,
  formStep5Schema,
} from '@/utils/validators/multistep-form.schema';
import { errorLoadingAtom } from '@/store/multistep-atom';
import cn from '@/utils/class-names';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

const options = {
  maxillaryOptions: [
    { label: 'Expansion', value: 'expansion' },
    { label: 'Si nécessaire', value: 'siNecessary' },
    { label: 'Non', value: 'non' },
  ],
  mandibularOptions: [
    { label: 'Expansion', value: 'expansion' },
    { label: 'Si nécessaire', value: 'siNecessary' },
    { label: 'Non', value: 'non' },
  ],
  posteriorOptions: [
    {
      label: 'Expansion de l’arcade Maxillaire seulement',
      value: 'maxillaryExpansion',
    },
    {
      label:
        'Expansion de l’arcade Maxillaire et contraction de l’arcade Mandibulaire',
      value: 'maxillaryAndMandibularContraction',
    },
  ],
  correctionAreasSupraclusion: [
    {
      label: 'Ingression des secteurs antérieurs',
      value: 'anteriorIngression',
    },
    {
      label: 'Egression des secteurs Postérieurs',
      value: 'posteriorEgression',
    },
    {
      label: 'Rampes occlusales rétro-incisives',
      value: 'retroIncisiveOcclusalRamps',
    },
  ],
  correctionAreasBeance: [
    {
      label: 'Ingression des secteurs postérieurs',
      value: 'posteriorIngression',
    },
    { label: 'Egression des secteurs antérieurs', value: 'anteriorEgression' },
    {
      label: 'Elastiques verticaux latéraux et/ou antérieurs',
      value: 'verticalElastics',
    },
  ],
};

export default function StepFive() {
  const { step, gotoStep } = useStepperOne();
  const [formData, setFormData] = useAtom(formDataAtom);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<FormStep5Schema>({
    resolver: zodResolver(formStep5Schema),
    defaultValues: formData, // Directly using formData ensures synchronization
    mode: 'onChange', // Validates the form on change
  });
  console.log('initial form data : ', formData);
  const [errorLoading, setErrorLoading] = useAtom(errorLoadingAtom);
  const { user } = useAuth();
  const getLabelFromValue = (value, options) => {
    const option = options.find((option) => option.value === value);
    return option ? option.label : '';
  };

  useEffect(() => {
    setErrorLoading((prev) => ({ ...prev, isValid }));
  }, [isValid, setErrorLoading]);

  const sensTransversal = watch('sensTransversal');
  const actionAnomalieVertical = watch('actionAnomalieVertical');
  const actionAnomaliePosterior = watch('actionAnomaliePosterior');

  // Reset fields based on the selection of 'sensTransversal'
  useEffect(() => {
    if (sensTransversal !== 'endoalveolie') {
      setValue('optionsMaxillaires', null);
      setValue('optionsMandibulaires', null);
    }
  }, [sensTransversal, setValue]);

  // Reset fields based on the selection of 'actionAnomaliePosterior'
  useEffect(() => {
    if (actionAnomaliePosterior !== 'correct') {
      setValue('posteriorOption', null);
    }
  }, [actionAnomaliePosterior, setValue]);

  // Reset fields based on the selection of 'actionAnomalieVertical'
  useEffect(() => {
    if (actionAnomalieVertical !== 'correct') {
      setValue('zoneCorrectionSupraclusion', []);
      setValue('zoneCorrectionBeance', []);
    }
  }, [actionAnomalieVertical, setValue]);

  const saveData = async (data: FormStep5Schema) => {
    setErrorLoading((prev) => ({ ...prev, isLoading: true }));
    const updatedData = {
      form_data: { ...data },
      caseId: formData.caseId,
    };

    try {
      const response = await axiosInstance.post(
        `/cases/step56`,
        JSON.stringify(updatedData),
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
          ...responseData.updatedCaseData,
        }));
        setErrorLoading({ isLoading: false, error: '', isValid: true });
        gotoStep(Step.StepSix);
      } else {
        setErrorLoading({
          isLoading: false,
          error: responseData.message || 'Failed to update case data',
          isValid: false,
        });
        throw new Error(responseData.message || 'Failed to update case data');
      }
    } catch (error) {
      setErrorLoading({
        isLoading: false,
        error: error.message,
        isValid: false,
      });
      console.error('Failed to save Step 5 data:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    await toast.promise(saveData(data), {
      loading: 'Enregistrement des données...',
      success: 'Les données ont été enregistrées avec succès',
      error: (err) => `${err.toString()}`,
    });
  };

  return (
    <form
      id={`rhf-${step.toString()}`}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        'col-span-full grid gap-6 rounded-lg bg-white p-5 shadow-lg',
        '@5xl:col-span-7 dark:bg-gray-800'
      )}
    >
      <FormSummary
        title="Choix du plan de traitement"
        description="Veuillez sélectionner les options appropriées pour continuer."
      />

      {/* Sélection des arcades */}
      <div>
        <h4>1. Sélection des arcades</h4>
        <Controller
          name="selectionArcades"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <RadioGroup
              value={value}
              setValue={onChange}
              className="grid gap-2"
            >
              <AdvancedRadio value="both">
                {value === 'both' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Les deux arcades</Text>
              </AdvancedRadio>
              <AdvancedRadio value="maxillaire">
                {value === 'maxillaire' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Arcade Maxillaire</Text>
              </AdvancedRadio>
              <AdvancedRadio value="mandibulaire">
                {value === 'mandibulaire' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Arcade Mandibulaire</Text>
              </AdvancedRadio>
            </RadioGroup>
          )}
        />
      </div>

      <div>
        <h4>2. Sens Transversal</h4>
        <Controller
          name="sensTransversal"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <RadioGroup
              value={value}
              setValue={onChange}
              className="grid gap-2"
            >
              <AdvancedRadio value="pasAnomalie">
                {value === 'pasAnomalie' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Pas d’anomalie du sens Transversal</Text>
              </AdvancedRadio>
              <AdvancedRadio value="endoalveolie">
                {value === 'endoalveolie' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Endoalvéolie</Text>
                {value === 'endoalveolie' && (
                  <>
                    <Controller
                      name="optionsMaxillaires"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          {...field}
                          label="Arcade Maxillaire"
                          options={options.maxillaryOptions}
                          value={
                            field.value
                              ? options.maxillaryOptions.find(
                                  (o) => o.label === field.value
                                )
                              : ''
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption.label)
                          }
                          error={error?.message}
                        />
                      )}
                    />
                    <Controller
                      name="optionsMandibulaires"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          {...field}
                          label="Arcade Mandibulaire"
                          options={options.mandibularOptions}
                          value={
                            field.value
                              ? options.mandibularOptions.find(
                                  (o) => o.label === field.value
                                )
                              : ''
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption.label)
                          }
                          error={error?.message}
                        />
                      )}
                    />
                  </>
                )}
              </AdvancedRadio>
              <AdvancedRadio value="inversionPostérieure">
                {value === 'inversionPostérieure' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Inversé d'articulé Postérieur</Text>
                {value === 'inversionPostérieure' && (
                  <>
                    <Controller
                      name="actionAnomaliePosterior"
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <RadioGroup
                          value={value}
                          setValue={onChange}
                          className="grid gap-2"
                        >
                          <AdvancedRadio value="maintain">
                            {value === 'maintain' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Maintenir</Text>
                          </AdvancedRadio>
                          <AdvancedRadio value="correct">
                            {value === 'correct' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Corriger</Text>
                          </AdvancedRadio>
                        </RadioGroup>
                      )}
                    />
                    <Controller
                      name="posteriorOption"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          {...field}
                          label="Correction par"
                          options={options.posteriorOptions}
                          value={getLabelFromValue(
                            field.value,
                            options.posteriorOptions
                          )}
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption.value)
                          }
                          error={error?.message}
                          disabled={actionAnomaliePosterior !== 'correct'}
                        />
                      )}
                    />
                  </>
                )}
              </AdvancedRadio>
            </RadioGroup>
          )}
        />
      </div>

      <div>
        <h4>3. Sens Vertical</h4>
        <Controller
          name="sensVertical"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <RadioGroup
              value={value}
              setValue={onChange}
              className="grid gap-2"
            >
              <AdvancedRadio value="pasAnomalie">
                {value === 'pasAnomalie' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Pas d’anomalie du sens Vertical</Text>
              </AdvancedRadio>
              <AdvancedRadio value="supraclusion">
                {value === 'supraclusion' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Supraclusion</Text>
                {value === 'supraclusion' && (
                  <>
                    <Controller
                      name="actionAnomalieVertical"
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <RadioGroup
                          value={value}
                          setValue={onChange}
                          className="grid gap-2"
                        >
                          <AdvancedRadio value="maintain">
                            {value === 'maintain' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Maintenir</Text>
                          </AdvancedRadio>
                          <AdvancedRadio value="correct">
                            {value === 'correct' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Corriger</Text>
                          </AdvancedRadio>
                        </RadioGroup>
                      )}
                    />
                    {actionAnomalieVertical === 'correct' && (
                      <div>
                        <h4>Zone de correction pour Supraclusion</h4>
                        <Controller
                          control={control}
                          name="zoneCorrectionSupraclusion"
                          render={({ field: { value, onChange } }) => (
                            <CheckboxGroup
                              values={value}
                              setValues={(newValue) =>
                                setValue('zoneCorrectionSupraclusion', newValue)
                              }
                              className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                            >
                              {options.correctionAreasSupraclusion.map(
                                (option) => (
                                  <AdvancedCheckbox
                                    key={option.value}
                                    value={option.value}
                                    checked={value.includes(option.value)}
                                    onChange={(e) => {
                                      const newValue = e.target.checked
                                        ? [...value, option.value]
                                        : value.filter(
                                            (v) => v !== option.value
                                          );
                                      onChange(newValue);
                                    }}
                                  >
                                    <span className="flex justify-between">
                                      <Text as="b">{option.label}</Text>
                                      {value.includes(option.value) && (
                                        <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                                      )}
                                    </span>
                                  </AdvancedCheckbox>
                                )
                              )}
                            </CheckboxGroup>
                          )}
                        />
                      </div>
                    )}
                  </>
                )}
              </AdvancedRadio>
              <AdvancedRadio value="beance">
                {value === 'beance' && (
                  <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                )}
                <Text as="b">Béance</Text>
                {value === 'beance' && (
                  <>
                    <Controller
                      name="actionAnomalieVertical"
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <RadioGroup
                          value={value}
                          setValue={onChange}
                          className="grid gap-2"
                        >
                          <AdvancedRadio value="maintain">
                            {value === 'maintain' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Maintenir</Text>
                          </AdvancedRadio>
                          <AdvancedRadio value="correct">
                            {value === 'correct' && (
                              <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                            )}
                            <Text as="b">Corriger</Text>
                          </AdvancedRadio>
                        </RadioGroup>
                      )}
                    />
                    {actionAnomalieVertical === 'correct' && (
                      <div>
                        <h4>Zone de correction pour Béance</h4>
                        <Controller
                          control={control}
                          name="zoneCorrectionBeance"
                          render={({ field: { value, onChange } }) => (
                            <CheckboxGroup
                              values={value}
                              setValues={(newValue) =>
                                setValue('zoneCorrectionBeance', newValue)
                              }
                              className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                            >
                              {options.correctionAreasBeance.map((option) => (
                                <AdvancedCheckbox
                                  key={option.value}
                                  value={option.value}
                                  checked={value.includes(option.value)}
                                  onChange={(e) => {
                                    const newValue = e.target.checked
                                      ? [...value, option.value]
                                      : value.filter((v) => v !== option.value);
                                    onChange(newValue);
                                  }}
                                >
                                  <span className="flex justify-between">
                                    <Text as="b">{option.label}</Text>
                                    {value.includes(option.value) && (
                                      <BiCheckCircle className="icon h-5 w-5 text-secondary" />
                                    )}
                                  </span>
                                </AdvancedCheckbox>
                              ))}
                            </CheckboxGroup>
                          )}
                        />
                      </div>
                    )}
                  </>
                )}
              </AdvancedRadio>
            </RadioGroup>
          )}
        />
      </div>
    </form>
  );
}
