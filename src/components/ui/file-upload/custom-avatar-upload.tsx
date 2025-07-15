import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import cn from '@/utils/class-names';
import { PiPencilSimple } from 'react-icons/pi';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import { FieldError } from 'rizzui';

interface UploadZoneProps {
    name: string;
    getValues?: any;
    setValue?: any;
    className?: string;
    error?: string;
    placeholderImg: any;
    imageIndex: string;
    register: any;
    key: any;
    isRadio?: any;
    session?: any;
    index?: any;
    setFormData?: any;
    photosRadio?: any;
}

export default function CustomAvatarUpload({
                                               name,
                                               error,
                                               className,
                                               getValues,
                                               setValue,
                                               placeholderImg,
                                               imageIndex,
                                               register,
                                               key,
                                               index,
                                               isRadio = false,
                                               session,
                                               setFormData,
                                               photosRadio,
                                           }: UploadZoneProps) {
    const [uploadedImage, setUploadedImage] = useState<string | undefined>(
        undefined
    );
    const [isUploading, setIsUploading] = useState(false);

    const formValue = getValues(name);

    const onImageSelect = useCallback(
        (file: FileWithPath) => {
            const imageUrl = URL.createObjectURL(file);
            setValue(`photos.${index}`, file, { shouldValidate: true });
            setUploadedImage(imageUrl);

            setFormData((prev: any) => {
                let updatedPhotos = [...prev.photos];
                updatedPhotos[index] = file;

                while (updatedPhotos.length < 8) {
                    updatedPhotos.push('');
                }

                const newFormData = {
                    ...prev,
                    photos: updatedPhotos,
                };

                console.log("Updated form data:", newFormData);
                return newFormData;
            });
        },
        [setValue, index, setFormData]
    );

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            setIsUploading(true);
            const file = acceptedFiles[0];
            onImageSelect(file);
            setIsUploading(false);
        },
        [onImageSelect]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg'],
        },
    });

    return (
        <div className={cn('grid justify-center gap-5', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative grid h-40 w-40 place-content-center border-[1.8px]',
                    isRadio ? 'h-60 w-96 rounded-lg' : 'rounded-full'
                )}
            >
                <figure
                    className={`absolute inset-0 ${isRadio ? 'absolute inset-0 rounded-lg' : 'rounded-full'}`}
                >
                    <Image
                        fill
                        alt="user avatar"
                        src={uploadedImage || formValue?.url || placeholderImg}
                        className={isRadio ? 'rounded-lg' : 'rounded-full'}
                        style={{ objectFit: 'cover' }}
                    />
                </figure>

                <div
                    className={cn(
                        'absolute inset-0 grid cursor-pointer place-content-center rounded-full',
                        { 'opacity-50': isUploading }
                    )}
                >
                    <PiPencilSimple className="h-5 w-5 text-white" />
                    <input {...getInputProps()} {...register(`photos${key}` as const)} />
                    {isUploading && <LoadingSpinner />}
                </div>
            </div>
            {error && <FieldError error={error} />}
        </div>
    );
}
