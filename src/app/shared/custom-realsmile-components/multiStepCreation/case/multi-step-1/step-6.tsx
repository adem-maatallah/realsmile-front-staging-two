import { useAtom } from 'jotai';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import {
  AdvancedCheckbox,
  AdvancedRadio,
  CheckboxGroup,
  RadioGroup,
  Textarea,
  Text,
  cn,
  Select,
  Input,
} from 'rizzui';
import FormSummary from './form-summary';
import {
  FormStep6Schema,
  formStep6Schema,
} from '@/utils/validators/multistep-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Step,
  formDataAtom,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import { BiCheckCircle } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { errorLoadingAtom } from '@/store/multistep-atom';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

const ddmOptions = {
  encroachment: [
    { label: 'Oui', value: 'oui' },
    { label: 'Non', value: 'non' },
  ],
  expansionOptions: [
    { label: 'Oui', value: 'oui' },
    { label: 'Si nécessaire', value: 'siNecessary' },
    { label: 'Non', value: 'non' },
  ],
  ripOptions: [
    { label: 'Oui', value: 'oui' },
    { label: 'Si nécessaire', value: 'siNecessary' },
    { label: 'Non', value: 'non' },
  ],
  diastemas: [
    { label: 'Fermer', value: 'fermer' },
    { label: 'Maintenir', value: 'maintenir' },
  ],
  espaceResiduel: [
    { label: 'Fermer', value: 'fermer' },
    { label: 'Maintenir', value: 'maintenir' },
    { label: 'Ouvrir et préparer pour un implant/prothèse', value: 'ouvrir' },
  ],
};

const sagittalCorrectionOptions = [
  { label: 'Maintenir le Rapport A.P.', value: 'maintenirRapportAP' },
  { label: 'Correction de la CL II', value: 'CLII' },
  { label: 'Correction de la CL III', value: 'CLIII' },
];

const overjetOptions = [
  {
    label: "J'évaluerai le surplomb après réalisation des autres objectifs",
    value: 'evaluerSurplomb',
  },
  { label: 'Maintenir', value: 'Maintenir' },
  {
    label: 'Améliorer le surplomb avec du stripping',
    value: 'améliorerStripping',
  },
];

const correctionOptions = [
  { label: 'Élastiques de CLIII', value: 'elasticsCIII' },
  {
    label: 'Stripping postérieur à l’arcade mandibulaire',
    value: 'strippingMandibulaire',
  },
  {
    label: 'Distalisation Séquentielle à l’arcade mandibulaire',
    value: 'distalisationMandibulaire',
  },
  {
    label: 'Chirurgie orthognathique',
    value: 'chirurgieOrthognathique',
  },
  {
    label: 'Extractions : dents à extraire',
    value: 'extractions',
  },
];

export default function StepSix() {
  const { step, gotoStep } = useStepperOne();
  const [formData, setFormData] = useAtom(formDataAtom);
  const { control, handleSubmit, resetField, watch } = useForm<FormStep6Schema>(
    {
      resolver: zodResolver(formStep6Schema),
      defaultValues: formData,
      mode: 'onChange',
    }
  );

  const [, setErrorLoading] = useAtom(errorLoadingAtom);
  const { user } = useAuth();

  const sagittalCorrection = watch('sagittalCorrection');
  const correctionOptionsCI2 = watch('correctionOptionsCI2');
  const correctionOptionsCI3 = watch('correctionOptionsCI3');

  const enableExtractionTextAreaCI2 =
    correctionOptionsCI2?.includes('extractions');
  const enableExtractionTextAreaCI3 =
    correctionOptionsCI3?.includes('extractions');

  const residualSpaceManagement = watch('residualSpaceManagement');

  useEffect(() => {
    if (sagittalCorrection !== 'CLII') {
      resetField('correctionOptionsCI2');
      resetField('teethToExtractCL2');
    }
    if (sagittalCorrection !== 'CLIII') {
      resetField('correctionOptionsCI3');
      resetField('teethToExtractCL3');
    }
    if (residualSpaceManagement !== 'ouvrir') {
      resetField('teethToReplace');
    }
  }, [sagittalCorrection, residualSpaceManagement, resetField]);

  const saveData = async (data: FormStep6Schema) => {
    setErrorLoading((prev: any) => ({ ...prev, isLoading: true }));
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

      const responseData: any = await response.data;

      if (response) {
        setFormData((prev) => ({ ...prev, ...responseData.updatedCaseData }));
        setErrorLoading({ isLoading: false, error: '', isValid: true });
        gotoStep(Step.StepSeven);
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
      console.error('Failed to save Step 6 data:', error);
      throw error;
    }
  };

  const onSubmit: SubmitHandler<FormStep6Schema> = async (data) => {
    await toast.promise(saveData(data), {
      loading: 'Enregistrement des données...',
      success: 'Les données ont été enregistrées avec succès',
      error: (err) => `${err.toString()}`,
    });
  };

  return (
    <>
      <form
        id={`rhf-${step.toString()}`}
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          'col-span-full grid gap-6 rounded-lg bg-white p-5 shadow-lg',
          '@5xl:col-span-7 dark:bg-gray-800',
          'mb-20'
        )}
      >
        <FormSummary
          title="4. Sens Sagittal"
          description="Évaluez les relations sagittales et le surplomb pour corriger toute disharmonie dentaire."
        />

        {/* Canine and molar selection for right and left */}
        <article>
          <h4 className="text-xl font-semibold">
            a) Rapport antéro-postérieur (classe d'angle)
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                side: 'Left',
                canineLabel: 'CL canine gauche',
                molarLabel: 'CL molaire gauche',
              },
              {
                side: 'Right',
                canineLabel: 'CL canine droite',
                molarLabel: 'CL molaire droite',
              },
            ].map(({ side, canineLabel, molarLabel }) => (
              <div key={side}>
                <Controller
                  name={`canine${side}`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { label: 'CL I', value: 'CLI' },
                        { label: 'CL II', value: 'CLII' },
                        { label: 'CL III', value: 'CLIII' },
                      ]}
                      label={canineLabel}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption.value)
                      }
                    />
                  )}
                />
                <Controller
                  name={`molar${side}`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { label: 'CL I', value: 'CLI' },
                        { label: 'CL II', value: 'CLII' },
                        { label: 'CL III', value: 'CLIII' },
                      ]}
                      label={molarLabel}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption.value)
                      }
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </article>

        {/* Sagittal correction using AdvancedRadio */}
        <div>
          <h3 className="font-semibold">Correction :</h3>
          <Controller
            name="sagittalCorrection"
            control={control}
            render={({ field: { value, onChange } }) => (
              <RadioGroup
                value={value}
                setValue={onChange}
                className="col-span-full grid gap-4 @4xl:gap-6"
              >
                {sagittalCorrectionOptions.map((option) => (
                  <AdvancedRadio
                    inputClassName="[&:checked~span_.icon]:block"
                    key={option.value}
                    value={option.value}
                  >
                    <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                    <Text>{option.label}</Text>
                  </AdvancedRadio>
                ))}
              </RadioGroup>
            )}
          />
          {sagittalCorrection === 'CLII' && (
            <>
              <h4>Correction CL II par :</h4>
              <Controller
                name="correctionOptionsCI2"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    values={field.value || []}
                    setValues={field.onChange}
                    className="grid grid-cols-1 gap-4"
                  >
                    {[
                      { label: 'Élastiques de CL II', value: 'elasticsCII' },
                      {
                        label: 'Stripping postérieur au Maxillaire',
                        value: 'strippingMaxillaire',
                      },
                      {
                        label: 'Distalisation Séquentielle au Maxillaire',
                        value: 'distalisationMaxillaire',
                      },
                      {
                        label: 'Chirurgie orthognathique',
                        value: 'chirurgieOrthognathique',
                      },
                      {
                        label: 'Extractions : dents à extraire',
                        value: 'extractions',
                      },
                    ].map((option) => (
                      <AdvancedCheckbox
                        key={option.value}
                        value={option.value}
                        inputClassName="[&:checked~span_.icon]:block"
                      >
                        <span className="flex justify-between">
                          <Text>{option.label}</Text>
                          <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                        </span>
                      </AdvancedCheckbox>
                    ))}
                  </CheckboxGroup>
                )}
              />
              <Controller
                name="teethToExtractCL2"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Specifier les dents â extraire"
                    disabled={!enableExtractionTextAreaCI2}
                  />
                )}
              />
            </>
          )}
          {sagittalCorrection === 'CLIII' && (
            <>
              <h4>Correction CL III par :</h4>
              <Controller
                name="correctionOptionsCI3"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    values={field.value || []}
                    setValues={field.onChange}
                    className="grid grid-cols-1 gap-4"
                  >
                    {correctionOptions.map((option) => (
                      <AdvancedCheckbox
                        key={option.value}
                        value={option.value}
                        inputClassName="[&:checked~span_.icon]:block"
                      >
                        <span className="flex justify-between">
                          <Text>{option.label}</Text>
                          <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                        </span>
                      </AdvancedCheckbox>
                    ))}
                  </CheckboxGroup>
                )}
              />
              <Controller
                name="teethToExtractCL3"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Specifier les dents â extraire"
                    disabled={!enableExtractionTextAreaCI3}
                  />
                )}
              />
            </>
          )}
        </div>

        {/* overjet evaluation using AdvancedRadio */}
        <article>
          <h4 className="text-xl font-semibold">b) Surplomb</h4>
          <Controller
            name="overjet"
            control={control}
            render={({ field: { value, onChange } }) => (
              <RadioGroup
                value={value}
                setValue={onChange}
                className="col-span-full grid gap-4 @4xl:gap-6"
              >
                {overjetOptions.map((option) => (
                  <AdvancedRadio
                    inputClassName="[&:checked~span_.icon]:block"
                    key={option.value}
                    value={option.value}
                  >
                    <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                    <Text>{option.label}</Text>
                  </AdvancedRadio>
                ))}
              </RadioGroup>
            )}
          />
        </article>

        {/* Section 5: Disharmonie Dentro-Maxillaire (DDM) */}
        <h3 className="font-semibold">
          5. Disharmonie Dentro-Maxillaire (DDM)
        </h3>
        <div>
          <h4 className="mb-2 text-lg font-semibold">
            a) Encombrement et création de l'espace:
          </h4>
          <Controller
            name="encroachmentMaxillary"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={ddmOptions.encroachment}
                value={
                  ddmOptions.encroachment.find((o) => o.value === field.value)
                    ?.label || ''
                }
                onChange={(selectedOption) =>
                  field.onChange(selectedOption.value)
                }
                label="Encombrement arcade maxillaire"
              />
            )}
          />
          <Controller
            name="encroachmentMandibular"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={ddmOptions.encroachment}
                label="Encombrement arcade mandibulaire"
                value={
                  field.value
                    ? ddmOptions.encroachment.find(
                        (o) => o.label === field.value
                      )
                    : ''
                }
                onChange={(selectedOption) =>
                  field.onChange(selectedOption.label)
                }
              />
            )}
          />

          <h3 className="mb-2 mt-2">Création d'espace par :</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-md font-semibold">
                1. Expansion transversale:
              </h5>
              <Controller
                name="transversalExpansionMaxillary"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={ddmOptions.expansionOptions}
                    value={
                      ddmOptions.expansionOptions.find(
                        (o) => o.value === field.value
                      )?.label || ''
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption.value)
                    }
                    label="Arcade maxillaire"
                  />
                )}
              />
              <Controller
                name="transversalExpansionMandibular"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={
                      ddmOptions.expansionOptions.find(
                        (o) => o.value === field.value
                      )?.label || ''
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption.value)
                    }
                    options={ddmOptions.expansionOptions}
                    label="Arcade mandibulaire"
                  />
                )}
              />
            </div>
            <div>
              <h5 className="text-md font-semibold">
                2. Expansion sagittale (Vestibulo-version):
              </h5>
              <Controller
                name="sagittalExpansionMaxillary"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={ddmOptions.expansionOptions}
                    label="Arcade maxillaire"
                    value={
                      ddmOptions.expansionOptions.find(
                        (o) => o.value === field.value
                      )?.label || ''
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption.value)
                    }
                  />
                )}
              />
              <Controller
                name="sagittalExpansionMandibular"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={ddmOptions.expansionOptions}
                    value={
                      ddmOptions.expansionOptions.find(
                        (o) => o.value === field.value
                      )?.label || ''
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption.value)
                    }
                    label="Arcade mandibulaire"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <h5 className="text-md font-semibold">
              3. Réduction amélaire inter-proximale (RIP ou stripping):
            </h5>
            <Controller
              name="interproximalReductionMaxillary"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ddmOptions.ripOptions}
                  label="Arcade maxillaire"
                  value={
                    field.value
                      ? ddmOptions.ripOptions.find(
                          (o) => o.label === field.value
                        )
                      : ''
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption.label)
                  }
                />
              )}
            />
            <Controller
              name="interproximalReductionMandibular"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ddmOptions.ripOptions}
                  label="Arcade mandibulaire"
                  value={
                    ddmOptions.ripOptions.find((o) => o.value === field.value)
                      ?.label || ''
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption.value)
                  }
                />
              )}
            />
          </div>

          <div>
            <h5 className="text-md font-semibold">b) Espacement:</h5>
            <Controller
              name="diastemaManagement"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ddmOptions.diastemas}
                  label="1. Diastèmes"
                  value={
                    ddmOptions.diastemas.find((o) => o.value === field.value)
                      ?.label || ''
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption.value)
                  }
                />
              )}
            />
            <Controller
              name="residualSpaceManagement"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ddmOptions.espaceResiduel}
                  label="Gestion de l'espace résiduel des dents absentes"
                  value={
                    ddmOptions.espaceResiduel.find(
                      (o) => o.value === field.value
                    )?.label || ''
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption.value)
                  }
                />
              )}
            />
            {residualSpaceManagement === 'ouvrir' && (
              <Controller
                name="teethToReplace"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Précisez les dents qui seront remplacées par un implant ou une prothèse."
                    disabled={residualSpaceManagement !== 'ouvrir'}
                  />
                )}
              />
            )}
          </div>
        </div>
      </form>
    </>
  );
}
