// src/app/shared/personal-info/personal-info-view.tsx

'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { SubmitHandler, Controller, useForm } from 'react-hook-form'; // Keep useForm
import { zodResolver } from '@hookform/resolvers/zod';
import { PiClock, PiEnvelopeSimple } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Loader, Text, Input, Select, Button } from 'rizzui'; // Import Button
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import {
  personalInfoFormSchema,
  PersonalInfoFormTypes,
} from '@/utils/validators/personal-info.schema';
// import { signIn } from 'next-auth/react'; // No direct use for next-auth signIn here based on your auth context setup
// import ProfileAvatarUpload from '@/components/ui/file-upload/profile-avatar-upload'; // This component might not be needed here directly
import { useState, useEffect, useCallback } from 'react'; // Import useEffect and useCallback
import PhoneNumber from '@/components/ui/phone-input';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';
import SpecialityIcon from '@/components/custom-icons/speciality-icon';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
import UpdateUserAvatarUpload from '@/components/ui/file-upload/update-user-avatar-upload'; // Ensure this is correctly used for update

// Re-add DEFAULT_PRESET_COLORS if it's not truly global and you use it here
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3',
  light: '#d39424',
  default: '#d39424',
  dark: '#a16207',
  foreground: '#ffffff',
};

// Define BACKEND_API_BASE_URL correctly for the frontend environment
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PersonalInfoView() {
  const { user, refreshUserData } = useAuth(); // `user` is from AuthContext
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading URL parameters after Google redirect

  const [isLoading, setIsLoading] = useState(false); // For form submission loading
  const [profilePicture, setProfilePicture] = useState(user?.profile_pic); // For avatar upload

  // States for Google Calendar linking feature
  const [isLinkingCalendar, setIsLinkingCalendar] = useState(false);
  const [isCalendarLinked, setIsCalendarLinked] = useState<boolean | null>(null); // null: checking, true: linked, false: not linked
  const [isOpen, setIsOpen] = useState(false); // For CountrySelector dropdown

  // Prepare default values for the form, including the new googleCalendarRefreshToken
  const initialValues: PersonalInfoFormTypes = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    user_name: user?.user_name || '',
    email: user?.email || '',
    profile_pic: user?.profile_pic || '',
    country: !user?.country || user?.country === 'null' ? 'FR' : user?.country,
    phone: user?.phone || '',
    speciality: user?.speciality || '', // Should come from `user` if updated in `createSendToken`
    office_phone: user?.office_phone || '', // Should come from `user` if updated
    address: user?.address || '', // Should come from `user` if updated
    address_2: user?.address_2 || '', // Should come from `user` if updated
    city: user?.city || '', // Should come from `user` if updated
    zip: user?.zip || '', // Should come from `user` if updated
    role: user?.role || '', // Role is important for conditional rendering
    // Add the googleCalendarRefreshToken to the initial values type for consistency
    googleCalendarRefreshToken: user?.googleCalendarRefreshToken || null,
  };

  // React Hook Form setup
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PersonalInfoFormTypes>({
    defaultValues: initialValues,
    mode: 'onTouched',
    resolver: zodResolver(personalInfoFormSchema),
  });

  // Effect to handle the redirect from Google OAuth and display status message
  useEffect(() => {
    const linkedStatus = searchParams.get('calendarLinked');
    const errorParam = searchParams.get('error');
    const detailsParam = searchParams.get('details');

    if (linkedStatus === 'true') {
      setIsCalendarLinked(true);
      toast.success("Votre calendrier Google a été lié avec succès !");
      refreshUserData(); // Refresh user data from backend to get the updated token status
    } else if (linkedStatus === 'false') {
      setIsCalendarLinked(false);
      let errorMessage = "Échec de la liaison du calendrier Google.";
      if (errorParam === 'no_code') errorMessage += " Aucun code d'autorisation reçu.";
      if (errorParam === 'invalid_state') errorMessage += " Erreur d'état lors de l'authentification.";
      if (errorParam === 'no_refresh_token') errorMessage += " Le jeton d'accès permanent n'a pas été accordé. Veuillez accepter toutes les permissions.";
      if (errorParam === 'auth_failed' && detailsParam) errorMessage += ` Détails: ${decodeURIComponent(detailsParam)}`;

      toast.error(errorMessage);
    }

    // Clean up URL parameters after processing to prevent re-triggering messages on refresh
    const currentPath = window.location.pathname;
    if (searchParams.toString()) {
        router.replace(currentPath, { shallow: true });
    }
  }, [searchParams, router, refreshUserData]); // Add refreshUserData to dependencies

  // Set initial calendar linked status based on user data from AuthContext
  useEffect(() => {
    if (user) {
      setIsCalendarLinked(!!user.googleCalendarRefreshToken);
    }
  }, [user]); // Re-evaluate when user object changes (e.g., after refreshUserData)


  const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data) => {
    setIsLoading(true);

    let payload: Record<string, any> = {
      first_name: data.first_name,
      last_name: data.last_name,
      user_name: data.user_name,
      email: data.email,
      phone: data.phone?.replace(/\s+/g, '') || '', // Clean phone number
      country: data.country,
      profile_pic: profilePicture, // Ensure profile picture is sent
    };

    if (user?.role === 'doctor') { // Check role from `user` from context
      payload = {
        ...payload,
        speciality: data.speciality,
        office_phone: data.office_phone?.replace(/\s+/g, '') || '', // Clean office phone
        address: data.address,
        address_2: data.address_2,
        city: data.city,
        zip: data.zip,
      };
    }

    const updateProfile = async () => {
      const response = await axiosInstance.put(
        `${BACKEND_API_BASE_URL}/users/updateMe`, // Corrected endpoint as per your authController.js
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.data) {
        throw new Error('Failed to update profile: No data in response');
      }
      return response.data;
    };

    toast
      .promise(updateProfile(), {
        loading: 'Updating profile...',
        success: async (apiResponse: any) => {
          await refreshUserData(); // CRUCIAL: Refresh user data in context after successful update
          return `Profile updated successfully!`;
        },
        error: (err) => `Failed to update profile: ${err.message || err.toString()}`,
      })
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Update error:', error);
        setIsLoading(false);
      });
  };

  // Handler for the Google Calendar linking button
  const handleLinkGoogleCalendar = useCallback(async () => {
    setIsLinkingCalendar(true);
    toast.dismiss(); // Dismiss any previous toasts

    try {
      // Call your backend endpoint to get the Google Auth URL
      // This matches the `GET /api/contact/google/initiate-calendar-link` route.
      const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/contact/google/initiate-calendar-link`);

      if (response.status === 200 && response.data.authUrl) {
        // Redirect the doctor's browser to Google's consent screen
        window.location.href = response.data.authUrl;
      } else {
        throw new Error(response.data?.message || "Échec de la récupération de l'URL d'authentification.");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'initiation de la liaison Google Calendar:", err);
      const errorMessage = err.response?.data?.message || err.message || "Une erreur inconnue est survenue.";
      toast.error(`Échec de l'initialisation: ${errorMessage}.`);
      setIsLinkingCalendar(false); // Re-enable button if an error occurs before redirect
    }
  }, [BACKEND_API_BASE_URL]);


  // Determine if the current user (from context) is 'hachem' for disabling fields
  const isHachemUser = user?.role === 'hachem';
  // Check if the profile being viewed/edited is 'hachem'
  // Note: user.id from context will be `id` from useParams if current user is viewing their own profile.
  // If an admin is viewing another user's profile, then `initialValues.role` would be the role of the profile being edited.
  // Given your setup for `updateMe`, `isDisabledField` is likely meant for the current logged-in user.
  // If this page can be accessed by admins to edit other users, you'd need more nuanced logic.
  // For now, `isDisabledField` will disable fields if the logged-in user is 'hachem'.
  const isDisabledField = isHachemUser;


  // Show loading spinner if `user` is not yet available from AuthContext
  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Form<PersonalInfoFormTypes>
      onSubmit={onSubmit}
      resetValues={initialValues} // Ensure `resetValues` is set based on `initialValues`
      validationSchema={personalInfoFormSchema}
      className="@container"
      useFormProps={{
        defaultValues: initialValues, // Pass defaultValues here for consistency
      }}
    >
      {({ control, getValues, formState: { errors } }) => { // destructure control and getValues from render prop
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
                  // defaultValue={user?.first_name} // No need for defaultValue with useForm defaultValues
                  className="flex-grow"
                  disabled={isDisabledField}
                />

                <Input
                  {...register('last_name')}
                  placeholder="Nom"
                  // defaultValue={user?.last_name} // No need for defaultValue with useForm defaultValues
                  className="flex-grow"
                  disabled={isDisabledField}
                />
              </FormGroup>

              <FormGroup
                title="Adresse électronique"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="col-span-full"
                  // defaultValue={user?.email || ''} // No need for defaultValue with useForm defaultValues
                  prefix={
                    <PiEnvelopeSimple className="h-6 w-6 text-gray-500" />
                  }
                  type="email"
                  placeholder="georgia.young@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={isDisabledField}
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
                  // defaultValue={user?.user_name || user?.first_name + '_' + user?.last_name} // No need for defaultValue with useForm defaultValues
                  placeholder="Nom d'utilisateur"
                  {...register('user_name')}
                  error={errors.user_name?.message}
                  disabled={isDisabledField}
                />

                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Numéro de téléphone est requis' }}
                  render={({
                    field: { onChange, onBlur, value, ref }, // No need for `name` in field destructuring
                    fieldState: { error },
                  }) => (
                    <PhoneNumber
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
                      disabled={isDisabledField}
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
                      disabled={isDisabledField}
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
                    disabled={isDisabledField}
                    userId={user?.id?.toString()} // Pass user ID as string for consistency with useParams
                  />
                </div>
              </FormGroup>

              {/* DOCTOR-SPECIFIC FIELDS */}
              {user?.role === 'doctor' && ( // Check role from `user` from context
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
                          // defaultValue={user?.speciality} // No need for defaultValue with useForm defaultValues
                          onChange={(option) => field.onChange(option.label)} // Use option.label
                          prefix={<SpecialityIcon className="w-5" />}
                          disabled={isDisabledField}
                        />
                      )}
                    />
                    <Controller
                      name="office_phone"
                      control={control}
                      rules={{ required: 'Numéro de téléphone du cabinet est requis' }}
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState: { error },
                      }) => (
                        <PhoneNumber
                          country="fr" // You might want this to be dynamic based on user's country
                          labelClassName="font-semibold text-gray-900"
                          placeholder="Ecrire le numéro de téléphone du cabinet..."
                          onChange={(val, countryData, event, formattedValue) =>
                            onChange(formattedValue)
                          }
                          onBlur={onBlur}
                          value={value}
                          error={error?.message}
                          variant="outline"
                          ref={ref}
                          disabled={isDisabledField}
                        />
                      )}
                    />
                  </FormGroup>
                  <FormGroup
                    title="Votre Adresse du cabinet"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Input
                      {...register('address')}
                      placeholder="Adresse"
                      // defaultValue={user?.address} // No need for defaultValue with useForm defaultValues
                      className="flex-grow"
                      error={errors.address?.message}
                      disabled={isDisabledField}
                    />
                    <Input
                      {...register('address_2')}
                      placeholder="Adresse 2"
                      // defaultValue={user?.address_2} // No need for defaultValue with useForm defaultValues
                      className="flex-grow"
                      error={errors.address_2?.message}
                      disabled={isDisabledField}
                    />
                  </FormGroup>
                  <FormGroup
                    title="Ville et Code postal du cabinet"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Input
                      {...register('city')}
                      placeholder="Ville"
                      // defaultValue={user?.city} // No need for defaultValue with useForm defaultValues
                      className="flex-grow"
                      error={errors.city?.message}
                      disabled={isDisabledField}
                    />
                    <Input
                      {...register('zip')}
                      placeholder="Code postal"
                      // defaultValue={user?.zip} // No need for defaultValue with useForm defaultValues
                      className="flex-grow"
                      error={errors.zip?.message}
                      disabled={isDisabledField}
                    />
                  </FormGroup>

                  {/* GOOGLE CALENDAR LINKING SECTION */}
                  <FormGroup
                    title="Lier Google Calendar"
                    description="Permettez aux demandes de consultation d'apparaître automatiquement dans votre calendrier."
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <div className="col-span-full">
                      {/* Display linking status */}
                      {isCalendarLinked === true && (
                        <div className="flex items-center text-green-600 font-semibold mb-4">
                          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1_0_001.414_0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Calendrier Google lié.
                        </div>
                      )}
                      {isCalendarLinked === false && (
                        <div className="flex items-center text-red-600 font-semibold mb-4">
                          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1_0_00-1.414 1.414L8.586 10l-1.293 1.293a1 1_0_101.414 1.414L10 11.414l1.293 1.293a1 1_0_001.414-1.414L11.414 10l1.293-1.293a1 1_0_00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          Calendrier Google non lié. Veuillez le lier.
                        </div>
                      )}
                      {isCalendarLinked === null && (
                        <div className="flex items-center text-gray-600 font-semibold mb-4">
                          <Loader variant="pulse" size="sm" className="mr-3" /> {/* Rizzui Loader */}
                          Vérification du statut de liaison du calendrier...
                        </div>
                      )}

                      <Button
                        onClick={handleLinkGoogleCalendar}
                        disabled={isLinkingCalendar || isDisabledField} // Disable if already linking or fields are disabled
                        className="px-6 py-3 flex items-center justify-center text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2"
                        style={{
                          backgroundColor: DEFAULT_PRESET_COLORS.default,
                          borderColor: DEFAULT_PRESET_COLORS.dark,
                          '--tw-ring-color': DEFAULT_PRESET_COLORS.light,
                        } as React.CSSProperties}
                      >
                        {isLinkingCalendar ? (
                          <>
                            <Loader variant="pulse" size="sm" className="mr-3" /> {/* Rizzui Loader */}
                            Redirection vers Google...
                          </>
                        ) : (
                          "Lier mon calendrier Google"
                        )}
                      </Button>
                      {isCalendarLinked === true && (
                        <p className="text-sm text-gray-500 mt-2">
                          Les demandes de consultation seront ajoutées à votre calendrier Google.
                        </p>
                      )}
                    </div>
                  </FormGroup>
                </>
              )}
            </div>

            <FormFooter
              isLoading={isLoading}
              handleAltBtn={() => router.back()}
              altBtnText="Annuler"
              submitBtnText="Enregistrer"
              disabled={isDisabledField}
            />
          </>
        );
      }}
    </Form>
  );
}