import Image from 'next/image';
import toast from 'react-hot-toast';
import {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Text} from 'rizzui';
import cn from '@/utils/class-names';
import {PiPencilSimple} from 'react-icons/pi';
import {LoadingSpinner} from '@/components/ui/file-upload/upload-zone';
import {FileWithPath} from 'react-dropzone';
import {FieldError, Loader} from 'rizzui';
import { useAuth } from '@/context/AuthContext';
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
    session: any
}

export default function RadioUpload({
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
            setValue(name, {url});
        }
    };

        const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            setIsUploading(true); // Start loading indicator
            const formData = new FormData();
            formData.append('image', acceptedFiles[0]);
            formData.append('caseId', caseId);
            formData.append('imageIndex', imageIndex);

            const uploadPromise = axiosInstance.put(
            `/cases/upload-image`,
            formData
            )
            .then((response) => {
            // Axios automatically throws for non-2xx status codes, so if we reach here, it's a success.
            // And Axios automatically parses JSON, so data is directly in response.data.
            onUploadComplete(response.data.imageUrl); // Call your callback directly here
            return 'Image sauvegardée avec succés'; // This message will be shown by toast.promise on success
            })
            .catch((error) => {
            // This catch block handles any errors from the Axios request (network issues, 4xx/5xx responses).
            console.error('Upload error:', error); // Log the full error for debugging

            let errorMessage = 'Erreur lors du traitement de l\'image.';
            if (error.response && error.response.data && error.response.data.message) {
                // Use a more specific error message from the backend if available
                errorMessage = error.response.data.message;
            } else if (error.message) {
                // Fallback to the generic error message from Axios or JavaScript
                errorMessage = error.message;
            }

            // Re-throw the error so that toast.promise can catch it and display its error message.
            throw new Error(errorMessage);
            })
            .finally(() => {
            // This block runs whether the promise resolves or rejects.
            // It's the ideal place to ensure loading state is always reset.
            setIsUploading(false);
            });

            toast.promise(uploadPromise, {
            loading: 'Traitement...',
            success: 'Image sauvegardée avec succés',
            error: 'Erreur lors du traitement.', // This will be used for any error caught by the .catch()
            });
        },
        [caseId, imageIndex] // Add onUploadComplete to dependencies if it's a prop or memoized function
        );

    const {getRootProps, getInputProps} = useDropzone({onDrop});

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
                                <LoadingSpinner/>
                            ) : (
                                <PiPencilSimple className="h-5 w-5 text-white"/>
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
                            <Loader variant="spinner" className="justify-center"/>
                        )}
                    </div>
                )}
            </div>
            {error && <FieldError error={error}/>}
        </div>
    );
}
