'use client';

import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { PiArrowUpLight, PiCheck } from 'react-icons/pi';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import {
  formDataAtom,
  initialFormData,
  MAP_STEP_TO_COMPONENT,
  stepperAtomOne,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import { errorLoadingAtom } from '@/store/multistep-atom';
import HomeIcon from '@/components/custom-icons/HomeIcon';
import { BiSave } from 'react-icons/bi';

interface FooterProps {
  formId?: number;
  className?: string;
  isLoading?: boolean;
  setIsLoading?: any;
}

function buttonLabel(step: number) {
  const totalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

  if (step === totalSteps - 1) {
    return (
      <>
        Accueil <HomeIcon className="w-4" />
      </>
    );
  }
  if (step === totalSteps - 2) {
    return (
      <>
        Terminer <BiSave className="w-4" />
      </>
    );
  }
  return (
    <>
      Enregistrer <PiArrowUpLight className="rotate-90" />
    </>
  );
}

export default function Footer({ className }: FooterProps) {
  const [{ isLoading, error, isValid }, setErrorLoading] =
    useAtom(errorLoadingAtom);
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useAtom(formDataAtom);
  const { step, gotoPrevStep, gotoStep } = useStepperOne();
  const resetLocation = useResetAtom(stepperAtomOne);
  const totalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

  useEffect(() => {
    resetLocation();
    setFormData(initialFormData);
  }, [pathname, searchParams]);

  function buttonAttr() {
    if (step === totalSteps - 1) {
      return {
        onClick: () => push('/'),
        disabled: isLoading || !isValid,
      };
    }
    return {
      form: `rhf-${step.toString()}`,
      disabled: isLoading || !isValid,
    };
  }

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 flex flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 xl:pl-3 2xl:pl-6 3xl:px-8 3xl:pl-6 3xl:pt-4 4xl:px-10 4xl:pb-9 4xl:pl-9',
        className
      )}
      style={{
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex w-full items-center justify-between">
        {step > 0 && step < totalSteps - 1 && (
          <Button
            rounded="pill"
            variant="outline"
            onClick={gotoPrevStep}
            className="ml-[20%] flex h-10 w-20 items-center justify-center gap-1 bg-black text-white backdrop-blur-lg hover:border-white hover:bg-primary hover:text-white"
          >
            <PiArrowUpLight className="-rotate-90" />
            Retour
          </Button>
        )}
        <Button
          rounded="pill"
          {...buttonAttr()}
          type={'submit'}
          className="ml-auto gap-1 bg-gray-900/[.35] bg-primary text-white backdrop-blur-lg dark:bg-gray-0/[.35] dark:text-white"
        >
          {buttonLabel(step)}
        </Button>
      </div>
    </footer>
  );
}
