'use client';

import { Title, ActionIcon } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';

interface ViewPdfFormProps {
  pdfFile: string;
}

export default function ViewPdfForm({ pdfFile }: ViewPdfFormProps) {
  const { closeModal } = useModal();

  return (
    <div className="container max-w-full rounded-md p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          View PDF
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="mt-4">
        <object
          data={pdfFile}
          type="application/pdf"
          width="100%"
          height="600px"
        >
          <p>
            Your browser does not support PDFs. Please{' '}
            <a href={pdfFile} download>
              download the file
            </a>
            .
          </p>
        </object>
      </div>
    </div>
  );
}
