// src/app/(other-pages)/doctor-profile/[id]/page.tsx

'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button, Text, Input, Textarea } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGlobe, FaRegAddressCard, FaBuilding, FaPhone, FaUser, FaCalendarAlt } from 'react-icons/fa';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';

// Import react-phone-number-input components and styles
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Import Google Maps components
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Color configuration
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3',
  light: '#d39424',
  default: '#d39424',
  dark: '#a16207',
  foreground: '#ffffff',
};

// Backend API Base URL
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY;

// Doctor Details Interface
interface DoctorDetails {
  id: string;
  user_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_pic?: string;
  country?: string;
  latitude?: number | null; // Can be null or undefined
  longitude?: number | null; // Can be null or undefined
  speciality?: string;
  address?: string;
  address_2?: string;
  city?: string;
  zip?: string;
  office_phone?: string;
}

// Map constants for the mini-map
const miniMapContainerStyle = {
  width: '100%',
  height: '250px', // Adjusted height for a mini-map
  borderRadius: '0.5rem',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};
const miniMapOptions = {
  disableDefaultUI: true, // No controls for a mini-map
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  scrollwheel: false, // Disable scroll zoom
  draggable: false,   // Disable dragging
  styles: [ // Optional: Minimal map styles
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};
// Use the same libraries as the main map page for consistency
const mapLibraries: Array<'places' | 'geocoding'> = ['places', 'geocoding'];


// Main DoctorProfilePage Component
export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState<string | undefined>(undefined);
  const [consultationDate, setConsultationDate] = useState<string>('');
  const [clientMessage, setClientMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Google Maps API for the mini-map
  // FIX: Use consistent options (id, libraries, language, region) to avoid "Loader must not be called again" error
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: 'google-map-script', // IMPORTANT: Use the same ID as your main FindDoctorsPage or a common ID
    googleMapsApiKey: Maps_API_KEY as string,
    libraries: mapLibraries, // Use the same libraries
    language: 'fr', // Use the same language
    region: 'TN',   // Use the same region
  });

  useEffect(() => {
    if (!doctorId || typeof doctorId !== 'string') {
      setLoading(false);
      setError("ID de médecin invalide. Veuillez vérifier l'URL.");
      return;
    }

    const fetchDoctorDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/doctors/details/${doctorId}`);

        if (response.status !== 200) {
          throw new Error(response.data?.message || "Échec de la récupération des détails du médecin.");
        }

        setDoctor(response.data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des détails du médecin:", err);
        const errorMessage = err.response?.data?.message || err.message || "Une erreur inconnue est survenue.";
        setError(`Échec du chargement du profil du médecin: ${errorMessage}. Veuillez vérifier votre connexion réseau.`);
        toast.error(`Échec du chargement du profil: ${errorMessage}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const handleSubmitContactForm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.dismiss();

    if (!clientFirstName.trim() || !clientLastName.trim() || !clientEmail.trim() || !clientPhone || !consultationDate || !clientMessage.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email, Téléphone, Date de consultation, Message).");
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(clientEmail)) {
      toast.error("Veuillez entrer une adresse email valide.");
      setIsSubmitting(false);
      return;
    }

    const selectedDateTime = new Date(consultationDate);
    const now = new Date();
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime <= now) {
      toast.error("La date et l'heure de consultation doivent être valides et dans le futur.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`${BACKEND_API_BASE_URL}/contact/doctor`, {
        toDoctorId: doctorId,
        clientFirstName: clientFirstName.trim(),
        clientLastName: clientLastName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone,
        consultationDate: consultationDate,
        clientMessage: clientMessage.trim(),
      });

      if (response.status === 200) {
        toast.success("Votre demande de consultation a été envoyée avec succès au médecin et un événement a été ajouté à son calendrier Google !");
        setClientFirstName('');
        setClientLastName('');
        setClientEmail('');
        setClientPhone(undefined);
        setConsultationDate('');
        setClientMessage('');
      } else {
        throw new Error(response.data?.message || "Échec de l'envoi de la demande.");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'envoi du formulaire de contact:", err);
      const errorMessage = err.response?.data?.message || err.message || "Une erreur inconnue est survenue.";
      toast.error(`Échec de l'envoi de la demande: ${errorMessage}. Veuillez réessayer plus tard.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [clientFirstName, clientLastName, clientEmail, clientPhone, consultationDate, clientMessage, doctorId]);

  // Use useMemo for map center.
  const doctorMapCenter = useMemo(() => {
    if (doctor && doctor.latitude !== null && doctor.latitude !== undefined && doctor.longitude !== null && doctor.longitude !== undefined) {
      return { lat: doctor.latitude, lng: doctor.longitude };
    }
    return { lat: 34.0, lng: 9.0 }; // Center of Tunisia
  }, [doctor]);

  // --- Start of Loading/Error/No Doctor Checks ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-lg font-semibold text-gray-700 flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement du profil du médecin...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-red-700 text-lg font-semibold text-center">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Text className="text-lg font-semibold text-gray-700">Aucun médecin trouvé pour cet ID.</Text>
      </div>
    );
  }
  // --- End of Loading/Error/No Doctor Checks ---


  // Destructure doctor details AFTER confirming 'doctor' is not null
  const {
    user_name,
    first_name,
    last_name,
    email,
    phone = '',
    profile_pic,
    country = '',
    latitude,
    longitude,
    speciality = '',
    address = '',
    address_2 = '',
    city = '',
    zip = '',
    office_phone = '',
  } = doctor;

  // Now, safely derive display variables
  const displayName = user_name || `${first_name || ''} ${last_name || ''}`.trim();
  const displayLastName = last_name || '';
  const contactPhoneNumber = phone || office_phone;

  // Calculate min and max for datetime-local input
  const today = new Date();
  today.setSeconds(0);
  today.setMilliseconds(0);

  const currentMinutes = today.getMinutes();
  if (currentMinutes > 30) {
      today.setHours(today.getHours() + 1);
      today.setMinutes(0);
  } else if (currentMinutes > 0 && currentMinutes <= 30) {
      today.setMinutes(30);
  }

  const minDateTime = today.toISOString().slice(0, 16);
  const maxDateTime = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
            style={{ color: DEFAULT_PRESET_COLORS.dark, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
          >
            Profil du Dr. <span style={{ color: DEFAULT_PRESET_COLORS.default }}>{first_name} {last_name}</span>
          </h1>
          <p className="text-center text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Informations détaillées sur le Dr. {displayLastName}.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Doctor Info Display Section */}
          <div className="flex flex-col p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, borderColor: DEFAULT_PRESET_COLORS.light }}
          >
            {/* Doctor Profile Picture */}
            {profile_pic && (
              <div className="mb-6 flex justify-center">
                <Image
                  src={profile_pic}
                  alt={displayName || 'Profil du médecin'}
                  width={150}
                  height={150}
                  className="rounded-full object-cover border-4 border-gray-300 shadow-lg"
                  unoptimized={true}
                />
              </div>
            )}

            {/* Doctor Name */}
            <h2 className="font-bold text-3xl mb-6 text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
              {displayName}
            </h2>

            {/* Doctor Information Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Speciality */}
              {speciality && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaUser className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Spécialité</Text>
                    <Text className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{speciality}</Text>
                  </div>
                </div>
              )}

              {/* Email */}
              {email && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaEnvelope className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Email</Text>
                    <a href={`mailto:${email}`} className="hover:underline font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                      {email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {contactPhoneNumber && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaPhone className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Téléphone</Text>
                    <a href={`tel:${contactPhoneNumber}`} className="hover:underline font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                      {contactPhoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {/* Office Phone - displayed separately */}
              {office_phone && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaPhoneAlt className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Téléphone du cabinet</Text>
                    <Text className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                      {office_phone}
                    </Text>
                  </div>
                </div>
              )}

              {/* Address */}
              {(address || address_2 || city || zip || country) && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaRegAddressCard className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Adresse</Text>
                    <Text className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                      {address}{address_2 ? `, ${address_2}` : ''}<br />
                      {city ? `${city}, ` : ''}{zip ? `${zip}, ` : ''}{country || ''}
                    </Text>
                  </div>
                </div>
              )}

              {/* City - displayed separately for emphasis */}
              {city && (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <FaBuilding className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                  <div>
                    <Text className="text-sm font-medium text-gray-600 mb-1">Ville</Text>
                    <Text className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{city}</Text>
                  </div>
                </div>
              )}

              {/* Mini-Map for Coordinates */}
              {(latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) ? (
                <div className="flex flex-col items-start p-3 rounded-lg w-full" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                  <div className="flex items-center mb-2">
                    <FaMapMarkerAlt className="text-xl mr-3 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                    <Text className="text-sm font-medium text-gray-600">Localisation du cabinet</Text>
                  </div>
                  <div className="w-full h-[200px] rounded-md overflow-hidden border border-gray-300">
                    {isMapLoaded && doctorMapCenter.lat !== 0 && doctorMapCenter.lng !== 0 ? (
                      <GoogleMap
                        mapContainerStyle={miniMapContainerStyle}
                        center={doctorMapCenter}
                        zoom={15}
                        options={miniMapOptions}
                      >
                        <Marker position={doctorMapCenter} />
                      </GoogleMap>
                    ) : mapLoadError ? (
                      <div className="flex items-center justify-center h-full text-red-600 text-sm">
                        Erreur de chargement de la carte.
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Chargement de la carte...
                      </div>
                    )}
                  </div>
                  <Text className="text-xs text-gray-500 mt-2">
                    Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                  </Text>
                </div>
              ) : (
                <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
                    <FaGlobe className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
                    <div>
                        <Text className="text-sm font-medium text-gray-600 mb-1">Coordonnées</Text>
                        <Text className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                            Non disponibles
                        </Text>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: '#ffffff', borderColor: DEFAULT_PRESET_COLORS.light }}
          >
            <h2 className="font-bold text-2xl mb-6 text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
              Demander une consultation avec le Dr. {displayLastName}
            </h2>

            <form onSubmit={handleSubmitContactForm} className="space-y-5">
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Prénom</Text>
                <Input
                  type="text"
                  placeholder="Votre prénom"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Nom de famille</Text>
                <Input
                  type="text"
                  placeholder="Votre nom de famille"
                  value={clientLastName}
                  onChange={(e) => setClientLastName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Email</Text>
                <Input
                  type="email"
                  placeholder="votre.email@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Numéro de Téléphone</Text>
                <PhoneInput
                  placeholder="Entrez votre numéro de téléphone"
                  value={clientPhone}
                  onChange={setClientPhone}
                  defaultCountry="TN"
                  className="react-phone-number-input-custom-style"
                  limitMaxLength={true}
                />
              </div>

              {/* Consultation Date and Time */}
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Date et Heure de consultation souhaitées</Text>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    min={minDateTime}
                    max={maxDateTime}
                    className="w-full pr-10"
                    required
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Message / Précisions</Text>
                <Textarea
                  placeholder="Décrivez brièvement le motif de votre consultation..."
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  className="w-full"
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 flex items-center justify-center text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2"
                style={{
                  backgroundColor: DEFAULT_PRESET_COLORS.default,
                  borderColor: DEFAULT_PRESET_COLORS.dark,
                  '--tw-ring-color': DEFAULT_PRESET_COLORS.light,
                } as React.CSSProperties}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la demande de consultation"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}