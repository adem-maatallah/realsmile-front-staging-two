'use client';
import { useAtom } from 'jotai';
import { atomWithReset, atomWithStorage } from 'jotai/utils';
import cn from '@/utils/class-names';

import StepOne from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/step-1';
import StepTwo from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/step-2';
import StepThree from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/step-3';
import StepFour from './step-4';
import StepFive from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/step-5';
import StepSix from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/step-6';
import Congratulations from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/congratulations';
import { useState } from 'react';
import Footer from '@/app/(hydrogen)/cases/create/footer';
import StepSeven from './step-7';
import { Button } from 'rizzui';
import VideoModal from '../../../video-modal';

type FormDataType = {
  firstName: string;
  lastName: string;
  dateDeNaissance: any;
  photos: string[];
  photosRadio: string[];
  stls: string[];
  sexe: string;
  caseId: any;
  personalizedPlan: string | undefined;
  archSelection: string | undefined;
  generalInstructions: string | undefined;
  selectionArcades: string;
  sensTransversal: string;
  optionsMaxillaires: string;
  optionsMandibulaires: string;
  posteriorOption: string;
  sensVertical: string;
  actionAnomalieVertical: string;
  actionAnomaliePosterior: string;
  zoneCorrectionSupraclusion: string[];
  zoneCorrectionBeance: string[];
  canineRight: string;
  molarRight: string;
  canineLeft: string;
  molarLeft: string;
  sagittalCorrection: string;
  correctionOptionsCI2: string;
  correctionOptionsCI3: string;
  teethToExtractCL2: any;
  teethToExtractCL3: any;
  orthodonticProcedures: string[];
  overjet: string;
  encroachmentMaxillary: string;
  encroachmentMandibular: string;
  transversalExpansionMaxillary: string;
  transversalExpansionMandibular: string;
  sagittalExpansionMaxillary: string;
  sagittalExpansionMandibular: string;
  interproximalReductionMaxillary: string;
  interproximalReductionMandibular: string;
  diastemaManagement: string;
  residualSpaceManagement: string;
  interIncisivePosition: string;
  moveSuperieur?: string;
  moveInferieur?: string;
  tacksNeeded: string;
  specificTeeth?: string;
  teethToReplace?: any;
};

export const initialFormData: FormDataType = {
  firstName: '',
  lastName: '',
  dateDeNaissance: '',
  sexe: '',
  photos: [],
  photosRadio: [],
  stls: [],
  caseId: null,
  personalizedPlan: 'self_managed',
  archSelection: '',
  selectionArcades: '',
  sensTransversal: '',
  optionsMaxillaires: '',
  optionsMandibulaires: '',
  posteriorOption: '',
  sensVertical: '',
  actionAnomalieVertical: '',
  actionAnomaliePosterior: '',
  zoneCorrectionSupraclusion: [],
  zoneCorrectionBeance: [],
  canineRight: 'CLI',
  molarRight: 'CLI',
  canineLeft: 'CLI',
  molarLeft: 'CLI',
  sagittalCorrection: 'maintenirRapportAP',
  overjet: 'evaluerSurplomb',
  orthodonticProcedures: [],
  correctionOptionsCI2: 'elasticsCII',
  correctionOptionsCI3: 'elasticsCIII',
  teethToExtractCL2: '',
  teethToExtractCL3: '',
  encroachmentMaxillary: 'oui',
  encroachmentMandibular: 'oui',
  transversalExpansionMaxillary: 'siNecessary',
  transversalExpansionMandibular: 'siNecessary',
  sagittalExpansionMaxillary: 'siNecessary',
  sagittalExpansionMandibular: 'siNecessary',
  interproximalReductionMaxillary: 'siNecessary',
  interproximalReductionMandibular: 'siNecessary',
  diastemaManagement: 'fermer',
  residualSpaceManagement: 'fermer',
  interIncisivePosition: '',
  moveSuperieur: '',
  moveInferieur: '',
  tacksNeeded: '',
  specificTeeth: '',
  generalInstructions: '',
  teethToReplace: '',
};

export const formDataAtom = atomWithStorage<FormDataType>(
  'multiStepForm',
  initialFormData
);

export enum Step {
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  StepFive,
  StepSix,
  StepSeven,
  StepEight,
}

const firstStep = Step.StepOne;
export const stepperAtomOne = atomWithReset<Step>(firstStep);

export function useStepperOne() {
  const [step, setStep] = useAtom(stepperAtomOne);

  function gotoStep(step: Step) {
    setStep(step);
  }
  function gotoNextStep() {
    setStep(step + 1);
  }

  function gotoPrevStep() {
    setStep(step > firstStep ? step - 1 : step);
  }

  function resetStepper() {
    setStep(firstStep);
  }

  return {
    step,
    setStep,
    gotoStep,
    resetStepper,
    gotoNextStep,
    gotoPrevStep,
  };
}

export const MAP_STEP_TO_COMPONENT = {
  [Step.StepOne]: StepOne,
  [Step.StepTwo]: StepTwo,
  [Step.StepThree]: StepThree,
  [Step.StepFour]: StepFour,
  [Step.StepFive]: StepFive,
  [Step.StepSix]: StepSix,
  [Step.StepSeven]: StepSeven,
  [Step.StepEight]: Congratulations,
};

export const stepOneTotalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

interface MultiStepFormOneProps {
  CaseIDPassed?: string | null;
  doctorId?: any;
}

export default function MultiStepFormOne({
  CaseIDPassed = null,
  doctorId = null,
}: MultiStepFormOneProps) {
  const [step] = useAtom(stepperAtomOne);
  const Component = MAP_STEP_TO_COMPONENT[step];

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const openModal1 = () => setIsModalOpen1(true);
  const closeModal1 = () => setIsModalOpen1(false);

  const openModal2 = () => setIsModalOpen2(true);
  const closeModal2 = () => setIsModalOpen2(false);

  return (
    <>
      <div
        className={cn(
          'mx-auto grid w-full max-w-screen-2xl grid-cols-12 place-content-center gap-6 px-5 py-10 pb-20 @3xl:min-h-[calc(100vh-10rem)] @5xl:gap-8 @6xl:gap-16 xl:px-7'
        )}
      >
        <div className="col-span-12 flex justify-end gap-4">
          <Button color="primary" onClick={openModal1}>
            Guide Ajouter un cas avec un plan de traitement rempli par vous
          </Button>
          <Button color="primary" onClick={openModal2}>
            Guide Ajouter un cas avec un plan de traitement personnalisé
          </Button>
        </div>
        <Component CaseIDPassed={CaseIDPassed} doctorId={doctorId} />
      </div>
      <Footer />
      <VideoModal
        isOpen={isModalOpen1}
        onClose={closeModal1}
        videoUrl="https://www.youtube.com/embed/VxtZKVfDy5k?si=plEBqq1hfOE-WXI3"
      />
      <VideoModal
        isOpen={isModalOpen2}
        onClose={closeModal2}
        videoUrl="https://www.youtube.com/embed/tr_I9HI5z6g?si=GEWDtmT8CkcXecEW"
      />
    </>
  );
}
