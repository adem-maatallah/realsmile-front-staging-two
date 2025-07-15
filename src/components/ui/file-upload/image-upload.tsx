import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Text } from 'rizzui';
import cn from '@/utils/class-names';
import { PiPencilSimple } from 'react-icons/pi';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import { FileWithPath } from 'react-dropzone';
import { FieldError, Loader } from 'rizzui';
import axiosInstance from '@/utils/axiosInstance';

interface UploadZoneProps {
  name: string;
  getValues?: any;
  setValue?: any;
  className?: string;
  error?: string;
  placeholderImg: string; // Prop for the placeholder image
  caseId: string; // New prop for caseId
  imageIndex: string; // New prop for imageIndex
}

export default function ImageUpload({
  name,
  error,
  className,
  getValues,
  setValue,
  placeholderImg,
  caseId,
  imageIndex,
    session
}: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);

  const formValue = getValues(name);

  const onUploadComplete = (url: string) => {
    if (setValue) {
      setValue(name, { url });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', acceptedFiles[0]);
      formData.append('caseId', caseId);
      formData.append('imageIndex', imageIndex);

      const uploadPromise = axiosInstance.put(
        `/cases/upload-image`,
        formData
      )
      .then((response) => { // Removed 'async' as it's not strictly necessary here
        setIsUploading(false);
        // Removed `if (!response)` - Axios guarantees response in .then()
        return response.data;
      })
      .then((data) => {
        onUploadComplete(data.imageUrl);
        return 'Image sauvegardée avec succés'; // Success message for toast.promise
      })
      .catch((error) => { // ADD THIS CATCH BLOCK
        setIsUploading(false); // Ensure loading state is reset on error
        console.error("Upload failed:", error); // Log the actual error for debugging

        // IMPORTANT: Re-throw the error so toast.promise can catch it and display the error toast.
        // You can customize the error message if needed, e.g., error.response.data?.message
        throw new Error('Erreur lors du traitement de l\'image.'); // Custom error message
      });

      toast.promise(uploadPromise, {
        loading: 'Traitement...',
        success: 'Image sauvegardée avec succés',
        error: 'Erreur lors du traitement.', // This will be displayed if the promise rejects
      });
    },
    [caseId, imageIndex]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className={cn('grid justify-center gap-5', className)}>
      <div
        className={cn(
          'relative grid h-40 w-40 place-content-center rounded-full border-[1.8px]'
        )}
      >
        {formValue ? (
          <>
            <figure className="absolute inset-0 rounded-full">
              <Image
                fill
                alt="user avatar"
                src={formValue?.url}
                className="rounded-full"
              />
            </figure>
            <div
              {...getRootProps()}
              className={cn(
                'absolute inset-0 grid place-content-center rounded-full'
              )}
            >
              {isUploading ? (
                <LoadingSpinner />
              ) : (
                <PiPencilSimple className="h-5 w-5 text-white" />
              )}

              <input {...getInputProps()} />
            </div>
          </>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'absolute inset-0 z-10 grid cursor-pointer place-content-center'
            )}
          >
            {!isUploading ? (
              <>
                <input {...getInputProps()} />
                <Image
                  src={placeholderImg}
                  alt="Upload placeholder"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </>
            ) : (
              <Loader variant="spinner" className="justify-center" />
            )}
          </div>
        )}
      </div>
      {error && <FieldError error={error} />}
    </div>
  );
}
