import {useAtom} from 'jotai';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import FormSummary from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1/form-summary';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import {
    formDataAtom,
    useStepperOne,
} from '@/app/shared/custom-realsmile-components/multiStepCreation/case/multi-step-1';
import {
    FormStep2Schema,
    formStep2Schema,
} from '@/utils/validators/multistep-form.schema';
import FormGroup from '@/app/shared/form-group';
import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {errorLoadingAtom} from '@/store/multistep-atom';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';
export default function StepTwo() {
    const {step, gotoNextStep} = useStepperOne();
    const [formData, setFormData] = useAtom(formDataAtom);
    const [patientImageUrls, setPatientImageUrls] = useState<{
        [key: string]: string;
    }>({});
    const {user} = useAuth();
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
                    {length: 8},
                    (_, index) => imageUrls[index] || ''
                );

                setValue('photos', updatedPhotos);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    photos: updatedPhotos,
                }));

                setPatientImageUrls((prevUrls) => ({...prevUrls, ...data}));
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, [formData.caseId, user, setFormData]);

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

    const getImageDisplayName = (imageName: any) => {
        const imageNames: any = {
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

    const initialPhotoCount = 8;

    const defaultPhotos = Array.from(
        {length: initialPhotoCount},
        (_, index) => formData.photos[index] || ''
    );

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        formState: {errors, isValid},
    } = useForm<FormStep2Schema>({
        resolver: zodResolver(formStep2Schema),
        defaultValues: {
            photos: defaultPhotos,
        },
        mode: 'all',
    });

    const [, setErrorLoading] = useAtom(errorLoadingAtom);
    useEffect(() => {
        trigger();
    }, [trigger]);
    useEffect(() => {
        setErrorLoading((prev) => ({...prev, isValid}));
    }, [isValid, setErrorLoading]);

    const onSubmit = (data: any) => {
        const currentPhotos = getValues('photos');
        setFormData((prev) => ({...prev, ...data, photos: currentPhotos}));
        gotoNextStep();
    };

    const getColumnClass = (index: number) => {
        if ([3].includes(index)) return 'md:col-span-4';
        if ([4].includes(index)) return 'md:col-span-4 md:col-start-9';
        return 'md:col-span-4';
    };

    return (
        <>
            <form
                id={`rhf-${step.toString()}`}
                onSubmit={handleSubmit(onSubmit)}
                className="col-span-full grid gap-6 rounded-lg bg-white p-5 shadow-lg @5xl:col-span-7 dark:bg-gray-800"
            >
                <FormSummary
                    title="Images du patient"
                    description="Votre patient que vous confiez n'est pas simplement une série de données , mais plutôt une histoire a découvrir. En partageant soigneusement les détails , nous sommes en mesure de procéder a un diagnostic complet et de vous propose un plan de traitement sur mesure, parfaitement adapté a votre patient."
                    className="col-span-full justify-center text-center @5xl:col-span-5"
                />
                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                    {Object.entries(patientImageNamesWithPlaceHolderUrls).map(
                        ([name, url], index) => (
                            <FormGroup
                                key={index}
                                title={getImageDisplayName(name)}
                                className={`${getColumnClass(index)} flex flex-col justify-center pt-7 text-center @2xl:pt-9 @3xl:pt-11`}
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
                                />
                                {errors.photos && errors.photos[index] && (
                                    <div className="mt-2 text-sm text-red-500">
                                        {errors.photos[index]?.message}
                                    </div>
                                )}
                            </FormGroup>
                        )
                    )}
                </div>
            </form>
        </>
    );
}
