'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';

// Define User interface
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_name: string;
  phone: string;
  profile_pic: string;
  country: string;
  role: string; // This is the string role, e.g., "patient", "doctor"
  // Add new fields based on the response:
  has_mobile_account: boolean;
  two_factor_enabled: boolean;
  status: boolean; // Assuming boolean based on typical usage
  phone_verified: boolean;
  email_verified: boolean;
  cases?: any; // If `req.session.cases` is directly attached, make sure type is correct. Often not directly on user.
               // Consider if this should truly be part of the User interface or fetched separately.
  roleId: number; // Numeric role ID
  // Note: 'password', 'last_login', 'created_at', 'updated_at', 'firebase_uuid',
  // 'failedLoginAttempts', 'lockUntil', 'commercial_id', 'deleted', 'labo_group',
  // 'speciality', 'office_phone', 'address', 'address_2', 'city', 'zip', 'token', 'tokenExpires'
  // are likely from your backend's internal `user` object but not explicitly included in this *final*
  // `res.json` payload, or are added for specific roles (like doctor).
  // The structure you provided for `data.user` does not include speciality, office_phone, etc.
  // directly. If they *are* needed for `doctor` role, you'll need conditional typing or
  // ensure the backend only sends them when `role` is 'doctor' and type them as optional.

  // If role-specific properties should be here, they need to be optional:
  speciality?: string;
  office_phone?: string;
  address?: string;
  address_2?: string;
  city?: string;
  zip?: string;
  // If `token` and `tokenExpires` are *also* passed directly in `data.user`
  // (which is unusual if they are also in `data` root, but your earlier log showed it),
  // then include them here as optional
  token?: string;
}

// Define Auth Context Interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    identifier: string,
    password: string,
    captchaToken: string
  ) => Promise<void>;
  signup: (formData: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  mutate: typeof mutate;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fetch user from API
const fetchUser = async (): Promise<User | null> => {
  try {
    const response = await axiosInstance.get(`/me`, {
      withCredentials: true,
    });
    console.log('User data from /me endpoint:', response.data);
    if (response.data?.data?.user) {
      return response.data.data.user;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const {
    data: user,
    error,
    isValidating: isLoading,
    mutate: swrMutate, // Rename the SWR mutate to avoid conflict with the one you want to expose
  } = useSWR<User | null>(
    typeof window !== 'undefined' ? `/me` : null,
    fetchUser,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      console.error('SWR error:', error);
    }
  }, [error]);

  const login = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      const requestData = { email, password, captchaToken };

      const response = await axiosInstance.post(`/loginDoctor`, requestData, {
        withCredentials: true,
      });

      // The backend often returns structured data, like { data: { user: {...}, token: "..." } }
      // Adjust this line based on your actual API response structure for the authenticated user.
      const loggedInUserData = response.data.data; // <-- Assuming this structure

      console.log('User data from login response:', loggedInUserData);

      if (loggedInUserData.two_factor_enabled || !loggedInUserData.phone_verified) { // Use loggedInUserData
        console.log('User needs OTP/phone verification.', 'phone_verified', loggedInUserData.phone_verified, 'two_factor_enabled', loggedInUserData.two_factor_enabled);
        document.cookie = `userPhone=${JSON.stringify({
          id: loggedInUserData.id,
          phone: loggedInUserData.phone || null,
          fromSignIn: true,
        })}; path=/; secure; samesite=strict`;
        router.push('/otp');
        return;
      }

      toast.success('Connexion réussie !');

      // 1. Update SWR cache with the user data received from login,
      //    AND then immediately revalidate.
      //    This means SWR will *first* use the `loggedInUserData` for a quick update,
      //    *then* trigger a background revalidation by calling `fetchUser` again to ensure full consistency.
      await swrMutate(loggedInUserData, { revalidate: true });
      // Or, if you want to force a fetch and not use the login response data in cache:
      // await swrMutate(); // This will trigger a re-fetch of `/me` immediately

      console.log('Navigating to dashboard...');
      router.push('/');
      // return loggedInUserData; // No need to return here if you're redirecting
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'E-mail/téléphone ou mot de passe invalide.';
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axiosInstance.post(`/logout`, {} as Record<string, any>, {
        withCredentials: true,
      });
      mutate(`/me`, null, {
        revalidate: false,
      });
      router.push('/signin');
      toast.success('Déconnexion réussie !');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed.');
    }
  };

  // Signup Function
  const signup = async (formData: Record<string, any>) => {
    try {
      await axiosInstance.post(`/signup`, formData);
      toast.success('Inscription réussie !');
      router.push('/signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Échec de l’inscription. Veuillez réessayer.';
      toast.error(errorMessage);
    }
  };

  // Forgot Password Function
  const forgotPassword = async (email: string) => {
    try {
      await axiosInstance.post(`/forgot-password`, {
        email,
      });
      toast.success(
        'Lien de réinitialisation du mot de passe envoyé à votre email.'
      );
    } catch (error) {
      console.error('Forgot Password error:', error);
      toast.error('Échec de l’envoi du lien de réinitialisation.');
    }
  };

  // Verify Email Function
  const verifyEmail = async (token: string) => {
    try {
      await axiosInstance.post(`/verify-email`, {
        token,
      });
      toast.success('Email vérifié avec succès !');
      mutate(`/me`);
    } catch (error) {
      console.error('Verify Email error:', error);
      toast.error('Échec de la vérification de l’email.');
    }
  };

  // Verify OTP Function
  const verifyOTP = async (otp: string) => {
  try {
    await axiosInstance.post(`/verify-otp`, {
      otp,
    });
    toast.success('OTP vérifié avec succès !');

    // This is the crucial step: Wait for the user data to be refreshed
    const currentUserAfterOTP = await refreshUserData();

    // Now, currentUserAfterOTP should contain the updated user object
    // with phone_verified: true (assuming the backend logic sets it).
    // The SWR cache for '/me' is also updated.

    // You can add a check here if needed, but the UI should update automatically
    // due to the SWR cache change and subsequent re-render.
    // Example:
    // if (currentUserAfterOTP?.phone_verified) {
    //   router.push('/');
    // } else {
    //   toast.error("Phone verification failed. Please try again.");
    // }

    // This navigation will now typically load the new page, and because SWR
    // cache for '/me' is fresh, components relying on `useAuth().user` will
    // get the latest data.
    router.push('/');

  } catch (error) {
    console.error('OTP Verification error:', error);
    let errorMessage = 'Échec de la vérification de l’OTP.';
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    toast.error(errorMessage);
  }
};
  // --- NEW FUNCTION: refreshUserData ---
const refreshUserData = async (): Promise<User | null> => {
  console.log('Refreshing user data...');
  // Calling swrMutate with NO arguments triggers a revalidation of its own key ('/me').
  // It returns a Promise that resolves with the newly fetched data.
  const updatedUser = await swrMutate(); // <--- Change is HERE: No arguments
  console.log('User data ref  resh initiated. New user:', updatedUser);
  return updatedUser || null; // Ensure it returns User | null, as swrMutate() can return undefined if fetcher returns null or error.
};
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        verifyEmail,
        verifyOTP,
        refreshUserData,
        mutate: swrMutate, // Expose the SWR mutate function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
