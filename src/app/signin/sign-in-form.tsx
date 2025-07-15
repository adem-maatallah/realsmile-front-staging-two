'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox, Password, Button, Input, Text } from 'rizzui';
import { Form } from '@/components/ui/form';
import { loginSchema, LoginSchema } from '@/utils/validators/login.schema';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import EmailIcon from '@/components/custom-icons/email-icon';
import PasswordIcon from '@/components/custom-icons/password-icon';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useSearchParams } from 'next/navigation';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null); // Captcha token state
  const { login } = useAuth(); // Use the login method from AuthContext
  const searchParams = useSearchParams();

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    if (!captchaToken) {
      toast.error('Veuillez compléter le reCAPTCHA');
      return;
    }
    setLoading(true);

    try {
      // Call the login method with email, password, and captcha token
      await login(data.email, data.password, captchaToken);
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle inactive account error
      const errorMessage =
        error.response?.data?.message || 'Une erreur est survenue.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'inactive') {
      toast.error(
        "Votre compte est inactif. Veuillez contacter l'administration."
      );
    }
  }, [searchParams]);

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              prefix={<EmailIcon className="h-6 w-6" />}
              type="email"
              size="lg"
              label="Email"
              rounded="pill"
              className="[&>label>span]:font-medium"
              placeholder="Entrer votre Email"
              inputClassName="text-sm"
              {...register('email')}
              error={errors.email?.message}
            />
            <Password
              prefix={<PasswordIcon className="h-7 w-7" />}
              label="Mot de passe"
              placeholder="Tapez votre mot de passe"
              rounded="pill"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register('rememberMe')}
                label="Souviens-toi de moi"
                className="[&>label>span]:font-medium"
              />
              <Link
                href="/forgot-password"
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <ReCAPTCHA
              hl="fr"
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)} // Capture the token
            />
            <Button
              isLoading={loading}
              className="w-full"
              type="submit"
              size="lg"
            >
              <span>Se connecter</span>{' '}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Vous n'avez pas de compte ?{' '}
        <Link
          href="/signup"
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Créer un compte
        </Link>
      </Text>
      <Text className="mt-4 text-center leading-loose text-gray-500 lg:mt-6 lg:text-start">
        En vous connectant, vous acceptez nos{' '}
        <Link
          href="/terms-of-use"
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Conditions d'utilisation
        </Link>
        /
        <Link
          href="/confidentiality"
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Politique de confidentialité
        </Link>
      </Text>
    </>
  );
}