'use client';

import { Input, Text, Button, Password } from 'rizzui';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useMedia } from '@/hooks/use-media';
import {
  forgetPasswordSchema,
  ForgetPasswordSchema,
  resetPasswordSchema,
  ResetPasswordSchema,
} from '@/utils/validators/forget-password.schema';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function ForgetPasswordForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [reset, setReset] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token: any = searchParams.get('token');
  const email: any = searchParams.get('email');

  const { user } = useAuth();

  const initialValues = {
    email: '',
  };

  const initialResetValues = {
    token: token || '',
    email: email || '',
    password: '',
    password_confirm: '',
  };

  const sendResetLink = async (data: ForgetPasswordSchema) => {
    setLoading(true);
    const response = await  axiosInstance.post(
      `/forgotPassword`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const res: any = await response.data;
    setLoading(false);
    if (!response) {
      throw new Error(res.message);
    } else {
      setReset(initialValues);
      return res;
    }
  };
  const sendResetPassword = async (data: ForgetPasswordSchema) => {
    setLoading(true);
    const response = await axiosInstance.patch(
      `/resetPassword`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const res: any = await response.data;
    setLoading(false);
    if (!response) {
      throw new Error(res.message);
    } else {
      setReset(initialValues);
      router.push('/signin');
      return res;
    }
  };
  const onSubmit: SubmitHandler<ForgetPasswordSchema> = async (data) => {
    toast.promise(
      sendResetLink(data),
      {
        loading: 'Envoi du lien de réinitialisation...',
        success: (body: any) => {
          return 'Lien de réinitialisation envoyé avec succès';
        },
        error: (error) => {
          return "Erreur lors de l'envoi du lien de réinitialisation";
        },
      },
      {
        style: {
          minWidth: '250px',
        },
      }
    );
  };
  const resetPassword = async (data: ResetPasswordSchema) => {
    toast.promise(
      sendResetPassword(data),
      {
        loading: 'Réinitialisation de votre mot de passe...',
        success: (body: any) => {
          return body.message || 'Mot de passe réinitialisé avec succès';
        },
        error: (error) => {
          return (
            error.message ||
            'Erreur lors de la réinitialisation du mot de passe'
          );
        },
      },
      {
        style: {
          minWidth: '250px',
        },
      }
    );
  };

  return (
    <>
      {token ? (
        <Form<ResetPasswordSchema>
          validationSchema={resetPasswordSchema}
          resetValues={reset}
          onSubmit={resetPassword}
          useFormProps={{
            defaultValues: initialResetValues,
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-5">
              <Password
                label="Mot de passe"
                placeholder="Entrer votre mot de passe"
                rounded="pill"
                className="[&>label>span]:font-medium"
                {...register('password')}
                error={errors.password?.message as string}
              />
              <Password
                label="Confirmer le mot de passe"
                placeholder="Confirmer votre mot de passe"
                rounded="pill"
                className="[&>label>span]:font-medium"
                {...register('password_confirm')}
                error={errors.password_confirm?.message as string}
              />
              <Button
                isLoading={loading}
                className="border-primary-light w-full border-2 text-base font-medium"
                type="submit"
                size={isMedium ? 'lg' : 'xl'}
                rounded="pill"
              >
                Envoyer
              </Button>
            </div>
          )}
        </Form>
      ) : (
        <Form<ForgetPasswordSchema>
          validationSchema={forgetPasswordSchema}
          resetValues={reset}
          onSubmit={onSubmit}
          useFormProps={{
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-5">
              <Input
                type="email"
                size={isMedium ? 'lg' : 'xl'}
                label="Email"
                placeholder="Entrer votre Email"
                rounded="pill"
                className="[&>label>span]:font-medium"
                {...register('email')}
                error={errors.email?.message as string}
              />
              <Button
                isLoading={loading}
                className="border-primary-light w-full border-2 text-base font-medium"
                type="submit"
                size={isMedium ? 'lg' : 'xl'}
                rounded="pill"
              >
                Envoyer
              </Button>
            </div>
          )}
        </Form>
      )}
      <Text className="mt-5 text-center text-[15px] leading-loose text-gray-500 lg:text-start xl:mt-7 xl:text-base">
        Vous ne voulez pas réinitialiser ?{' '}
        <Link
          href={routes.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Se connecter
        </Link>
      </Text>
    </>
  );
}
