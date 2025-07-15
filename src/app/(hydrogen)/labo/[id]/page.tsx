import dynamic from 'next/dynamic';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import CaseFileStats from '@/app/shared/custom-realsmile-components/liste/labo-list/file-list/file-stats';
import { metaObject } from '@/config/site.config';
import UploadButton from '@/app/shared/upload-button';
import PageLayout from '@/app/(hydrogen)/labo/[id]/page-layout';
import { useParams } from 'next/navigation';
const FileUpload = dynamic(() => import('@/app/shared/file-upload'), {
  ssr: false,
});

export const metadata = {
  ...metaObject('Case Files'),
};

export default function FileListPage() {
  return (
    <>
      <PageLayout />
    </>
  );
}
