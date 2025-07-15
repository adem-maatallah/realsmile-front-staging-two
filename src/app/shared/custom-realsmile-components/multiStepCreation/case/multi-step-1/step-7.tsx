import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Textarea,
  Text,
  AdvancedRadio,
  RadioGroup,
  Select,
  cn,
  Input,
} from 'rizzui';
import FormSummary from './form-summary';
import { zodResolver } from '@hookform/resolvers/zod';
import { formDataAtom, useStepperOne } from '.';
import { useAtom } from 'jotai';
import { BiCheckCircle } from 'react-icons/bi';
import {
  FormStep7Schema,
  formStep7Schema,
} from '@/utils/validators/multistep-form.schema';
import { errorLoadingAtom } from '@/store/multistep-atom';
import toast from 'react-hot-toast';
import { Step } from '@/app/shared/multi-step/multi-step-1';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function StepSeven() {
  const { step, gotoNextStep, gotoStep } = useStepperOne();
  const [formData, setFormData] = useAtom(formDataAtom);
  const [errorLoading, setErrorLoading] = useAtom(errorLoadingAtom);
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    resetField,
  } = useForm({
    resolver: zodResolver(formStep7Schema),
    defaultValues: {
      interIncisivePosition: formData.interIncisivePosition || 'realiserAutres',
      moveSuperieur: formData.moveSuperieur || 'superieurDroite',
      moveInferieur: formData.moveInferieur || 'inferieurDroite',
      tacksNeeded: formData.tacksNeeded || 'placer',
      specificTeeth: formData.specificTeeth || '',
      generalInstructions: formData.generalInstructions || '',
    },
    mode: 'all',
  });

  const interIncisiveSelection = watch('interIncisivePosition');
  const tacksNeeded = watch('tacksNeeded');

  const interIncisiveOptions = [
    {
      value: 'realiserAutres',
      label: 'Réaliser les autres objectifs de traitement après j’èvaluerai',
    },
    { value: 'deplacerMilieu', label: 'Déplacer le milieu' },
  ];

  const moveOptions = [
    { value: 'superieurDroite', label: 'Vers la droite' },
    { value: 'superieurGauche', label: 'Vers la gauche' },
    { value: 'inferieurDroite', label: 'Vers la droite' },
    { value: 'inferieurGauche', label: 'Vers la gauche' },
  ];

  const tackOptions = [
    {
      value: 'placer',
      title: 'Placer des taquets si nécessaire',
    },
    {
      value: 'nePasPlacer',
      title: 'Ne pas placer des taquets sur les dents suivantes',
    },
  ];

  React.useEffect(() => {
    if (interIncisiveSelection !== 'deplacerMilieu') {
      resetField('moveSuperieur');
      resetField('moveInferieur');
    }
  }, [interIncisiveSelection, resetField]);

  const saveData = async (data: FormStep7Schema) => {
    setErrorLoading((prev: any) => ({ ...prev, isLoading: true }));
    const updatedData = {
      form_data: { ...data },
      caseId: formData.caseId, // Assuming caseId is stored in formData
    };

    try {
      const response = await axiosInstance.post(
        `/cases/step7`,
        JSON.stringify(updatedData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData: any = await response.data;

      if (response) {
        setFormData((prev) => ({
          ...prev,
          ...responseData.updatedCaseData, // Assuming response contains updated case data
        }));
        setErrorLoading({ isLoading: false, error: '', isValid: true });
        gotoStep(Step.StepEight);
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
      throw error; // Ensure this error is propagated up to be caught by toast.promise
    }
  };

  const onSubmit: SubmitHandler<FormStep7Schema> = async (data) => {
    await toast.promise(saveData(data), {
      loading: 'Enregistrement des données...',
      success: 'Les données ont été enregistrées avec succès',
      error: (err) => `${err.toString()}`, // Display the actual error message
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
        title="Évaluation des Milieux Inter-Incisifs et Taquets"
        description="Évaluez les milieux inter-incisifs et configurez les taquets selon les besoins."
      />

      <article>
        <h4 className="text-sm font-semibold @5xl:text-base">
          6. Milieux inter-incisifs
        </h4>
      </article>
      {/* Inter-Incisive Position Selection */}
      <Controller
        name="interIncisivePosition"
        control={control}
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            value={value}
            setValue={onChange}
            className="col-span-full grid gap-4"
          >
            {interIncisiveOptions.map((option) => (
              <AdvancedRadio
                inputClassName="[&:checked~span_.icon]:block"
                key={option.value}
                value={option.value}
              >
                <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                <Text as="b">{option.label}</Text>
              </AdvancedRadio>
            ))}
          </RadioGroup>
        )}
      />
      {/* Conditionally rendered move options */}
      {interIncisiveSelection === 'deplacerMilieu' && (
        <>
          <article>
            <h4 className="text-sm font-semibold">
              Déplacer le milieu supérieur
            </h4>
          </article>
          <Controller
            name="moveSuperieur"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={moveOptions.slice(0, 2)}
                label="Choix de déplacement"
                value={
                  field.value
                    ? moveOptions
                        .slice(0, 2)
                        .find((o) => o.label === field.value)
                    : ''
                }
                onChange={(selectedOption) =>
                  field.onChange(selectedOption.label)
                }
              />
            )}
          />
          <article>
            <h4 className="text-sm font-semibold">
              Déplacer le milieu inférieur
            </h4>
          </article>
          <Controller
            name="moveInferieur"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={moveOptions.slice(2, 4)}
                label="Choix de déplacement"
                value={
                  field.value
                    ? moveOptions
                        .slice(2, 4)
                        .find((o) => o.label === field.value)
                    : ''
                }
                onChange={(selectedOption) =>
                  field.onChange(selectedOption.label)
                }
              />
            )}
          />
        </>
      )}

      <article>
        <h4 className="text-sm font-semibold @5xl:text-base">7. Taquets</h4>
      </article>
      {/* Taquets Placement */}
      <Controller
        name="tacksNeeded"
        control={control}
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            value={value}
            setValue={onChange}
            className="col-span-full grid gap-4"
          >
            {tackOptions.map((option) => (
              <AdvancedRadio
                inputClassName="[&:checked~span_.icon]:block"
                key={option.value}
                value={option.value}
              >
                <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                <Text as="b">{option.title}</Text>
              </AdvancedRadio>
            ))}
          </RadioGroup>
        )}
      />
      {/* Conditional Textarea for specifying teeth if 'nePasPlacer' is selected */}
      {tacksNeeded === 'nePasPlacer' && (
        <>
          <article>
            <h4 className="text-sm font-semibold">Indiquez les dents</h4>
          </article>
          <Controller
            name="specificTeeth"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Indiquez les dents..." />
            )}
          />
        </>
      )}

      {/* General Instructions */}
      <article>
        <h4 className="text-sm font-semibold">8. Instructions générales</h4>
      </article>
      <Controller
        name="generalInstructions"
        control={control}
        render={({ field }) => (
          <Textarea {...field} placeholder="Tapez vos instructions ici..." />
        )}
      />
    </form>
  );
}
