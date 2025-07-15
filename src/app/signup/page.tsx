import AuthWrapperTwo from '@/app/shared/auth-layout/auth-wrapper-two';
import SignUpForm from './sign-up-form';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Sign Up'),
};

export default function SignUpPage() {
  return (
    <AuthWrapperTwo title="Créer un compte">
      <SignUpForm />
    </AuthWrapperTwo>
  );
}
