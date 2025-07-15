'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Button, Text, Select, Password, Checkbox } from 'rizzui';
import PhoneNumber from '@/components/ui/phone-input';
import { PiArrowRightBold } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { COUNTRIES } from '@/components/custom-realsmile-components/countries';
import CountrySelector from '@/components/custom-realsmile-components/country-selector';
import Upload from '@/components/ui/upload';
import EmailIcon from '@/components/custom-icons/email-icon';
import PasswordIcon from '@/components/custom-icons/password-icon';
import SpecialityIcon from '@/components/custom-icons/speciality-icon';
import CityIcon from '@/components/custom-icons/city-icon';
import PasswordConfirmationIcon from '@/components/custom-icons/password-confirmation-icon';
import AdressIcon from '@/components/custom-icons/adress-1-icon';
import UserIcon from '@/components/custom-icons/user-icon';
import Link from 'next/link';
import { parsePhoneNumberFromString } from 'libphonenumber-js'; // Import the libphonenumber-js library
import axiosInstance from '@/utils/axiosInstance';

interface PhoneVerificationFormValues {
  phone: string;
  otp: string;
}

interface SignUpFormValues {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  office_phone: string;
  speciality: string;
  address: string;
  address_2: string;
  city: string;
  zip: string;
  country: string;
  profile_picture: FileList | null;
  is_agreed: boolean;
}

export default function SignUpWithOTP() {
  const [step, setStep] = useState(1); // 1 for phone verification, 2 for OTP input, 3 for sign-up
  const [phone, setPhone] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>('fr'); // Country code for the phone, default to 'fr'
  const [isOpen, setIsOpen] = useState(false); // For country selection
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // Countdown for Resend OTP
  const router = useRouter();

  // For Step 1 and 2
  const phoneVerificationForm = useForm<PhoneVerificationFormValues>();
  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmitForm,
    formState: { errors: phoneErrors },
  } = phoneVerificationForm;

  // For Step 3
  const signUpForm = useForm<SignUpFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
      phone: '',
      office_phone: '',
      speciality: '',
      address: '',
      address_2: '',
      city: '',
      zip: '',
      country: 'fr', // Initialize with 'fr' (France)
      profile_picture: null,
      is_agreed: false,
    },
  });
  const {
    control: signUpControl,
    handleSubmit: handleSignUpFormSubmit,
    setValue: setSignUpValue,
    formState: { errors: signUpErrors },
  } = signUpForm;

  // Function to extract the country code using libphonenumber-js
  const getCountryCode = (phone: string) => {
    const parsedPhoneNumber = parsePhoneNumberFromString(phone);
    return parsedPhoneNumber ? parsedPhoneNumber.country : 'FR'; // Default to France if no country found
  };

  useEffect(() => {
    if (phone) {
      setSignUpValue('phone', phone);
    }
    if (phone) {
      const extractedCountryCode = getCountryCode(phone);
      setCountryCode(
        extractedCountryCode ? extractedCountryCode.toLowerCase() : 'FR'
      ); // Ensure lowercase for compatibility
      setSignUpValue('country', extractedCountryCode.toLowerCase()); // Set the country code in Step 3
    }
  }, [phone, setSignUpValue]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Submit phone number and request OTP
  const handlePhoneSubmit = async (data: { phone: string }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/doctors/send-otp`,
        JSON.stringify({ phone: data.phone }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        setPhone(data.phone); // Store the correctly formatted phone number
        setCountryCode(getCountryCode(data.phone).toLowerCase()); // Extract and set country code
        setStep(2);
        setCountdown(60); // Start countdown for 60 seconds
        toast.success('OTP envoyé à votre téléphone.');
      } else {
        toast.error("Erreur lors de l'envoi de l'OTP.");
      }
    } catch (error) {
      toast.error("Erreur serveur lors de l'envoi de l'OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the OTP and set country based on phone number prefix
  const handleOtpSubmit = async (data: { otp: string }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/doctors/verify-otp`,
        JSON.stringify({ phone, otp: data.otp }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        // Set country based on phone number prefix
        let country = 'FR'; // Default to France
        if (phone?.startsWith('+216')) {
          country = 'TN'; // Tunisia
        } else if (phone?.startsWith('+212')) {
          country = 'MA'; // Morocco
        }

        // Set country code in both state and react-hook-form
        setCountryCode(country);
        setSignUpValue('country', country); // Set in react-hook-form

        setStep(3); // Move to sign-up step after successful verification
        toast.success('OTP vérifié avec succès.');
      } else {
        toast.error('OTP invalide.');
      }
    } catch (error) {
      toast.error("Erreur serveur lors de la vérification de l'OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle sign-up form submission
  const handleSignUpSubmit = async (data: SignUpFormValues) => {
    setLoading(true);
    try {
      data.phone = phone; // Ensure that the verified phone number is used
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'profile_picture' && data.profile_picture) {
          formData.append('profile_picture', data.profile_picture[0]);
        } else if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      const response = await axiosInstance.post(
        `/doctors`,
        formData
      );

      if (response) {
        router.push('/signin');
        toast.success('Compte créé avec succès.');
      } else {
        toast.error('Erreur lors de la création du compte.');
      }
    } catch (error) {
      toast.error('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Re-send OTP logic
    if (phone) {
      await handlePhoneSubmit({ phone });
    }
  };

  return (
    <>
      {step === 1 && (
        // Step 1: Phone number input
        <form onSubmit={handlePhoneSubmitForm(handlePhoneSubmit)}>
          <Controller
            name="phone"
            control={phoneControl}
            render={({ field }) => (
              <PhoneNumber
                label="Numéro de téléphone"
                placeholder="Entrez votre numéro de téléphone"
                country={'fr'}
                value={field.value}
                onChange={(value, countryData, event, formattedValue) => {
                  const formattedNumber = formattedValue.replace(/\s+/g, '');
                  field.onChange(formattedNumber);
                }}
                error={phoneErrors.phone?.message}
              />
            )}
          />
          <Button isLoading={loading} className="mt-4" type="submit">
            <span>Envoyer OTP</span>
            <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
          </Button>
        </form>
      )}

      {step === 2 && (
        // Step 2: OTP verification input
        <form onSubmit={handlePhoneSubmitForm(handleOtpSubmit)}>
          <Controller
            name="otp"
            control={phoneControl}
            rules={{
              required: 'Le code OTP est requis.',
              minLength: {
                value: 6,
                message: 'Le code OTP doit contenir exactement 6 chiffres.',
              },
              maxLength: {
                value: 6,
                message: 'Le code OTP doit contenir exactement 6 chiffres.',
              },
              pattern: {
                value: /^[0-9]+$/,
                message:
                  'Le code OTP doit être composé uniquement de chiffres.',
              },
            }}
            render={({ field }) => (
              <Input
                label="Code OTP"
                placeholder="Entrez le code OTP"
                rounded="pill"
                {...field}
                error={phoneErrors.otp?.message} // Display validation error
              />
            )}
          />
          <Button isLoading={loading} className="mt-4" type="submit">
            <span>Vérifier OTP</span>
            <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
          </Button>
          <Button
            onClick={handleResendOtp}
            className="mt-4"
            disabled={countdown > 0}
          >
            <span>
              {countdown > 0 ? `Renvoyer OTP (${countdown}s)` : 'Renvoyer OTP'}
            </span>
          </Button>
        </form>
      )}

      {step === 3 && (
        <>
          <form
            onSubmit={handleSignUpFormSubmit(handleSignUpSubmit)}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <Controller
              name="first_name"
              control={signUpControl}
              rules={{
                required: 'Le prénom est requis.',
                maxLength: {
                  value: 50,
                  message: 'Le prénom ne peut pas dépasser 50 caractères.',
                },
              }}
              render={({ field }) => (
                <Input
                  label="Nom"
                  placeholder="Nom"
                  rounded="pill"
                  {...field}
                  error={signUpErrors.first_name?.message}
                  prefix={<UserIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="last_name"
              control={signUpControl}
              rules={{
                required: 'Le nom est requis.',
                maxLength: {
                  value: 50,
                  message: 'Le nom ne peut pas dépasser 50 caractères.',
                },
              }}
              render={({ field }) => (
                <Input
                  label="Prénom"
                  placeholder="Prénom"
                  rounded="pill"
                  {...field}
                  error={signUpErrors.last_name?.message}
                  prefix={<UserIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="email"
              control={signUpControl}
              rules={{
                required: "L'email est requis.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Veuillez fournir une adresse email valide.',
                },
              }}
              render={({ field }) => (
                <Input
                  type="email"
                  label="Email"
                  placeholder="Email"
                  rounded="pill"
                  {...field}
                  error={signUpErrors.email?.message}
                  prefix={<EmailIcon className="w-5" />}
                />
              )}
            />
            <label className="block">
              <span className="rizzui-input-label mb-1.5 block text-sm font-medium">
                Pays
              </span>
              <Controller
                control={signUpControl}
                name="country"
                rules={{
                  required: 'Le pays est requis.',
                }}
                render={({ field }) => (
                  <Controller
                    control={signUpControl}
                    name="country"
                    render={({ field }) => (
                      <CountrySelector
                        label="Pays"
                        value={countryCode || field.value} // Use countryCode or field value from form
                        onChange={(value) => field.onChange(value)}
                        open={isOpen}
                        onToggle={() => setIsOpen(!isOpen)}
                        selectedValue={
                          COUNTRIES.find((c) => c.value === field.value) || {}
                        }
                        error={signUpErrors.country?.message}
                      />
                    )}
                  />
                )}
              />
              {signUpErrors.country && (
                <Text className="mt-1 text-sm text-red-600">
                  {signUpErrors.country.message}
                </Text>
              )}
            </label>
            <Controller
              name="password"
              control={signUpControl}
              rules={{
                required: 'Le mot de passe est requis.',
                minLength: {
                  value: 8,
                  message:
                    'Le mot de passe doit contenir au moins 8 caractères.',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                  message:
                    'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.',
                },
              }}
              render={({ field }) => (
                <Password
                  label="Mot de passe"
                  placeholder="Mot de passe"
                  rounded="pill"
                  {...field}
                  error={signUpErrors.password?.message}
                  prefix={<PasswordIcon className="w-6" />}
                />
              )}
            />
            <Controller
              name="password_confirm"
              control={signUpControl}
              rules={{
                required: 'La confirmation du mot de passe est requise.',
                validate: (value) =>
                  value === signUpForm.getValues('password') ||
                  'Les mots de passe ne correspondent pas.',
              }}
              render={({ field }) => (
                <Password
                  label="Confirmation mot de passe"
                  placeholder="Confirmation mot de passe"
                  rounded="pill"
                  {...field}
                  error={signUpErrors.password_confirm?.message}
                  prefix={<PasswordConfirmationIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="phone"
              control={signUpControl}
              rules={{
                required: 'Le numéro de téléphone est requis.',
              }}
              render={({ field }) => (
                <PhoneNumber
                  label="Numéro de téléphone"
                  placeholder="Numéro de téléphone"
                  country={'fr'}
                  value={phone}
                  disabled
                  error={signUpErrors.phone?.message}
                />
              )}
            />
            <Controller
              name="speciality"
              control={signUpControl}
              rules={{
                required: 'La spécialité est requise.',
              }}
              render={({ field }) => (
                <Select
                  label="Specialité"
                  options={[
                    { value: 'Omnipratic', label: 'Omnipratic' },
                    { value: 'Orthodontist', label: 'Orthodontist' },
                    { value: 'Oral surgeon', label: 'Oral surgeon' },
                    { value: 'Student', label: 'Student' },
                  ]}
                  {...field}
                  onChange={(option) => field.onChange(option.value)}
                  value={field.value}
                  error={signUpErrors.speciality?.message}
                />
              )}
            />
            <Controller
              name="office_phone"
              control={signUpControl}
              rules={{
                required: 'Le téléphone du cabinet est requis.',
                pattern: {
                  value: /^[0-9+\- ]+$/,
                  message: 'Le numéro de téléphone est invalide.',
                },
              }}
              render={({ field }) => (
                <PhoneNumber
                  label="Téléphone du cabinet"
                  placeholder="Téléphone du cabinet"
                  country={'fr'}
                  {...field}
                  error={signUpErrors.office_phone?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={signUpControl}
              rules={{
                required: "L'adresse est requise.",
                maxLength: {
                  value: 100,
                  message: "L'adresse ne peut pas dépasser 100 caractères.",
                },
              }}
              render={({ field }) => (
                <Input
                  label="Adresse"
                  placeholder="Adresse"
                  {...field}
                  error={signUpErrors.address?.message}
                  prefix={<AdressIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="address_2"
              control={signUpControl}
              render={({ field }) => (
                <Input
                  label="Adresse 2"
                  placeholder="Adresse 2"
                  {...field}
                  error={signUpErrors.address_2?.message}
                  prefix={<AdressIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="city"
              control={signUpControl}
              rules={{
                required: 'La ville est requise.',
                maxLength: {
                  value: 50,
                  message: 'La ville ne peut pas dépasser 50 caractères.',
                },
              }}
              render={({ field }) => (
                <Input
                  label="Ville"
                  placeholder="Ville"
                  {...field}
                  error={signUpErrors.city?.message}
                  prefix={<AdressIcon className="w-5" />}
                />
              )}
            />
            <Controller
              name="zip"
              control={signUpControl}
              rules={{
                required: 'Le code postal est requis.',
                pattern: {
                  value: /^[0-9]+$/,
                  message:
                    'Le code postal doit contenir uniquement des chiffres.',
                },
              }}
              render={({ field }) => (
                <Input
                  label="ZIP"
                  placeholder="ZIP"
                  {...field}
                  error={signUpErrors.zip?.message}
                  prefix={<CityIcon className="w-5" />}
                />
              )}
            />
            <label className="col-span-2">
              <span className="rizzui-input-label mb-1.5 block text-sm font-medium">
                Photo de profil
              </span>
              <Controller
                name="profile_picture"
                control={signUpControl}
                render={({ field }) => (
                  <Upload
                    accept="image/*"
                    onChange={(files) => field.onChange(files)}
                    error={signUpErrors.profile_picture?.message}
                    maxSize={5 * 1024 * 1024} // 5 MB
                  />
                )}
              />
              {signUpErrors.profile_picture && (
                <Text className="mt-1 text-sm text-red-600">
                  {signUpErrors.profile_picture.message}
                </Text>
              )}
            </label>
            <Controller
              name="is_agreed"
              control={signUpControl}
              rules={{
                required: 'Vous devez accepter les termes et conditions.',
              }}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  label="Accepter les termes et conditions"
                  error={signUpErrors.is_agreed?.message}
                />
              )}
            />
            <Button
              isLoading={loading}
              className="col-span-2 w-full"
              type="submit"
            >
              <span>S'inscrire</span>
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </form>
        </>
      )}
    </>
  );
}
