'use client';

import React from 'react';
import { Title, ActionIcon } from 'rizzui';
import { PiFilePdf, PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';

export default function PdfReaderModal({ pdfUrl }: { pdfUrl: string }) {
  const { closeModal } = useModal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-11/12 max-w-5xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiFilePdf className="h-7 w-7 text-red-500" />
            <Title as="h4" className="font-semibold">
              Visualisation du PDF
            </Title>
          </div>
          <ActionIcon size="lg" variant="text" onClick={closeModal}>
            <PiXBold className="h-auto w-5" />
          </ActionIcon>
        </div>

        <div className="flex items-center justify-center">
          {pdfUrl ? (
            <object
              data={pdfUrl}
              type="application/pdf"
              className="h-[80vh] w-full rounded-lg border"
              onError={() => alert('Error: PDF not accessible.')}
            >
              <p>
                Impossible d'afficher le PDF.{' '}
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Cliquez ici pour le télécharger.
                </a>
              </p>
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <PiFilePdf className="h-20 w-20 text-gray-400" />
              <p className="mt-4 text-gray-600">
                Aucun document au format PDF n'est disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
