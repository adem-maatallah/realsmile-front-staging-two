import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormSummary from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/form-summary';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import {
  formDataAtom,
  useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import {
  FormStep3Schema,
  formStep3Schema,
} from '@/utils/validators/multistep-form.schema';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import CustomUploadZone from '../../../customDropZone/customDropZone';
import { useEffect, useState } from 'react';
import { StlFileDisplay } from '@/app/shared/custom-realsmile-components/cases/stl-files-display/stl-files-display';
import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/carousel/carousel';
import NextBtn from '@/components/ui/carousel/next-btn';
import PrevBtn from '@/components/ui/carousel/prev-btn';
import { useAuth } from '@/context/AuthContext';
import { errorLoadingAtom } from '@/store/multistep-atom';
import axiosInstance from '@/utils/axiosInstance';

export default function StepThree() {
  const { step, gotoNextStep } = useStepperOne();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useAtom(formDataAtom);
  const radiographyImageNames = {
    image9:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image9.jpeg',
    image10:
      'https://storage.googleapis.com/realsmilefiles/staticFolder/image10.jpeg',
  };

  // Function to return display name for the given image name
  const getImageDisplayName = (imageName: any) => {
    switch (imageName) {
      case 'image9':
        return 'Radiographie Panoramique';
      case 'image10':
        return 'Téléradiographie de profil';
      default:
        return imageName;
    }
  };

  const getStlDisplayName = (stlName: any) => {
    const stlNames: any = {
      custom_file_1: 'Empreinte maxillaire STL',
      custom_file_2: 'Empreinte mandibulaire STL',
      custom_file_3: 'Occlusion STL',
    };

    return stlNames[stlName] || stlName;
  };

  const defaultPhotos =
    formData.photosRadio && formData.photosRadio.length > 0
      ? [
          ...formData.photosRadio,
          ...Array(2 - formData.photosRadio.length).fill(''),
        ]
      : Array(2).fill('');

  const defaultStls =
    formData.stls && formData.stls.length > 0
      ? [...formData.stls, ...Array(3 - formData.stls.length).fill('')]
      : Array(3).fill('');

  const {
    register,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<FormStep3Schema>({
    resolver: zodResolver(formStep3Schema),
    defaultValues: {
      photosRadio: defaultPhotos,
      stls: defaultStls, // Ensure that default STL values are correctly passed
    },
  });

  const [patientImageUrls, setPatientImageUrls] = useState<{
    [key: string]: string;
  }>({});
  const [patientStlUrls, setPatientStlUrls] = useState<{
    [key: string]: string;
  }>({});
  const [, setErrorLoading] = useAtom(errorLoadingAtom);
  const { user } = useAuth();

  useEffect(() => {
    trigger(); // Trigger form validation
  }, [trigger]);

  useEffect(() => {
    setErrorLoading((prev) => ({ ...prev, isValid }));
  }, [isValid, setErrorLoading]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get(
          `/cases/images?caseId=${formData.caseId}`
        );
        if (!response) {
          throw new Error('Failed to fetch images');
        }
        const data: any = await response.data;
        const imageUrls = Object.values(data);

        const updatedPhotos: any = Array.from(
          { length: 2 },
          (_, index) => imageUrls[index] || ''
        );

        setValue('photosRadio', updatedPhotos);
        setFormData((prevFormData) => ({
          ...prevFormData,
          photosRadio: updatedPhotos,
        }));

        setPatientImageUrls((prevUrls) => ({ ...prevUrls, ...data }));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    const fetchStls = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cases/stls?caseId=${formData.caseId}`
        );
        if (!response) {
          throw new Error('Failed to fetch stls');
        }
        const data: any = await response.data;
        const stlUrls = Object.values(data);

        const updatedStls: any = Array.from(
          { length: 3 },
          (_, index) => stlUrls[index] || ''
        );

        setValue('stls', updatedStls);
        setFormData((prevFormData) => ({
          ...prevFormData,
          stls: updatedStls,
        }));

        setPatientStlUrls((prevUrls) => ({ ...prevUrls, ...data }));
      } catch (error) {
        console.log('Error fetching stls: ', error);
      }
    };

    if (user) {
      fetchImages();
      fetchStls().then(() => {
        trigger(); // Re-trigger form validation after STL files are fetched
      });
    }
  }, [user]);

  const onSubmit = (data: any) => {
    const currentPhotos = getValues('photosRadio');
    setFormData((prev) => ({ ...prev, ...data, photosRadio: currentPhotos }));
    gotoNextStep();
  };

  return (
    <>
      <form
        id={`rhf-${step.toString()}`}
        onSubmit={handleSubmit(onSubmit)}
        className="col-span-full grid gap-6 rounded-lg bg-white p-5 @5xl:col-span-7 dark:bg-gray-800"
      >
        <FormSummary
          title="Images Radiographie"
          description=" Inclure les images radiographie du patient pour mieux comprendre le cas."
          className="col-span-full justify-center text-center @5xl:col-span-5"
        />

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
          {Object.entries(radiographyImageNames).map(
            ([name, url], index: any) => (
              <FormGroup
                key={name}
                title={`${getImageDisplayName(name)}`}
                className="flex flex-col justify-center pt-7 text-center @2xl:pt-9 @3xl:pt-11 md:col-span-6 "
              >
                <AvatarUpload
                  key={index}
                  index={index}
                  name={`photos.${index}`}
                  setValue={setValue}
                  getValues={getValues}
                  placeholderImg={patientImageUrls[name] || url}
                  caseId={formData.caseId}
                  imageIndex={name}
                  register={register}
                  session={user}
                  setFormData={setFormData}
                  photosRadio={true}
                />
              </FormGroup>
            )
          )}
        </div>

        <div className="col-span-full mt-8 justify-center text-center text-base text-black @5xl:col-span-5">
          <article className="mt-4 @3xl:mt-9">
            <h1 className="space-y-4 text-xl text-black @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl">
              Fichiers STLs
            </h1>
            <p className="mt-3 text-sm leading-relaxed @3xl:text-base">
              Inclure les fichiers STL du patient pour mieux comprendre le cas.
            </p>
          </article>
        </div>

        <div className="grid grid-cols-12 items-stretch gap-4">
          <div className="col-span-4 flex flex-col space-y-10">
            {['custom_file_1', 'custom_file_2', 'custom_file_3'].map(
              (fileKey, index) => (
                <CustomUploadZone
                  stlDisplayName={getStlDisplayName}
                  index={index}
                  key={fileKey}
                  register={register}
                  name={fileKey}
                  setValue={setValue}
                  getValues={getValues}
                  caseId={formData.caseId}
                  imageIndex={fileKey}
                  typeStl={true}
                  stlLink={patientStlUrls[fileKey]}
                  data={patientStlUrls}
                  setData={setPatientStlUrls}
                  session={user}
                  setFormData={setFormData}
                  trigger={trigger}
                />
              )
            )}
            <div className="col-span-12 mt-4 text-center">
              <p className="text-red-600">
                Rentrez et téléchargez les 3 fichiers stls
              </p>
            </div>
          </div>

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
                Object.entries(patientStlUrls).map(([fileKey, url], idx) =>
                  url ? (
                    <SwiperSlide key={idx}>
                      <StlFileDisplay
                        title={`Fichier STL N° ${parseInt(idx) + 1}`}
                        url={url}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      />
                    </SwiperSlide>
                  ) : null
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
      </form>
    </>
  );
}
