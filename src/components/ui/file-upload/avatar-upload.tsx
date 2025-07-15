import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCallback, useState, useEffect } from 'react';
import cn from '@/utils/class-names';
import { PiPencilSimple } from 'react-icons/pi';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import { FieldError } from 'rizzui';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

interface UploadZoneProps {
  name: string;
  getValues?: any;
  setValue?: any;
  className?: string;
  error?: string;
  placeholderImg: any;
  caseId: string;
  imageIndex: string;
  register: any;
  key: any;
  session?: any;
  index?: any;
  setFormData?: any;
  trigger?: any;
}

export default function AvatarUpload({
  name,
  error,
  className,
  getValues,
  setValue,
  placeholderImg,
  caseId,
  imageIndex,
  register,
  key,
  index,
  session,
  setFormData,
  trigger,
}: UploadZoneProps) {
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    placeholderImg || undefined
  );
  const [isUploading, setIsUploading] = useState(false);

  const formValue = getValues(name);
  const {user} = useAuth();
  useEffect(() => {
    if (placeholderImg) {
      setUploadedImage(placeholderImg);
      setValue(name, placeholderImg, { shouldValidate: true });
    }
  }, [placeholderImg, setValue, name]);

  const onUploadComplete = useCallback(
    (url: string) => {
      setValue(`photos.${index}`, url, { shouldValidate: true });
      setUploadedImage(url);

      setFormData((prev: any) => {
        let updatedPhotos = [...prev.photos];
        updatedPhotos[index] = url;

        while (updatedPhotos.length < 8) {
          updatedPhotos.push('');
        }

        return { ...prev, photos: updatedPhotos };
      });

      // Trigger validation
      trigger && trigger();
    },
    [setValue, index, setFormData, trigger]
  );

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Log file to ensure it's selected
      console.log('Selected file:', file);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('caseId', caseId);
      formData.append('imageIndex', imageIndex);

      setIsUploading(true);

      try {
        // Log before sending request
        console.log('Sending API request for file upload');

        const response = await axiosInstance.put(
          `/cases/upload-image`,
            formData,

        );
        console.log('API response received:', response);
        setIsUploading(false);

        if (!response) {
          const errorText = response || 'Échec du téléchargement de l\'image.';
          throw new Error(errorText || "Échec du téléchargement de l'image.");
        }

        // Log the API response
        const data: any = await response.data;
        console.log('API response:', data);

        const uploadedImageUrl = data.imageUrl;

        onUploadComplete(uploadedImageUrl);

        toast.success('Image téléchargée avec succès');
      } catch (error) {
        setIsUploading(false);
        console.error('API error:', error);
        toast.error("Erreur lors du téléchargement de l'image");
      }
    },
    [caseId, imageIndex, user, onUploadComplete]
  );

  return (
    <div className={cn('grid justify-center gap-5', className)}>
      <div
        className={cn(
          'relative grid h-40 w-40 place-content-center border-[1.8px]',
          'rounded-full'
        )}
      >
        <figure className="absolute inset-0 rounded-full">
          <Image
            layout="fill"
            alt="user avatar"
            objectFit="cover"
            src={uploadedImage || formValue?.url || placeholderImg}
            className="rounded-full"
          />
        </figure>

        <div className="absolute inset-0 grid cursor-pointer place-content-center rounded-full">
          <PiPencilSimple className="h-5 w-5 text-white" />
        </div>
        {isUploading && <LoadingSpinner />}
      </div>

      <input
        type="file"
        onChange={onFileChange}
        accept="image/png, image/jpeg"
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />

      {error && <FieldError error={error} />}
    </div>
  );
}
