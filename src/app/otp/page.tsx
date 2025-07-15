'use client';
import AuthWrapperTwo from '@/app/shared/auth-layout/auth-wrapper-two';
import { Text } from 'rizzui';
import OtpForm from './otp-form';
import { useState } from 'react';

export default function OtpPage() {
  const [message, setMessage] = useState(
    'Nous vous avons envoyé un code unique via un SMS. Veuillez entrer votre OTP'
  );
  return (
    <AuthWrapperTwo title="Validation">
      <div className="max-w-md xl:pe-7">
        <Text className="-mt-1 mb-9 text-center text-[15px] leading-[1.85] text-gray-700 md:text-base md:!leading-loose lg:text-start xl:-mt-3">
          Nous vous avons envoyé un code unique via un SMS. Veuillez entrer
          votre OTP
        </Text>
        <OtpForm setMessage={setMessage} />
      </div>
    </AuthWrapperTwo>
  );
}
