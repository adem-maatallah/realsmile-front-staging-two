'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
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

interface FooterProps {
  formId?: number;
  className?: string;
  isLoading?: boolean;
}

function buttonLabel(formId?: number) {
  const totalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

  if (formId === totalSteps - 1) {
    return (
      <>
        Submit <PiCheck />
      </>
    );
  }

  if (formId === 7) {
    return 'Back to Home';
  }
  return (
    <>
      Next <PiArrowUpLight className="rotate-90" />
    </>
  );
}

export default function Footer({ isLoading, className }: FooterProps) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setFormData = useSetAtom(formDataAtom);
  const { step, gotoPrevStep } = useStepperOne();
  const resetLocation = useResetAtom(stepperAtomOne);
  const totalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

  useEffect(() => {
    resetLocation();
    setFormData(initialFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  function buttonAttr() {
    if (step === totalSteps - 1) {
      return {
        onClick: () => push('/'),
      };
    }
    return { form: `rhf-${step?.toString()}` };
  }

  return (
    <footer
      className={cn(
        'flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 xl:pl-3 2xl:pl-6 3xl:px-8 3xl:pl-6 3xl:pt-4 4xl:px-10 4xl:pb-9 4xl:pl-9',
        className
      )}
    >
      {step > 0 && step < totalSteps && (
        <Button
          rounded="pill"
          variant="outline"
          onClick={gotoPrevStep}
          className="flex h-10 w-20 items-center justify-center gap-1 border-white text-black backdrop-blur-lg hover:border-white hover:bg-white hover:text-primary"
        >
          <PiArrowUpLight className="-rotate-90" />
          Back
        </Button>
      )}
      <Button
        isLoading={isLoading}
        disabled={isLoading}
        rounded="pill"
        {...buttonAttr()}
        type={'submit'}
        className="ml-auto gap-1 bg-gray-900/[.35] backdrop-blur-lg dark:bg-gray-0/[.35] dark:text-white dark:active:enabled:bg-gray-0/75"
      >
        {buttonLabel(step)}
      </Button>
    </footer>
  );
}
