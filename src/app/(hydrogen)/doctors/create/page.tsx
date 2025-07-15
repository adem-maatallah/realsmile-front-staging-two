// Server Component: CreateDoctorPage.tsx
import CreateDoctorForm from '@/app/shared/custom-realsmile-components/CreateDoctorPage';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Doctor'),
};

const pageHeader = {
  title: 'Create Doctor',
  breadcrumb: [
    {
      href: '/commercial-dashboard',
      name: 'Dashboard',
    },
    {
      name: 'Create Doctor',
    },
  ],
};

export default function CreateDoctorPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateDoctorForm />
    </>
  );
}
