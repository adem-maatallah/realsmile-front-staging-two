'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  Text,
  Switch,
  Button,
  Input,
  Modal,
  Title,
  ActionIcon,
  PinCode,
} from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import PhoneNumber from '@/components/ui/phone-input';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function NotificationSettingsView() {
  const { user, refreshUserData } = useAuth();
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  useEffect(() => {
    if (user) {
      const twoFactorEnabled =user.two_factor_enabled;
      setOtpEnabled(twoFactorEnabled);
      setEmailEnabled(user.email_verified);
      setPhoneEnabled(user.phone_verified);
    }
  }, [ user, user?.two_factor_enabled]);

  const openModal = (setting) => {
    setCurrentSetting(setting);
    setIsModalOpen(true);
    setCodeSent(false);

    if (setting === 'phone_verified' && phoneNumber) {
      sendVerificationSMS();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCodeSent(false);
    setShowModalContent(false);
  };

  const handleSwitchChange = (setting) => {
    openModal(setting);
  };

  const sendVerificationSMS = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/sendPhoneVerification`,
         JSON.stringify({ phone: phoneNumber }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        toast.success('SMS envoyé avec succès !');
        setCodeSent(true);
      } else {
        toast.error("Erreur lors de l'envoi du SMS");
        console.error("Échec de l'envoi du SMS");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du SMS:", error);
    }
    setLoading(false);
  };

  const verifyPhoneCode = async () => {
    setLoading(true);
    try {
      const data = {
        code: verificationCode,
        phone: phoneNumber,
      };
      if (currentSetting === 'two_factor_enabled')
        data.two_factor_status = true;
      const response = await axiosInstance.put(
        `/verifyPhoneNumber`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        const updatedUser: any = response.data;
        // let userData: any = {
        //   id: updatedUser.data.user.id,
        //   first_name: updatedUser.data.user.first_name,
        //   last_name: updatedUser.data.user.last_name,
        //   user_name: updatedUser.data.user.user_name || null,
        //   email: updatedUser.data.user.email,
        //   phone: updatedUser.data.user.phone,
        //   phone_verified: updatedUser.data.user.phone_verified,
        //   email_verified: updatedUser.data.user.email_verified,
        //   status: updatedUser.data.user.status,
        //   firebase_uuid: updatedUser.data.user.firebase_uuid,
        //   profile_pic: updatedUser.data.user.profile_pic,
        //   two_factor_enabled: updatedUser.data.user.two_factor_enabled,
        //   token: updatedUser.data.token,
        //   tokenExpires: updatedUser.data.user.tokenExpires,
        //   role: updatedUser.data.user.role,
        //   role_id: updatedUser.data.user.role_id,
        //   country: updatedUser.data.user.country,
        //   has_mobile_account: updatedUser.data.user.has_mobile_account,
        //   redirect: false,
        // };
        // if (userData.role == 'doctor') {
        //   userData = {
        //     ...userData,
        //     speciality: updatedUser.data.user.speciality,
        //     office_phone: updatedUser.data.user.office_phone,
        //     address: updatedUser.data.user.address,
        //     address_2: updatedUser.data.user.address_2,
        //     city: updatedUser.data.user.city,
        //     zip: updatedUser.data.user.zip,
        //   };
        // }
        await refreshUserData();
        toast.success('Numéro de téléphone vérifié avec succès !');
        setPhoneEnabled(true);
        setCodeSent(false);
        setVerificationCode('');
        closeModal();
      } else {
        toast.error('Échec de la vérification du code téléphonique');
      }
    } catch (error) {
      console.error(
        'Erreur lors de la vérification du code téléphonique:',
        error
      );
      toast.error('Erreur lors de la vérification du code téléphonique');
    }
    setLoading(false);
  };

  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/sendEmailVerificationCode`,
        JSON.stringify({ email }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        toast.success('Email envoyé avec succès !');
        setCodeSent(true);
      } else {
        console.error("Échec de l'envoi de l'email de vérification");
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'email de vérification:",
        error
      );
    }
    setLoading(false);
  };

  const verifyEmailCode = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/verifyEmailCode`,
        JSON.stringify({
          code: verificationCode,
          email,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },

        }
      );

      if (response) {
        const updatedUser: any = response.data;
        // let userData: any = {
        //   id: updatedUser.data.user.id,
        //   first_name: updatedUser.data.user.first_name,
        //   last_name: updatedUser.data.user.last_name,
        //   user_name: updatedUser.data.user.user_name || null,
        //   email: updatedUser.data.user.email,
        //   phone: updatedUser.data.user.phone,
        //   phone_verified: updatedUser.data.user.phone_verified,
        //   email_verified: updatedUser.data.user.email_verified,
        //   status: updatedUser.data.user.status,
        //   firebase_uuid: updatedUser.data.user.firebase_uuid,
        //   profile_pic: updatedUser.data.user.profile_pic,
        //   two_factor_enabled: updatedUser.data.user.two_factor_enabled,
        //   token: updatedUser.data.token,
        //   tokenExpires: updatedUser.data.user.tokenExpires,
        //   role: updatedUser.data.user.role,
        //   role_id: updatedUser.data.user.role_id,
        //   country: updatedUser.data.user.country,
        //   has_mobile_account: updatedUser.data.user.has_mobile_account,
        //   redirect: false,
        // };
        // if (userData.role == 'doctor') {
        //   userData = {
        //     ...userData,
        //     speciality: updatedUser.data.user.speciality,
        //     office_phone: updatedUser.data.user.office_phone,
        //     address: updatedUser.data.user.address,
        //     address_2: updatedUser.data.user.address_2,
        //     city: updatedUser.data.user.city,
        //     zip: updatedUser.data.user.zip,
        //   };
        // }
        await refreshUserData();
        toast.success('Email vérifié avec succès !');
        setPhoneEnabled(true);
        setCodeSent(false);
        setVerificationCode('');
        closeModal();
      } else {
        toast.error('Échec de la vérification du code email');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du code email:', error);
      toast.error('Erreur lors de la vérification du code email');
    }
    setLoading(false);
  };

const initiateVerification = async () => {
    setShowModalContent(true);

    // Check the current setting and send verification accordingly
    if (
        currentSetting === 'phone_verified' ||
        currentSetting === 'two_factor_enabled'
    ) {
        if (phoneNumber) {
            await sendVerificationSMS(); // Send SMS verification
        } else {
            toast.error('Veuillez entrer un numéro de téléphone.');
        }
    } else if (currentSetting === 'email_verified') {
        if (email) {
            await sendVerificationEmail(); // Send Email verification
        } else {
            toast.error('Veuillez entrer une adresse email.');
        }
    }
};

  return (
    <div className="grid gap-6 @container">
      <HorizontalFormBlockWrapper
        title="Authentification à deux facteurs"
        titleClassName="text-xl font-semibold"
        description="Activer ou désactiver l'authentification à deux facteurs."
      >
        <div className="flex items-center justify-between p-4">
          <Text className="flex-grow">Vérification OTP</Text>
          <Switch
            checked={otpEnabled}
            onChange={() => handleSwitchChange('two_factor_enabled')}
            variant="flat"
          />
        </div>
      </HorizontalFormBlockWrapper>

      <HorizontalFormBlockWrapper
        title="Vérification par email"
        titleClassName="text-xl font-semibold"
        description="Vérification de votre email."
      >
        <div className="flex items-center justify-between p-4">
          <Text className="flex-grow">Vérification par email</Text>
          <Switch
            checked={emailEnabled}
            onChange={() => handleSwitchChange('email_verified')}
            disabled={emailEnabled}
            variant="flat"
            className={emailEnabled ? 'switch-primary-disabled' : ''}
          />
        </div>
      </HorizontalFormBlockWrapper>

      <HorizontalFormBlockWrapper
        title="Vérification par téléphone"
        titleClassName="text-xl font-semibold"
        description="Vérification de votre numéro de téléphone."
      >
        <div className="flex items-center justify-between p-4">
          <Text className="flex-grow">Vérification par téléphone</Text>
          <Switch
            checked={phoneEnabled}
            onChange={() => handleSwitchChange('phone_verified')}
            disabled={phoneEnabled}
            variant="flat"
            className={phoneEnabled ? 'switch-primary-disabled' : ''}
          />
        </div>
      </HorizontalFormBlockWrapper>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          size="lg"
          className="custom-modal"
        >
          <div className="custom-modal-content container grid grid-cols-1 gap-6 p-6 md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900">
            <div className="col-span-full flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                {currentSetting === 'two_factor_enabled'
                  ? "Activation / Désactivation de l'OTP"
                  : currentSetting === 'phone_verified'
                    ? 'Vérification du téléphone'
                    : "Vérification de l'email"}
              </Title>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>
            {showModalContent &&
              (currentSetting === 'phone_verified' ||
                currentSetting === 'two_factor_enabled') && (
                <div className="flex items-center space-x-4">
                  <PinCode
                    length={6}
                    variant="outline"
                    setValue={(value: any) => {
                      setVerificationCode(value);
                    }}
                    autoFocus
                    className="flex-grow"
                  />
                  <Button
                    isLoading={loading}
                    onClick={verifyPhoneCode}
                    className="flex-none"
                  >
                    Vérifier le code
                  </Button>
                </div>
              )}
            {showModalContent && currentSetting === 'email_verified' && (
              <>
                <Input
                  placeholder="Entrez votre code de vérification"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full"
                />
                <Button isLoading={loading} onClick={verifyEmailCode}>
                  Vérifier le code
                </Button>
              </>
            )}
            {!showModalContent && (
              <Button className="col-span-full" onClick={initiateVerification}>
                Commencer la vérification
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
