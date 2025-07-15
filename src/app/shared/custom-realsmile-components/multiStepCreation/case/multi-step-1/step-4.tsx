import { useAtom } from 'jotai';
import { useState } from 'react';
import {
  Step,
  formDataAtom,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import { AdvancedRadio, RadioGroup, Textarea } from 'rizzui';
import FormSummary from './form-summary';
import cn from '@/utils/class-names';
import { BiCheckCircle } from 'react-icons/bi';
import BrushSolidIcon from '@/components/icons/brush-solid';
import PencilIcon from '@/components/icons/pencil';
import ArrowBothDirectionIcon from '@/components/icons/arrow-both-direction';
import TrendingDownIcon from '@/components/icons/trending-down';
import TrendingUpIcon from '@/components/icons/trending-up';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { errorLoadingAtom } from '@/store/multistep-atom';
import axiosInstance from '@/utils/axiosInstance';

export default function StepFour() {
  const { step, gotoStep, gotoNextStep } = useStepperOne();
  const [formData, setFormData] = useAtom(formDataAtom);
  const [errorLoading, setErrorLoading] = useAtom(errorLoadingAtom);
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    personalizedPlan: formData.personalizedPlan || '',
    archSelection: formData.archSelection || '',
    generalInstructions: formData.generalInstructions || '',
  });

  const [errors, setErrors] = useState({
    personalizedPlan: '',
    archSelection: '',
    generalInstructions: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const validate = () => {
    let tempErrors = { ...errors };
    tempErrors.personalizedPlan = formValues.personalizedPlan
      ? ''
      : 'Veuillez sélectionner un plan';

    if (formValues.personalizedPlan === 'personalized') {
      tempErrors.archSelection = formValues.archSelection
        ? ''
        : 'La sélection des arcades est requise pour un plan personnalisé';
      tempErrors.generalInstructions = formValues.generalInstructions
        ? ''
        : 'Instructions générales sont requises pour un plan personnalisé';
    } else {
      tempErrors.archSelection = '';
      tempErrors.generalInstructions = '';
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const saveData = async (data) => {
    setErrorLoading((prev) => ({ ...prev, isLoading: true }));
    const updatedData = {
      form_data: { ...data },
      caseId: formData.caseId,
    };

    try {
      const response = await axiosInstance.post(
        `/cases/create-case`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response) {
        throw new Error('Network response was not ok');
      }

      const responseData: any = await response.data;
      const updatedCaseData = responseData.data;

      setFormData((prev) => ({
        ...updatedCaseData,
        ...prev,
        ...responseData.updatedCaseData,
      }));
      console.log('updated form data : ', formData);
      setErrorLoading({ isLoading: false, error: '', isValid: true });
      gotoStep(Step.StepSix);
    } catch (error) {
      setErrorLoading({
        isLoading: false,
        error: error.message || 'Failed to update case data',
        isValid: false,
      });
      console.error('Failed to save Step 5 data:', error);
      throw error; // This will ensure the error is passed to the toast handler.
    }
  };

  const handleOtherPlan = async (data) => {
    const response = await axiosInstance.post(
      `/cases/step4`,
      JSON.stringify({ ...data, caseId: formData.caseId }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const responseData: any = await response.data;
    const updatedCaseData = responseData.data;

    setFormData((prev) => ({
      ...updatedCaseData,
      ...prev,
      ...data,
      caseId: responseData.case, // Assuming responseData contains caseId
    }));
    if (response) gotoNextStep();
    else
      throw new Error(
        "Une erreur s'est produite lors de l'enregistrement des données"
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formValues.personalizedPlan === 'self_managed' || validate()) {
      try {
        if (formValues.personalizedPlan === 'personalized') {
          await toast.promise(saveData(formValues), {
            loading: 'Enregistrement des données...',
            success: 'Les données ont été enregistrées avec succès',
            error:
              "Une erreur s'est produite lors de l'enregistrement des données",
          });
          gotoStep(Step.StepEight);
        } else {
          await toast.promise(handleOtherPlan(formValues), {
            loading: 'Enregistrement des données...',
            success: 'Les données ont été enregistrées avec succès',
            error:
              "Une erreur s'est produite lors de l'enregistrement des données",
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const advancedRadioClassNames = cn(
    '[&_.rizzui-advanced-radio]:flex [&_.rizzui-advanced-radio]:justify-between [&_.rizzui-advanced-radio]:gap-7 [&_.rizzui-advanced-radio]:px-6 [&_.rizzui-advanced-radio]:py-6'
  );

  const advancedRadioInputClassNames = cn(
    '[&~span]:border-0 [&~span]:ring-1 [&~span]:ring-gray-200 [&~span:hover]:ring-primary [&:checked~span:hover]:ring-primary [&:checked~span]:border-1 [&:checked~.rizzui-advanced-radio]:ring-2 [&~span_.icon]:opacity-0 [&:checked~span_.icon]:opacity-100'
  );

  return (
    <form
      id={`rhf-${step.toString()}`}
      onSubmit={handleSubmit}
      className={cn(
        'col-span-full grid gap-6 rounded-lg bg-white p-5 shadow-lg',
        '@5xl:col-span-7 dark:bg-gray-800'
      )}
    >
      <FormSummary
        title="Choix du dossier clinique"
        description="Souhaitez-vous prendre en charge l’élaboration de votre plan de traitement, ou préférez-vous que cela soit géré par notre équipe d’Orthodontistes ?"
        className="col-span-full mb-6 justify-center text-center @5xl:col-span-5"
      />
      <div>
        <RadioGroup
          value={formValues.personalizedPlan}
          setValue={(value) =>
            handleInputChange({ target: { name: 'personalizedPlan', value } })
          }
          className="col-span-full grid gap-4 @4xl:gap-6"
        >
          <AdvancedRadio
            key="self_managed"
            value="self_managed"
            className={advancedRadioClassNames}
            inputClassName={advancedRadioInputClassNames}
          >
            <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
            <article>
              <h4 className="text-sm font-semibold @5xl:text-base">
                Je remplis le dossier clinique
              </h4>
              <p>Je prèpare mon plan de traitement moi-même</p>
            </article>
            <span className="h-8 min-w-[32px] [&_svg]:w-8">
              <PencilIcon />
            </span>
          </AdvancedRadio>
          <AdvancedRadio
            key="personalized"
            value="personalized"
            className={advancedRadioClassNames}
            inputClassName={advancedRadioInputClassNames}
          >
            <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
            <article>
              <h4 className="text-sm font-semibold @5xl:text-base">
                Plan de traitement personnalisé
              </h4>
              <p>
                Je préfère que vous me proposiez un plan de
                traitement personnalisé
              </p>
            </article>
            <span className="h-8 min-w-[32px] [&_svg]:w-8">
              <BrushSolidIcon />
            </span>
          </AdvancedRadio>
        </RadioGroup>
        {errors.personalizedPlan && (
          <p className="text-red-500">{errors.personalizedPlan}</p>
        )}
      </div>

      {formValues.personalizedPlan === 'personalized' && (
        <>
          <div className="mb-6">
            <article className="mt-4 @3xl:mt-9">
              <h1
                className={cn(
                  'mb-4 text-xl text-black @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl'
                )}
              >
                Sélection des arcades
              </h1>
            </article>
            <div>
              <RadioGroup
                value={formValues.archSelection}
                setValue={(value) =>
                  handleInputChange({
                    target: { name: 'archSelection', value },
                  })
                }
                className="col-span-full grid gap-4 @4xl:gap-6"
              >
                <AdvancedRadio
                  key="both"
                  value="both"
                  className={advancedRadioClassNames}
                  inputClassName={advancedRadioInputClassNames}
                >
                  <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                  <article>
                    <h4 className="text-sm font-semibold @5xl:text-base">
                      Les deux
                    </h4>
                  </article>
                  <span className="h-8 min-w-[32px] [&_svg]:w-8">
                    <ArrowBothDirectionIcon />
                  </span>
                </AdvancedRadio>
                <AdvancedRadio
                  key="maxillary"
                  value="maxillary"
                  className={advancedRadioClassNames}
                  inputClassName={advancedRadioInputClassNames}
                >
                  <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                  <article>
                    <h4 className="text-sm font-semibold @5xl:text-base">
                      Arcade Maxillaire
                    </h4>
                  </article>
                  <span className="h-8 min-w-[32px] [&_svg]:w-8">
                    <TrendingDownIcon />
                  </span>
                </AdvancedRadio>
                <AdvancedRadio
                  key="mandibular"
                  value="mandibular"
                  className={advancedRadioClassNames}
                  inputClassName={advancedRadioInputClassNames}
                >
                  <BiCheckCircle className="icon hidden h-5 w-5 text-secondary" />
                  <article>
                    <h4 className="text-sm font-semibold @5xl:text-base">
                      Arcade Mandibulaire
                    </h4>
                  </article>
                  <span className="h-8 min-w-[32px] [&_svg]:w-8">
                    <TrendingUpIcon />
                  </span>
                </AdvancedRadio>
              </RadioGroup>
              {errors.archSelection && (
                <p className="text-red-500">{errors.archSelection}</p>
              )}
            </div>
            <div>
              <article className="mt-4 @3xl:mt-9">
                <h1
                  className={cn(
                    'text-xl text-black @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl'
                  )}
                >
                  Instructions générales
                </h1>
              </article>
              <Textarea
                name="generalInstructions"
                className="mt-4"
                placeholder="INSTRUCTIONS GÉNÉRALES"
                value={formValues.generalInstructions}
                onChange={handleInputChange}
              />
              {errors.generalInstructions && (
                <p className="text-red-500">{errors.generalInstructions}</p>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  );
}
