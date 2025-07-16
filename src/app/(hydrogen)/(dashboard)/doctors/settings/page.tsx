// src/app/(dashboard)/doctors/settings/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Text } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance'; // Your authenticated axios instance

// Assuming you have this color config available globally or import it
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3',
  light: '#d39424',
  default: '#d39424',
  dark: '#a16207',
  foreground: '#ffffff',
};

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DoctorSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinking, setIsLinking] = useState(false);
  // `isCalendarLinked` state will tell us if the current doctor has linked their calendar
  // We'll initialize it to `null` to indicate a pending check.
  const [isCalendarLinked, setIsCalendarLinked] = useState<boolean | null>(null);

  // Effect to handle the redirect from Google OAuth and display status
  useEffect(() => {
    const linkedStatus = searchParams.get('calendarLinked');
    const errorParam = searchParams.get('error');
    const detailsParam = searchParams.get('details');

    if (linkedStatus === 'true') {
      setIsCalendarLinked(true);
      toast.success("Votre calendrier Google a été lié avec succès !");
    } else if (linkedStatus === 'false') {
      setIsCalendarLinked(false);
      let errorMessage = "Échec de la liaison du calendrier Google.";
      if (errorParam === 'no_code') errorMessage += " Aucun code d'autorisation reçu.";
      if (errorParam === 'invalid_state') errorMessage += " Erreur d'état lors de l'authentification.";
      if (errorParam === 'no_refresh_token') errorMessage += " Le jeton d'accès permanent n'a pas été accordé. Veuillez accepter toutes les permissions.";
      if (errorParam === 'auth_failed' && detailsParam) errorMessage += ` Détails: ${decodeURIComponent(detailsParam)}`;

      toast.error(errorMessage);
    }

    // Clean up URL parameters after processing to prevent re-triggering messages on refresh
    // This uses `router.replace` to update the URL without a full page reload.
    const currentPath = window.location.pathname;
    if (searchParams.toString()) { // Check if there are any search params to clear
        router.replace(currentPath, { shallow: true }); // `shallow: true` updates URL without re-running data fetching
    }
  }, [searchParams, router]);

  // Effect to fetch the doctor's current calendar linking status from the backend
  useEffect(() => {
    const fetchDoctorCalendarStatus = async () => {
      try {
        // This assumes you add a new endpoint to your backend like /doctors/me/calendar-status
        // that returns { isLinked: boolean } or similar, based on `googleCalendarRefreshToken` presence.
        // For now, we'll simulate this or skip it if you don't want to add another API call.
        // Let's assume for now, it's checked by trying to link.
        // A simple way to check: fetch current user data if that includes the refresh token status.
        // Your `authController.getMe` already fetches user data. We can extend it to include `googleCalendarRefreshToken`.
        const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/me`); // Assuming /me endpoint
        if (response.data?.status === 'success' && response.data?.data?.user) {
          const user = response.data.data.user;
          setIsCalendarLinked(!!user.googleCalendarRefreshToken); // Convert truthiness to boolean
        } else {
          setIsCalendarLinked(false); // Default to not linked if user data isn't retrieved
        }
      } catch (err) {
        console.error("Error fetching doctor's calendar status:", err);
        setIsCalendarLinked(false); // Assume not linked on error
      }
    };

    fetchDoctorCalendarStatus();
  }, []); // Run once on component mount

  // Handles the click to initiate Google Calendar linking
  const handleLinkGoogleCalendar = async () => {
    setIsLinking(true);
    toast.dismiss(); // Dismiss any previous toasts

    try {
      // Call your backend endpoint to get the Google Auth URL
      // This matches the `GET /api/contact/google/initiate-calendar-link` route.
      const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/contact/google/initiate-calendar-link`);

      if (response.status === 200 && response.data.authUrl) {
        // Redirect the doctor's browser to Google's consent screen
        window.location.href = response.data.authUrl;
      } else {
        throw new Error(response.data?.message || "Échec de la récupération de l'URL d'authentification.");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'initiation de la liaison Google Calendar:", err);
      const errorMessage = err.response?.data?.message || err.message || "Une erreur inconnue est survenue.";
      toast.error(`Échec de l'initialisation: ${errorMessage}.`);
      setIsLinking(false); // Re-enable button if an error occurs before redirect
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight tracking-tight text-center"
          style={{ color: DEFAULT_PRESET_COLORS.dark }}
        >
          Paramètres du Dr. {/* You might want to fetch and display the doctor's name here */}
        </h1>

        <div className="mb-8 p-6 rounded-xl border shadow-sm"
          style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, borderColor: DEFAULT_PRESET_COLORS.light }}
        >
          <h2 className="font-bold text-2xl mb-4" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
            Lier Google Calendar
          </h2>
          <p className="text-gray-700 mb-4">
            Liez votre calendrier Google pour que les demandes de consultation des patients soient automatiquement ajoutées à votre emploi du temps.
            Cela nécessite votre consentement via Google.
          </p>

          {/* Display linking status */}
          {isCalendarLinked === true && (
            <div className="flex items-center text-green-600 font-semibold mb-4">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Calendrier Google lié.
            </div>
          )}
           {isCalendarLinked === false && (
            <div className="flex items-center text-red-600 font-semibold mb-4">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              Calendrier Google non lié. Veuillez le lier.
            </div>
          )}
          {isCalendarLinked === null && (
            <div className="flex items-center text-gray-600 font-semibold mb-4">
              <svg className="animate-spin h-5 w-5 mr-3" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vérification du statut de liaison du calendrier...
            </div>
          )}

          <Button
            onClick={handleLinkGoogleCalendar}
            disabled={isLinking}
            className="w-full px-6 py-3 flex items-center justify-center text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.default,
              borderColor: DEFAULT_PRESET_COLORS.dark,
              '--tw-ring-color': DEFAULT_PRESET_COLORS.light,
            } as React.CSSProperties}
          >
            {isLinking ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirection vers Google...
              </>
            ) : (
              "Lier mon calendrier Google"
            )}
          </Button>
          {isCalendarLinked === true && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Les demandes de consultation seront ajoutées à votre calendrier Google.
            </p>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}