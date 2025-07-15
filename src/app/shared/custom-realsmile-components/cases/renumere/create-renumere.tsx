'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Text, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormGroup from '@/app/shared/form-group';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import { useAuth } from '@/context/AuthContext';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import CustomUploadZone from '@/app/shared/custom-realsmile-components/customDropZone/customDropZone';
import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/carousel/carousel';
import { StlFileDisplay } from '@/app/shared/custom-realsmile-components/cases/stl-files-display/stl-files-display';
import NextBtn from '@/components/ui/carousel/next-btn';
import PrevBtn from '@/components/ui/carousel/prev-btn';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

// Messages for validation
const messages = {
  photoRequired: 'La première image est requise',
  stlRequired: 'Tous les fichiers STL sont requis',
};

// Helper function to validate URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Extend the form schema for Step 2 and Step 3 combined with new instructions field
const formSchema = z.object({
  photos: z.array(z.string().optional()).superRefine((photos, ctx) => {
    if (!photos[0] || !isValidUrl(photos[0])) {
      ctx.addIssue({
        path: [0],
        message: messages.photoRequired,
        code: z.ZodIssueCode.custom,
      });
    }
  }),
  stls: z.array(z.string().optional()).superRefine((stl, ctx) => {
    if (!stl[0] || !isValidUrl(stl[0])) {
      ctx.addIssue({
        path: [0],
        message: messages.stlRequired,
        code: z.ZodIssueCode.custom,
      });
    }
    if (!stl[1] || !isValidUrl(stl[1])) {
      ctx.addIssue({
        path: [1],
        message: messages.stlRequired,
        code: z.ZodIssueCode.custom,
      });
    }
    if (!stl[2] || !isValidUrl(stl[2])) {
      ctx.addIssue({
        path: [2],
        message: messages.stlRequired,
        code: z.ZodIssueCode.custom,
      });
    }
  }),
  // New long text field for instructions générales
  instructionsGenerales: z.string().optional(),
});
export type FormSchema = z.infer<typeof formSchema>;

type FormDataType = {
  photos: string[];
  stls: string[];
  caseId: string;
  instructionsGenerales: string; // Added new field here
};

const initialFormData: FormDataType = {
  photos: ['', '', '', '', '', '', '', ''],
  stls: ['', '', ''],
  caseId: '',
  instructionsGenerales: '', // Default value for instructions
};

const formDataAtom = atomWithStorage<FormDataType>(
  'multiStepForm',
  initialFormData
);

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
export default function CreateRenumere({
  isModalView = true,
  id,
}: {
  isModalView?: boolean;
  id: string; // Make sure to type the id prop correctly
}) {
  const [isLoading, setLoading] = useState(false);
  const {user} = useAuth()
  const [patientStlUrls, setPatientStlUrls] = useState<{
    [key: string]: string;
  }>({});
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
    trigger, // <-- Add trigger to validate the form
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get(
          `/cases/images?caseId=${id}`,

        );
        if (!response) {
          throw new Error('Failed to fetch images');
        }
        const data: any = await response.data;
        const imageUrls = Object.values(data);

        const updatedPhotos: any = Array.from(
          { length: 8 },
          (_, index) => imageUrls[index] || ''
        );

        setValue('photos', updatedPhotos);
        setFormData((prevData) => ({
          ...prevData,
          photos: updatedPhotos,
        }));
        setPatientImageUrls((prevUrls) => ({ ...prevUrls, ...data }));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    const fetchStls = async () => {
      try {
        const response = await axiosInstance.get(
          `/cases/stls?caseId=${id}`,
        
        );
        if (!response) {
          throw new Error('Failed to fetch STLs');
        }
        const data: any = await response.data;
        const stlUrls = Object.values(data);

        const updatedStls: any = Array.from(
          { length: 3 },
          (_, index) => stlUrls[index] || ''
        );

        setValue('stls', updatedStls);
        setFormData((prevData) => ({
          ...prevData,
          stls: updatedStls,
        }));
        setPatientStlUrls((prevUrls) => ({ ...prevUrls, ...data }));
      } catch (error) {
        console.error('Error fetching STLs:', error);
      }
    };

    fetchImages();
    fetchStls();
  }, [id, user, setValue, setFormData]);

  const onSubmit: SubmitHandler<typeof formSchema['_input']> = async (data) => {
    setLoading(true);
    try {
      // Send a PUT request with caseId and instructions
      const response = await axiosInstance.put(
        `/cases/renumere-instructions`,
        JSON.stringify({
            caseId: id,
            instructions: data.instructionsGenerales,
          }),

      );
      if (!response) {
        throw new Error('Failed to update instructions');
      }
      toast.success('Instructions updated successfully!');
      router.replace(`/cases/${id}`);
    } catch (error) {
      console.error('Error updating instructions:', error);
      toast.error('Erreur lors du traitement.');
    } finally {
      setLoading(false);
    }
  };

  const patientImageNamesWithPlaceHolderUrls = {
    image1:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image1.svg',
    image2:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image2.svg',
    image3:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image3.svg',
    image4:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image4.svg',
    image5:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image5.svg',
    image6:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image8.svg',
    image7:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image7.svg',
    image8:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image6.svg',
  };

  const getImageDisplayName = (imageName: string) => {
    const imageNames: { [key: string]: string } = {
      image1: 'Photo du sourire',
      image2: 'Photo du visage au repos',
      image3: 'Photo du profil',
      image4: 'Vue occlusale maxillaire',
      image5: 'Vue occlusale mandibulaire',
      image6: 'Vue latérale gauche',
      image7: 'Vue frontale en occlusion',
      image8: 'Vue latérale droite',
    };

    return imageNames[imageName] || imageName;
  };

  const getStlDisplayName = (stlName: any) => {
    const stlNames: any = {
      custom_file_1: 'Empreinte maxillaire STL',
      custom_file_2: 'Empreinte mandibulaire STL',
      custom_file_3: 'Occlusion STL',
    };

    return stlNames[stlName] || stlName;
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
                Vous devez remplir tous les stls et la première image afin de
                finaliser la rénumération du votre cas
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
                      <AvatarUpload
                        key={index}
                        index={index}
                        name={`photos.${index}`}
                        setValue={setValue}
                        getValues={getValues}
                        placeholderImg={patientImageUrls[name] || url}
                        caseId={id} // Pass the id prop to AvatarUpload
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

          <HorizontalFormBlockWrapper
            title="Ajouter les fichier STL :"
            description="Mettre à jour les fichiers STL du patient ici"
            isModalView={isModalView}
          >
            <div className="grid grid-cols-12 items-stretch gap-4">
              {/* CustomUploadZone section in the first grid column */}
              <div className="col-span-4 flex flex-col space-y-10">
                {['custom_file_1', 'custom_file_2', 'custom_file_3'].map(
                  (fileKey, index) => (
                    <CustomUploadZone
                      key={fileKey}
                      stlDisplayName={getStlDisplayName}
                      index={index}
                      register={register}
                      name={fileKey}
                      setValue={setValue}
                      getValues={getValues}
                      caseId={id}
                      imageIndex={fileKey}
                      typeStl={true}
                      stlLink={patientStlUrls[fileKey]}
                      data={patientStlUrls}
                      setData={setPatientStlUrls}
                      session={user}
                      setFormData={setFormData}
                      trigger={trigger} // <-- Pass the trigger function here
                    />
                  )
                )}
                <div className="col-span-12 mt-4 text-center">
                  <p className="text-red-600">
                    Rentrez et téléchargez les 3 fichiers stls
                  </p>
                </div>
              </div>

              {/* Swiper section in the second grid column */}
              <div className="col-span-8 flex">
                <Swiper
                  speed={500}
                  spaceBetween={50}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  className="min-h-[420px] max-w-full"
                >
                  {Object.entries(patientStlUrls).length > 0 ? (
                    Object.entries(patientStlUrls).map(
                      ([index, url], idx: any) =>
                        url ? (
                          <SwiperSlide key={idx}>
                            <StlFileDisplay
                              title={`Fichier STL N° ${parseInt(idx) + 1}`}
                              url={url}
                              isLoading={isLoading}
                              setIsLoading={setLoading}
                            />
                          </SwiperSlide>
                        ) : null // Do not render a SwiperSlide if there is no URL
                    )
                  ) : (
                    <SwiperSlide>
                      <div className="flex h-full w-full items-center justify-center">
                        Aucun fichier STL disponible
                      </div>
                    </SwiperSlide>
                  )}
                  <NextBtn key="next-btn" />
                  <PrevBtn key="prev-btn" />
                </Swiper>
              </div>
            </div>
          </HorizontalFormBlockWrapper>

          {/* New Instructions Générales block */}
          <HorizontalFormBlockWrapper
            title="Instructions Générales"
            description="Ajoutez des instructions générales supplémentaires ici"
            isModalView={isModalView}
          >
            <div className="flex flex-col">
              <textarea
                {...register('instructionsGenerales')}
                placeholder="Saisissez vos instructions générales ici..."
                className="w-full h-40 border border-gray-300 rounded p-2"
              />
              {errors.instructionsGenerales && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.instructionsGenerales.message}
                </span>
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
          Ajouter La rénumeration
        </Button>
      </div>
    </form>
  );
}
