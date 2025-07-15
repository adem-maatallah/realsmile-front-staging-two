'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PiClock, PiEnvelopeSimple } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Loader, Text, Input, Select } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import PhoneNumber from '@/components/ui/phone-input';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import { useRouter, useParams } from 'next/navigation';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import SpecialityIcon from '@/components/custom-icons/speciality-icon';

// Import the Zod schema and types
import {
  personalInfoFormSchema,
  PersonalInfoFormTypes,
} from '@/utils/validators/personal-info.schema';
import UpdateUserAvatarUpload from '@/components/ui/file-upload/update-user-avatar-upload';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';
import ProfileAvatarUpload from '@/components/ui/file-upload/profile-avatar-upload';

export default function PersonalInfoView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [initialValues, setInitialValues] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance(`/users/${id}`);
        const res = response.data;
        const userData = res.data;
        const fetchedValues = {
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          user_name:
            userData.user_name ||
            `${userData.first_name}_${userData.last_name}`,
          email: userData.email || '',
          profile_pic: userData.profile_pic || '',
          country: userData.country || 'FR',
          phone: userData.phone || '',
          speciality: userData.doctors?.speciality || '', // Ensure speciality is fetched
          office_phone: userData.doctors?.office_phone || '',
          address: userData.doctors?.address || '',
          address_2: userData.doctors?.address_2 || '',
          city: userData.doctors?.city || '',
          zip: userData.doctors?.zip || '',
          role: userData.role || '',
        };

        setInitialValues(fetchedValues);
        setProfilePicture(userData.profile_pic || '');
      }catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) {
      fetchUserData();
    }
  }, [id, user]);

  const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data) => {
    // Debug the data to ensure it's correct at this point

    setIsLoading(true);

    let payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      user_name: data.user_name,
      email: data.email,
      phone: data.phone.replace(/\s+/g, ''), // Ensure the updated phone number is used here
      country: data.country,
    };

    if (initialValues?.role === 'doctor') {
      payload = {
        ...payload,
        speciality: data.speciality, // Ensure speciality is included for doctors
        office_phone: data.office_phone.replace(/\s+/g, ''),
        address: data.address,
        address_2: data.address_2,
        city: data.city,
        zip: data.zip,
      };
    }

    try {
      const response = await axiosInstance.put(
        `/users/${id}`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Profile updated successfully');
      router.push('/users');
    } catch (error) {
      console.error('API Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !initialValues) {
    return <LoadingSpinner />;
  }

  const isHachem = user?.role === 'hachem';

  return (
    <Form<PersonalInfoFormTypes>
      onSubmit={onSubmit}
      resetValues={initialValues}
      validationSchema={personalInfoFormSchema}
      className="@container"
    >
      {({ control, getValues, formState: { errors } }) => (
        <>
          <FormGroup
            title="Informations personnelles"
            description="Mettez à jour votre photo et vos informations personnelles ici."
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <FormGroup
              title="Nom"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Prénom"
                    className="flex-grow"
                    disabled={isHachem}
                  />
                )}
              />
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nom"
                    className="flex-grow"
                    disabled={isHachem}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Adresse électronique"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="col-span-full"
                    prefix={
                      <PiEnvelopeSimple className="h-6 w-6 text-gray-500" />
                    }
                    type="email"
                    placeholder="georgia.young@example.com"
                    error={errors.email?.message}
                    disabled={isHachem}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Nom d'utilisateur et numéro de téléphone"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                name="user_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="flex-grow"
                    prefix={
                      <PiEnvelopeSimple className="h-6 w-6 text-gray-500" />
                    }
                    type="text"
                    placeholder="Nom d'utilisateur"
                    error={errors.user_name?.message}
                    disabled={isHachem}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                rules={{ required: 'Numéro de téléphone est requis' }}
                render={({
                  field: { onChange, onBlur, value, ref },
                  fieldState: { error },
                }) => (
                  <PhoneNumber
                    labelClassName="font-semibold text-gray-900"
                    placeholder="Ecrire le numéro de téléphone..."
                    onChange={(val, countryData, event, formattedValue) => {
                      onChange(formattedValue); // Ensure form state is updated with the new phone number
                    }}
                    onBlur={onBlur}
                    value={value} // Ensure the correct value is displayed
                    error={error?.message}
                    variant="outline"
                    ref={ref}
                    disabled={isHachem}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Pays"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <CountrySelector
                    label="Pays"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    open={isOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                    selectedValue={
                      COUNTRIES.find(
                        (c) =>
                          c.value === (field.value || initialValues?.country)
                      ) || {}
                    }
                    disabled={isHachem}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Votre photo"
              description="Elle sera affichée sur votre profil."
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <div className="flex flex-col gap-6 @container @3xl:col-span-2">
                <UpdateUserAvatarUpload
                  name="profile_pic"
                  defaultValue={profilePicture}
                  setValue={setProfilePicture}
                  getValues={getValues}
                  error={errors?.profile_pic?.message as string}
                  disabled={isHachem}
                  userId={id}
                />
              </div>
            </FormGroup>
            {initialValues?.role === 'doctor' && (
              <>
                <FormGroup
                  title="Spécialité et Téléphone du cabinet"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Controller
                    name="speciality"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="flex-grow"
                        options={[
                          { value: 'Omnipratic', label: 'Omnipratic' },
                          { value: 'Orthodontist', label: 'Orthodontist' },
                          { value: 'Oral surgeon', label: 'Oral surgeon' },
                          { value: 'Student', label: 'Student' },
                        ]}
                        value={field.value} // Make sure this is properly set
                        onChange={(option) => field.onChange(option.label)} // Ensure onChange updates the form state
                        prefix={<SpecialityIcon className="w-5" />}
                        disabled={isHachem}
                      />
                    )}
                  />
                  <Controller
                    name="office_phone"
                    control={control}
                    rules={{ required: 'Numéro de téléphone est requis' }}
                    render={({
                      field: { onChange, onBlur, value, ref },
                      fieldState: { error },
                    }) => (
                      <PhoneNumber
                        country="fr"
                        labelClassName="font-semibold text-gray-900"
                        placeholder="Ecrire le numéro de téléphone..."
                        onChange={(val, countryData, event, formattedValue) =>
                          onChange(formattedValue)
                        }
                        onBlur={onBlur}
                        value={value}
                        error={error?.message}
                        variant="outline"
                        ref={ref}
                        disabled={isHachem}
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup
                  title="Votre Adresse"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Adresse"
                        className="flex-grow"
                        error={errors.address?.message}
                        disabled={isHachem}
                      />
                    )}
                  />
                  <Controller
                    name="address_2"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Adresse 2"
                        className="flex-grow"
                        error={errors.address_2?.message}
                        disabled={isHachem}
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup
                  title="Ville et Code postal"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Ville"
                        className="flex-grow"
                        error={errors.city?.message}
                        disabled={isHachem}
                      />
                    )}
                  />
                  <Controller
                    name="zip"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Code postal"
                        className="flex-grow"
                        error={errors.zip?.message}
                        disabled={isHachem}
                      />
                    )}
                  />
                </FormGroup>
              </>
            )}
          </div>

          <FormFooter
            isLoading={isLoading}
            handleAltBtn={() => router.back()}
            altBtnText="Annuler"
            submitBtnText="Enregistrer"
            disabled={isHachem}
          />
        </>
      )}
    </Form>
  );
}
