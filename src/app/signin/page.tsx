import SignInForm from '@/app/signin/sign-in-form';
import { metaObject } from '@/config/site.config';
import AuthWrapperTwo from '../shared/auth-layout/auth-wrapper-two';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  return (
    <AuthWrapperTwo title="Se connecter">
      <SignInForm />
    </AuthWrapperTwo>
  );
}
