import { metaObject } from '@/config/site.config';
import MultiStepFormOne from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
export const metadata = {
  ...metaObject('Create Case'),
};

export default function MultiStepFormPage() {
  return <MultiStepFormOne />;
}
