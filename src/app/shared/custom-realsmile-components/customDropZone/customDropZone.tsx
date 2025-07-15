'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import isEmpty from 'lodash/isEmpty';
import prettyBytes from 'pretty-bytes';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from '@uploadthing/react/hooks';
import { PiCheckBold, PiTrashBold } from 'react-icons/pi';
import { generateClientDropzoneAccept } from 'uploadthing/client';
import { useUploadThing } from '@/utils/uploadthing';
import { Button, Text, FieldError } from 'rizzui';
import cn from '@/utils/class-names';
import UploadIcon from '@/components/shape/upload';
import { endsWith } from 'lodash';
import { FileWithPath } from 'react-dropzone';
import { ClientUploadedFileData } from 'uploadthing/types';
import axiosInstance from '@/utils/axiosInstance';

interface UploadZoneProps {
  label?: string;
  name: string;
  getValues: any;
  setValue: any;
  className?: string;
  error?: string;
  multiple?: boolean;
  typeStl?: boolean;
  caseId?: any;
  register?: any;
  placeholderImg?: any;
  imageIndex?: any;
  stlLink?: any;
  data?: any;
  setData?: any;
  session?: any;
  key?: any;
  index?: any;
  stlDisplayName?: any;
  setFormData?: any;
  trigger: any;
}

interface FileType {
  name: string;
  url: string;
  size: number;
}

export default function CustomUploadZone({
  register,
  placeholderImg,
  imageIndex,
  stlLink,
  label,
  name,
  className,
  getValues,
  key,
  setValue,
  error,
  multiple = true,
  typeStl = false,
  caseId,
  data,
  setData,
  session,
  index,
  stlDisplayName,
  setFormData,
  trigger,
}: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  const mimeTypesDict: { stl: string[] } = {
    stl: [
      'model/stl',
      'application/vnd.ms-pki.stl',
      'application/octet-stream',
    ],
  };

  const startUpload = async (fileList: File[]) => {
    if (fileList.length === 0) return; // Ensure there are files to upload

    setIsUploading(true); // Start loading

    const formData = new FormData();
    fileList.forEach((file) => formData.append('stl', file));

    if (caseId) {
      formData.append('caseId', caseId);
    }
    formData.append('stlIndex', name);

    try {
      const response = await axiosInstance.put(
        `/cases/upload-stl`,
        formData

      );

      // Check for successful status code
      if (response) {
        const data = await response.data; // Parse the response data

        // Update the state with the new STL URL
        setData({ ...data, stlUrl: data.stlUrl });
        setValue(`stls.${index}`, data.stlUrl, { shouldValidate: true }); // Correctly set the STL URL
        trigger(); // Trigger form validation after setting the value

        // Show success toast
        toast.success(`Fichier ${fileList[0].name} déposé avec succès`);
      } else {
        const errorText = await response;
        throw new Error(errorText || 'Failed to upload files.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);

      // Show error toast
      toast.error(`Error uploading file ${fileList[0].name}`);
    } finally {
      setIsUploading(false); // Stop loading
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      // If multiple files are not allowed but more than one is dropped, show an error
      if (!multiple && acceptedFiles.length > 1) {
        toast.error('Only one file is allowed.');
        setFiles([]); // Clear the existing files if more than one file is dropped
        return;
      }

      // If only STL files are allowed, check each file to confirm it's an STL file
      if (typeStl) {
        const stlFiles = acceptedFiles.filter(
          (file) =>
            mimeTypesDict['stl'].includes(file.type) ||
            file.name.toLowerCase().endsWith('.stl')
        );
        // If there are no STL files or some files are not STL, show an error
        if (stlFiles.length === 0 || stlFiles.length !== acceptedFiles.length) {
          toast.error('Only STL files are allowed.');
          setFiles([]); // Clear the existing files
          return; // Exit the function to prevent setting non-STL files
        }
        // If checks pass, set the files
        setFiles(
          stlFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );

        // Automatically start upload
        await startUpload(stlFiles);
      }
    },
    [multiple, typeStl, mimeTypesDict, startUpload] // Ensures that useCallback only re-computes when these values change
  );

  function handleRemoveFile(index: number) {
    // Make a copy of the files array
    const updatedFiles = [...files];

    // Remove the file at the specified index
    updatedFiles.splice(index, 1);

    // Update the state
    setFiles(updatedFiles);
  }

  const uploadedItems = isEmpty(getValues(name)) ? [] : getValues(name);

  const notUploadedItems = files.filter(
    (file) =>
      !uploadedItems?.some(
        (uploadedFile: FileType) => uploadedFile.name === file.name
      )
  );

  const { permittedFileInfo } = useUploadThing('generalMedia', {
    onClientUploadComplete: (
      res: ClientUploadedFileData<any>[] | undefined
    ) => {
      if (setValue) {
        // const respondedUrls = res?.map((r) => r.url);
        setFiles([]);
        const respondedUrls: any = res?.map((r) => ({
          name: r.name,
          size: r.size,
          url: r.url,
        }));
        setValue(name, respondedUrls);
        setValue(`stls.${index}`, respondedUrls[0].url, {
          shouldValidate: true,
        });
        setFormData((prev: any) => {
          // Create a new array that replaces the photo at the specific index with the new URL
          let updatedstls = [...prev.stls];
          updatedstls[index] = respondedUrls[0].url;

          // Ensure the length of updatedstls is at least 2, filling missing slots with ''
          while (updatedstls.length < 2) {
            updatedstls.push('');
          }

          return {
            ...prev,
            stls: updatedstls,
          };
        });
      }
      toast.success(
        <Text as="b" className="font-semibold">
          Fichier STL Téléchargé avec succés
        </Text>
      );
    },
    onUploadError: (error: Error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: useMemo(() => {
      const baseAcceptTypes = {
        'application/vnd.ms-pki.stl': ['.stl'],
      };

      const permittedTypes = permittedFileInfo?.config
        ? generateClientDropzoneAccept(Object.keys(permittedFileInfo.config))
        : {};

      // Merge the STL accept types with other permitted types
      const acceptTypes = { ...baseAcceptTypes, ...permittedTypes };
      return acceptTypes;
    }, [permittedFileInfo]),
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
          'rounded-md border-[1.8px]',
          !isEmpty(files) &&
            'flex flex-wrap items-center justify-between @xl:flex-nowrap @xl:pr-6'
        )}
      >
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer items-center gap-4 px-6 py-5 transition-all duration-300',
            isEmpty(files)
              ? 'justify-center'
              : 'flex-grow justify-center @xl:justify-start'
          )}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12" />
          <Text className="text-base font-medium">
            {stlLink ? (
              <>Modifier {stlDisplayName(name)}</>
            ) : (
              <>Ajouter une {stlDisplayName(name)}</>
            )}
          </Text>
        </div>
      </div>

      {(!isEmpty(uploadedItems) || !isEmpty(notUploadedItems)) && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
          {uploadedItems.map((file: any, index: number) => (
            <div key={index} className={cn('relative')}>
              <MediaCaption name={file.name} size={file.size} />
            </div>
          ))}
          {notUploadedItems.map((file: any, index: number) => (
            <div key={index} className={cn('relative')}>
              <MediaCaption name={file.path} size={file.size} />
            </div>
          ))}
        </div>
      )}

      {error && <FieldError error={error} />}
    </div>
  );
}

function MediaCaption({ name, size }: { name: string; size: number }) {
  return (
    <div className="mt-1 flex items-center gap-x-2 text-xs">
      <p className="break-words font-medium text-gray-700">{name}</p>
      <p className="font-mono">{prettyBytes(size)}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
          <stop stopColor="#fff" stopOpacity="0" offset="0%" />
          <stop stopColor="#fff" stopOpacity=".631" offset="63.146%" />
          <stop stopColor="#fff" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)">
          <path
            d="M36 18c0-9.94-8.06-18-18-18"
            id="Oval-2"
            stroke="url(#a)"
            strokeWidth="2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </path>
          <circle fill="#fff" cx="36" cy="18" r="1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}
