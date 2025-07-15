"use client";
import {metaObject} from '@/config/site.config';
import MultiStepFormOne from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import {useParams} from "next/navigation";

// export const metadata = {
//     ...metaObject('Create Case'),
// };

export default function MultiStepFormPage() {
    const {doctorId} = useParams();
    return <MultiStepFormOne doctorId={doctorId}/>;
}
