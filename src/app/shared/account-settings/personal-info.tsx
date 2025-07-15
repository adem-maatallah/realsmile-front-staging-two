'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { SubmitHandler, Controller, useForm } from 'react-hook-form';
import { PiClock, PiEnvelopeSimple } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Loader, Text, Input, Select } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import {
  personalInfoFormSchema,
  PersonalInfoFormTypes,
} from '@/utils/validators/personal-info.schema';
import { signIn } from 'next-auth/react';
import ProfileAvatarUpload from '@/components/ui/file-upload/profile-avatar-upload';
import { useState } from 'react';
import PhoneNumber from '@/components/ui/phone-input';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import SpecialityIcon from '@/components/custom-icons/speciality-icon';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function PersonalInfoView() {
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    user?.profile_pic
  );
  const initialValues = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    user_name: user?.user_name || '',
    email: user?.email || '',
    profile_pic: user?.profile_pic || '',
    country: !user?.country || user?.country == 'null' ? 'FR' : user?.country,
    phone: user?.phone || '',
    speciality: user?.speciality || '',
    office_phone: user?.office_phone || '',
    address: user?.address || '',
    address_2: user?.address_2 || '',
    city: user?.city || '',
    zip: user?.zip || '',
  };
  const router = useRouter();
  const {
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    mode: 'onTouched',
    resolver: personalInfoFormSchema,
  });
  const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data: any) => {
    setIsLoading(true);

    let payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      user_name: data.user_name,
      email: data.email,
      phone: data.phone,
      profile_pic: data.profile_pic,
      country: data.country,
    };

    if (user?.role === 'doctor') {
      payload = {
        ...payload,
        speciality: data.speciality,
        office_phone: data.office_phone,
        address: data.address,
        address_2: data.address_2,
        city: data.city,
        zip: data.zip,
      };
    }

    const updateProfile = async () => {
      const response = await axiosInstance.put(
        `/updateMe`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response) {
        throw new Error('Failed to update profile');
      }
      return response.data;
    };

    toast
      .promise(updateProfile(), {
        loading: 'Updating profile...',
        success: async (apiResponse: any) => {
          // let userData: any = {
          //   id: newUser.data.user.id,
          //   first_name: newUser.data.user.first_name,
          //   last_name: newUser.data.user.last_name,
          //   user_name: newUser.data.user.user_name || null,
          //   email: newUser.data.user.email,
          //   phone: newUser.data.user.phone,
          //   phone_verified: newUser.data.user.phone_verified,
          //   status: newUser.data.user.status,
          //   firebase_uuid: newUser.data.user.firebase_uuid,
          //   profile_pic: newUser.data.user.profile_pic,
          //   two_factor_enabled: newUser.data.user.two_factor_enabled,
          //   token: newUser.data.token,
          //   tokenExpires: newUser.data.user.tokenExpires,
          //   role: newUser.data.user.role,
          //   role_id: newUser.data.user.role_id,
          //   country: newUser.data.user.country,
          //   has_mobile_account: newUser.data.user.has_mobile_account,
          //   redirect: false,
          // };
          // if (userData.role == 'doctor') {
          //   userData = {
          //     ...userData,
          //     speciality: newUser.data.user.speciality,
          //     office_phone: newUser.data.user.office_phone,
          //     address: newUser.data.user.address,
          //     address_2: newUser.data.user.address_2,
          //     city: newUser.data.user.city,
          //     zip: newUser.data.user.zip,
          //   };
          // }
          // signIn('credentials', userData);
        await refreshUserData(); // <--- CRUCIAL CHANGE HERE

          return `Profile updated successfully!`;
        },
        error: (err) => `Failed to update profile: ${err.toString()}`,
      })
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Update error:', error);
        setIsLoading(false);
      });
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Form<PersonalInfoFormTypes>
      className="@container"
      validationSchema={personalInfoFormSchema}
      onSubmit={onSubmit}
      useFormProps={{
        defaultValues: initialValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
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
                <Input
                  {...register('first_name')}
                  placeholder="Prénom"
                  defaultValue={user?.first_name}
                  className="flex-grow"
                />

                <Input
                  {...register('last_name')}
                  placeholder="Nom"
                  defaultValue={user?.last_name}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup
                title="Adresse électronique"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="col-span-full"
                  defaultValue={user?.email || ''}
                  prefix={
                    <PiEnvelopeSimple className="h-6 w-6 text-gray-500" />
                  }
                  type="email"
                  placeholder="georgia.young@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </FormGroup>

              <FormGroup
                title="Nom d'utilisateur et numéro de téléphone"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="flex-grow"
                  prefix={
                    <PiEnvelopeSimple className="h-6 w-6 text-gray-500" />
                  }
                  type="text"
                  defaultValue={
                    user?.user_name ||
                    user?.first_name + '_' + user?.last_name
                  }
                  placeholder="Nom d'utilisateur"
                  {...register('user_name')}
                  error={errors.user_name?.message}
                />

                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Numéro de téléphone est requis' }}
                  render={({
                    field: { onChange, onBlur, value, ref, name },
                    fieldState: { error },
                  }) => (
                    <PhoneNumber
                      labelClassName="font-semibold text-gray-900"
                      placeholder="Ecrire le numéro de téléphone..."
                      onChange={(val, countryData, event, formattedValue) =>
                        onChange(formattedValue)
                      } // or just onChange depending on how you need to handle the input
                      onBlur={onBlur}
                      value={value}
                      error={error?.message}
                      variant="outline"
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
                  <ProfileAvatarUpload
                    name="profile_pic"
                    defaultValue={profilePicture}
                    setValue={setProfilePicture}
                    getValues={getValues}
                    error={errors?.profile_pic?.message as string}
                  />
                </div>
              </FormGroup>
              {user?.role == 'doctor' && (
                <>
                  <FormGroup
                    title="Spécialité et Téléphone de bureau"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Controller
                      name="speciality"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className="flex-grow"
                          options={[
                            { value: 'Omnipratic', label: 'Omnipratic' },
                            { value: 'Orthodontist', label: 'Orthodontist' },
                            { value: 'Oral surgeon', label: 'Oral surgeon' },
                            { value: 'Student', label: 'Student' },
                          ]}
                          {...field}
                          onChange={(option) => field.onChange(option.value)}
                          value={field.value}
                          prefix={<SpecialityIcon className="w-5" />}
                        />
                      )}
                    />
                    <Controller
                      name="office_phone"
                      control={control}
                      rules={{ required: 'Numéro de téléphone est requis' }}
                      render={({
                        field: { onChange, onBlur, value, ref, name },
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
                        />
                      )}
                    />
                  </FormGroup>
                  <FormGroup
                    title="Votre Adresse"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Input
                      {...register('address')}
                      placeholder="Adresse"
                      className="flex-grow"
                      error={errors.address?.message}
                    />

                    <Input
                      {...register('address_2')}
                      placeholder="Adresse 2"
                      className="flex-grow"
                      error={errors.address_2?.message}
                    />
                  </FormGroup>
                  <FormGroup
                    title="Ville et Code postal"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Input
                      {...register('city')}
                      placeholder="Ville"
                      className="flex-grow"
                      error={errors.city?.message}
                    />

                    <Input
                      {...register('zip')}
                      placeholder="Code postal"
                      className="flex-grow"
                      error={errors.zip?.message}
                    />
                  </FormGroup>
                </>
              )}
            </div>

            <FormFooter
              isLoading={isLoading}
              handleAltBtn={() => router.push('/')}
              altBtnText="Annuler"
              submitBtnText="Enregistrer"
            />
          </>
        );
      }}
    </Form>
  );
}