'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Text, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormGroup from '@/app/shared/form-group';
import CustomAvatarUpload from '@/components/ui/file-upload/custom-avatar-upload';
import { useAuth } from '@/context/AuthContext';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';

// Messages for validation
const messages = {
  photoRequired: 'Cette image est requise',
};

// Define the form schema
const formSchema = z.object({
  photos: z.array(z.instanceof(File)).refine(
    (files) => {
      return files.every((file) => file.name && file.size > 0);
    },
    {
      message: messages.photoRequired,
      path: [0],
    }
  ),
});
export type FormSchema = z.infer<typeof formSchema>;

type FormDataType = {
  photos: File[];
};

const initialFormData: FormDataType = {
  photos: [
    new File([], 'firebase.png'),
    new File([], 'firebase.png'),
    new File([], 'firebase.png'),
    new File([], 'firebase.png'),
    new File([], 'firebase.png'),
  ],
};

const formDataAtom = atomWithStorage<FormDataType>('model', initialFormData);

// A reusable form wrapper component
function HorizontalFormBlockWrapper({
  title,
  description,
  children,
  className,
  isModalView = true,
}: React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  isModalView?: boolean;
}>) {
  return (
    <div
      className={cn(
        className,
        isModalView ? '@5xl:grid @5xl:grid-cols-6' : ' '
      )}
    >
      {isModalView && (
        <div className="col-span-2 mb-6 pe-4 @5xl:mb-0">
          <Title as="h6" className="font-semibold">
            {title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">{description}</Text>
        </div>
      )}
      <div
        className={cn(
          'grid grid-cols-1 gap-3 @lg:gap-4 @2xl:gap-5',
          isModalView ? 'col-span-4' : ' '
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Main form component for creating and updating entries
export default function Advancement({
  isModalView = true,
}: {
  isModalView?: boolean;
}) {
  const [isLoading, setLoading] = useState(false);
  const {user} = useAuth()
  const [patientImageUrls, setPatientImageUrls] = useState<{
    [key: string]: string;
  }>({});
  const [formData, setFormData] = useAtom(formDataAtom); // Correctly use the formDataAtom
  const router = useRouter(); // Get router instance

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    const formDataToSend = new FormData();
    data.photos.forEach((photo, index) => {
      formDataToSend.append(`image${index + 1}`, photo);
    });

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formDataToSend,
      });
      setLoading(false);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result: any = await response.json();

      toast.success('Form submitted successfully!');

      // Get the current timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Function to download a file
      const downloadFile = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // Trigger download for each URL in the response
      if (result.mesh_urls) {
        const upperMeshUrl = result.mesh_urls.upper_mesh_url;
        const lowerMeshUrl = result.mesh_urls.lower_mesh_url;

        // Download upper mesh
        downloadFile(upperMeshUrl, `upper_mesh_${timestamp}.obj`);

        // Add a small delay before downloading the second file
        setTimeout(() => {
          // Download lower mesh
          downloadFile(lowerMeshUrl, `lower_mesh_${timestamp}.obj`);
        }, 1000); // Delay of 1 second
      }

      // router.replace(`/cases/${id}`); // Uncomment and modify as per your routing
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      toast.error('Erreur lors du traitement.');
    }
  };

  const patientImageNamesWithPlaceHolderUrls = {
    image1:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
    image2:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
    image3:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
    image4:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
    image5:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
  };

  const getImageDisplayName = (imageName: string) => {
    const imageNames: { [key: string]: string } = {
      image1: 'Photo numéro 1',
      image2: 'Photo numéro 2',
      image3: 'Photo numéro 3',
      image4: 'Photo numéro 4',
      image5: 'Photo numéro 5',
    };

    return imageNames[imageName] || imageName;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      <div className="flex-grow pb-10">
        <div
          className={cn(
            'grid grid-cols-1 ',
            isModalView
              ? 'grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
              : 'gap-5'
          )}
        >
          <HorizontalFormBlockWrapper
            title={'Ajouter les images du patient :'}
            description={'Mettre à jour les images du patient ici'}
            isModalView={isModalView}
          >
            <div className="mb-8 text-center">
              <p className="text-red-600">
                Vous devez remplir toutes les images afin de finaliser la
                rénumération du votre cas
              </p>
            </div>
            <div className="mb-8 grid grid-cols-3 gap-8">
              {Object.entries(patientImageNamesWithPlaceHolderUrls).map(
                ([name, url], index) => (
                  <FormGroup
                    key={index}
                    title={getImageDisplayName(name)}
                    className="mb-8 flex flex-col items-center justify-center text-center"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <CustomAvatarUpload
                        key={index}
                        index={index}
                        name={`photos.${index}`}
                        setValue={setValue}
                        getValues={getValues}
                        placeholderImg={patientImageUrls[name] || url}
                        imageIndex={name}
                        register={register}
                        session={user}
                        setFormData={setFormData} // Ensure setFormData is passed
                      />
                      {errors.photos && errors.photos[index] && (
                        <div className="mt-2 text-sm text-red-500">
                          {errors.photos[index]?.message}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                )
              )}
            </div>
          </HorizontalFormBlockWrapper>
        </div>
      </div>

      <div
        className={cn(
          'sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
          isModalView ? '-mx-10 -mb-7 px-10 py-5' : 'py-1'
        )}
      >
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full @xl:w-auto"
        >
          Confirmer
        </Button>
      </div>
    </form>
  );
}
