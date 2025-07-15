'use client';

import Image from 'next/image';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import cn from '@/utils/class-names';
import UploadIcon from '@/components/shape/upload';
import { FileWithPath } from 'react-dropzone';
import { PiTrashBold } from 'react-icons/pi';
import { Text, FieldError } from 'rizzui';
import prettyBytes from 'pretty-bytes';
import { isEmpty } from 'lodash';

interface UploadZoneProps {
  label?: string;
  name: string;
  getValues: any;
  setValue: any;
  className?: string;
  error?: string;
  // Added 'initialImage' prop to handle existing images in the edit mode
  initialImage?: string;
}

interface FileType {
  name: string;
  url: string;
  size: number;
}

export default function Upload({
  label,
  name,
  className,
  getValues,
  setValue,
  error,
  initialImage, // initialImage prop for displaying an existing thumbnail
}: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage || null
  );

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFiles([
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
      setPreviewImage(null); // Clear the existing preview if a new file is added
      setValue(name, acceptedFiles);
    },
    [files, setValue, name]
  );

  function handleRemoveFile(index: number) {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    setPreviewImage(null); // Clear preview when file is removed
    setValue(name, updatedFiles);
  }

  const uploadedItems = getValues(name) || [];
  const notUploadedItems = files.filter(
    (file) =>
      !uploadedItems.some(
        (uploadedFile: FileType) => uploadedFile.name === file.name
      )
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div className={cn('grid @container', className)}>
      {label && (
        <span className="mb-1.5 block font-semibold text-gray-900">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center justify-center rounded-md border-[1.8px]',
          !isEmpty(files) || previewImage ? 'justify-start' : 'justify-center'
        )}
      >
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-4 px-6 py-5 transition-all duration-300'
          )}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12" />
          <Text className="text-base font-medium">Drop or select file</Text>
        </div>
      </div>

      {(previewImage || !isEmpty(notUploadedItems)) && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
          {previewImage && (
            <div className={cn('relative')}>
              <figure className="group relative h-40 rounded-md bg-gray-50">
                <MediaPreview name="Thumbnail" url={previewImage} />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute right-0 top-0 rounded-full bg-gray-700/70 p-1.5 opacity-20 transition duration-300 hover:bg-red-dark group-hover:opacity-100"
                >
                  <PiTrashBold className="text-white" />
                </button>
              </figure>
            </div>
          )}
          {notUploadedItems.map((file: any, index: number) => (
            <div key={index} className={cn('relative')}>
              <figure className="group relative h-40 rounded-md bg-gray-50">
                <MediaPreview name={file.name} url={file.preview} />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute right-0 top-0 rounded-full bg-gray-700/70 p-1.5 opacity-20 transition duration-300 hover:bg-red-dark group-hover:opacity-100"
                >
                  <PiTrashBold className="text-white" />
                </button>
              </figure>
              <MediaCaption name={file.path} size={file.size} />
            </div>
          ))}
        </div>
      )}

      {error && <FieldError error={error} />}
    </div>
  );
}

function MediaPreview({ name, url }: { name: string; url: string }) {
  return (
    <Image
      fill
      src={url}
      alt={name}
      className="transform rounded-md object-contain"
    />
  );
}

function MediaCaption({ name, size }: { name: string; size: number }) {
  return (
    <div className="mt-1 text-xs">
      <p className="break-words font-medium text-gray-700">{name}</p>
      <p className="mt-1 font-mono">{prettyBytes(size)}</p>
    </div>
  );
}
