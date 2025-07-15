import AuthWrapperTwo from '@/app/shared/auth-layout/auth-wrapper-two';
import ForgetPasswordForm from './forgot-password-form';

export default function ForgotPassword() {
  return (
    <AuthWrapperTwo title="Réinitialiser votre mot de passe">
      <ForgetPasswordForm />
    </AuthWrapperTwo>
  );
}
