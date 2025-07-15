'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PinCode, Button } from 'rizzui';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { getDecryptedCookie } from '@/utils/secure-storage';
import Image from 'next/image';
import PhoneNumber from '@/components/ui/phone-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

type FormValues = {
  otp: string;
  phone?: string;
};

export default function OtpForm({ setMessage }: any) {
  const router = useRouter();
  const { register, setValue, watch, handleSubmit } = useForm<FormValues>();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const [countryCode, setCountryCode] = useState('');
  const { refreshUserData } = useAuth();

  useEffect(() => {
    async function initializePhone() {
      const phoneDataJSON = getDecryptedCookie('userPhone');
      const phoneData: any = phoneDataJSON ? JSON.parse(phoneDataJSON) : null;
      setUserId(phoneData?.id);

      if (!phoneData || !phoneData.phone) {
        setMessage(
          'Veuillez entrer votre numéro de téléphone pour recevoir un code OTP.'
        );
        setShowPhoneInput(true);
      } else {
        const parsedPhone = parsePhoneNumberFromString(phoneData.phone);
        if (parsedPhone) {
          setCountryCode(parsedPhone.countryCallingCode);
          setPhone(phoneData.phone);
          sendOtp(phoneData.phone);
          setMessage(
            'Nous vous avons envoyé un code unique via un SMS. Veuillez entrer votre OTP'
          );
          setShowPhoneInput(false);
        } else {
          setMessage('Numéro de téléphone invalide.');
        }
      }
      setShowForm(true);
    }
    initializePhone();
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    const toastId = toast.loading('Envoi du OTP en cours...');
    try {
      const response = await axiosInstance.post(
        `/sendPhoneVerification`,
        JSON.stringify({ phone: phoneNumber }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data: any = await response.data;
      if (!response) {
        throw new Error(data.message || "Échec de l'envoi du OTP");
      }
      toast.success('OTP envoyé avec succès !', { id: toastId });
      setPhone(phoneNumber);
      setShowPhoneInput(false);
      setTimer(60);
    } catch (error: any) {
      toast.error("Échec de l'envoi du OTP: " + error.message, { id: toastId });
    }
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (showPhoneInput) {
      if (data.phone) {
        const parsedPhone = parsePhoneNumberFromString(data.phone);
        if (parsedPhone) {
          setCountryCode(parsedPhone.countryCallingCode);
          sendOtp(data.phone);
        } else {
          toast.error('Numéro de téléphone invalide.');
        }
      } else {
        toast.error('Veuillez entrer un numéro de téléphone.');
      }
      return;
    }

    if (!phone) {
      toast.error('Le numéro de téléphone est manquant.');
      return;
    }
    const toastId = toast.loading('Vérification du OTP en cours...');
    try {
      const response = await axiosInstance.post(
        `/login-sms`,
        JSON.stringify({ phone, otp: data.otp, id: userId }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const result: any = await response.data;
      if (!response) {
        throw new Error('Échec de la vérification.');
      }
      // let userData: any = {
      //   id: result.data.user.id,
      //   first_name: result.data.user.first_name,
      //   last_name: result.data.user.last_name,
      //   user_name: result.data.user.user_name || null,
      //   email: result.data.user.email,
      //   phone: result.data.user.phone,
      //   phone_verified: result.data.user.phone_verified,
      //   status: result.data.user.status,
      //   firebase_uuid: result.data.user.firebase_uuid,
      //   profile_pic: result.data.user.profile_pic,
      //   two_factor_enabled: result.data.user.two_factor_enabled,
      //   token: result.data.token,
      //   tokenExpires: result.data.user.tokenExpires,
      //   role: result.data.user.role,
      //   role_id: result.data.user.role_id,
      //   country: result.data.user.country,
      //   has_mobile_account: result.data.user.has_mobile_account,
      //   redirect: false,
      // };
      // if (userData.role == 'doctor') {
      //   userData = {
      //     ...userData,
      //     speciality: result.data.user.speciality,
      //     office_phone: result.data.user.office_phone,
      //     address: result.data.user.address,
      //     address_2: result.data.user.address_2,
      //     city: result.data.user.city,
      //     zip: result.data.user.zip,
      //   };
      // }
      // await signIn('credentials', userData);
      await refreshUserData()
      router.push('/');
      toast.success('OTP vérifié avec succès !', { id: toastId });
    } catch (error: any) {
      toast.error(`Échec de la vérification : ${error.message}`, {
        id: toastId,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {showForm && (
        <div className="space-y-10">
          {!showPhoneInput && (
            <div className="flex justify-center">
              <Image
                src="https://storage.googleapis.com/realsmilefiles/staticFolder/verifyOtp.png"
                width={100}
                height={100}
                alt="Vérification du OTP"
              />
            </div>
          )}
          {showPhoneInput ? (
            <div>
              <PhoneNumber
                label="Numéro de téléphone"
                labelClassName="font-semibold text-gray-900"
                placeholder="Ecrire le numéro de téléphone..."
                {...register('phone')}
                onChange={(val, countryData, event, formattedValue) => {
                  setValue('phone', formattedValue);
                  const parsedPhone =
                    parsePhoneNumberFromString(formattedValue);
                  if (parsedPhone) {
                    setCountryCode(parsedPhone.countryCallingCode);
                  }
                }}
                variant="outline"
                country="fr"
              />
              <Button
                className="mt-4 w-full min-w-[200px] whitespace-nowrap px-3 py-2 text-xs font-medium"
                type="button"
                onClick={() => sendOtp(watch('phone'))}
                disabled={!watch('phone')}
              >
                Envoyer le code
              </Button>
            </div>
          ) : (
            <div>
              <PinCode
                length={6}
                variant="outline"
                setValue={(value: any) => {
                  setValue('otp', value);
                  setOtp(value);
                }}
                size="lg"
                className="lg:justify-start"
              />
              <Button
                className="mt-4 w-full min-w-[200px] whitespace-nowrap px-3 py-2 text-xs font-medium"
                type="submit"
                disabled={!otp || otp.length < 6}
              >
                Vérifier le OTP
              </Button>
              <Button
                className="mt-4 w-full min-w-[200px] whitespace-nowrap px-3 py-2 text-xs font-medium"
                type="button"
                onClick={() => phone && sendOtp(phone)}
                disabled={timer > 0}
              >
                {timer > 0 ? `Renvoyer le OTP (${timer}s)` : 'Renvoyer le OTP'}
              </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
