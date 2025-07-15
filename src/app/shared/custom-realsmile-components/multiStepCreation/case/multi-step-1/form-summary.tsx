'use client';

import {
  stepOneTotalSteps,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import cn from '@/utils/class-names';
import { Stepper } from 'rizzui';
import { useState } from 'react';

interface FormSummaryProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function FormSummary({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: FormSummaryProps) {
  const { step } = useStepperOne();

  const steps = [
    { title: 'Etape 1' },
    { title: 'Etape 2' },
    { title: 'Etape 3' },
    { title: 'Etape 4' },
    { title: 'Etape 5' },
    { title: 'Etape 6' },
    { title: 'Etape 7' },
    { title: 'Etape 8' },
  ];

  return (
    <div className={cn('text-base text-black', className)}>
      <Stepper currentIndex={step}>
        {steps.map((s, index) => (
          <Stepper.Step key={index} title={s.title}>
            <div className={cn('p-4', index === step ? 'block' : 'hidden')}>
              <h1
                className={cn(
                  'text-xl text-black @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl',
                  titleClassName
                )}
              >
                {title}
              </h1>
            </div>
          </Stepper.Step>
        ))}
      </Stepper>
      <br></br>
      <article className="mt-4 @3xl:mt-9">
        <h1
          className={cn(
            'text-xl text-black @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl',
            titleClassName
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed @3xl:text-base',
            descriptionClassName
          )}
        >
          {description}
        </p>
      </article>
    </div>
  );
}
