'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Text, Select, SelectOption } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast'; // Importer le composant Toaster
import { FaMapMarkerAlt, FaSearchLocation, FaGlobe, FaPhoneAlt, FaEnvelope, FaInfoCircle, FaSortAmountUpAlt } from 'react-icons/fa'; // Ajouté FaSortAmountUpAlt pour l'icône de liste
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link'; // Importer Link pour la navigation
import { routes } from '@/config/routes'; // Supposons que vous ayez une configuration de routes
import axiosInstance from '@/utils/axiosInstance'; // Importer axiosInstance

// config/colors.ts (Supposons que ce fichier existe et est correctement importé)
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3', // Jaune 100
  light: '#d39424', // Jaune 300
  default: '#d39424',
  dark: '#a16207',
  foreground: '#ffffff',
};

// --- Interfaces ---
interface DoctorLocation {
  id: string;
  user_name: string;
  first_name?: string;
  last_name?: string;
  country: string;
  latitude: number | null; // Peut être null si non précis
  longitude: number | null; // Peut être null si non précis
  phone?: string;
  office_phone?: string;
  email?: string;
  speciality?: string;
  address?: string;
  city?: string;
  profile_pic?: string;
  distance?: number; // Ajouter la distance pour le tri
}

interface UserLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  countryCode?: string | null; // Garder pour la suggestion du toast/menu déroulant, pas pour la logique de la carte
}

// --- Variables d'environnement ---
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY; // Nom de variable d'environnement corrigé

// --- Formule Haversine ---
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  return distance;
}

// --- Constantes de la carte ---
const mapContainerStyle = {
  width: '100%', // Changé à 100% pour toute la largeur de son conteneur
  height: '450px', // Hauteur légèrement augmentée pour une meilleure vue
  borderRadius: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

const initialMapCenter = {
  lat: 34.0, // Un point plus central pour la Tunisie, peut être ajusté
  lng: 9.0
};
const initialMapZoom = 2; // Zoom de la vue mondiale par défaut (affichant le monde entier)

const mapLibraries: google.maps.Libraries[] = ['places', 'geocoding'];

// Coordonnées centrales prédéfinies pour les pays (à étendre si nécessaire)
const COUNTRY_CENTERS: { [key: string]: { lat: number; lng: number } } = {
  "TN": { lat: 34.0, lng: 9.0 },
  "MA": { lat: 31.7917, lng: -7.0926 },
  "DZ": { lat: 28.0339, lng: 1.6596 },
  "FR": { lat: 46.603354, lng: 1.888334 },
  "ES": { lat: 40.463667, lng: -3.74922 },
  // Ajouter plus de pays ici
};

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorLocation[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [closestDoctor, setClosestDoctor] = useState<DoctorLocation | null>(null);
  const [closestDoctorsList, setClosestDoctorsList] = useState<DoctorLocation[]>([]); // Nouvel état pour la liste
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<DoctorLocation | null>(null);
  const [isFindingClosestDoctor, setIsFindingClosestDoctor] = useState(false);

  // État dérivé pour le centre et le zoom de la carte, réactif à la localisation de l'utilisateur
  const mapCenter = useMemo(() => {
    if (userLocation?.permissionStatus === 'granted' && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return initialMapCenter;
  }, [userLocation]);

  const mapZoom = useMemo(() => {
    if (userLocation?.permissionStatus === 'granted') {
      return 14; // Bon zoom local lorsque la localisation de l'utilisateur est connue
    }
    return initialMapZoom; // Zoom de la vue mondiale par défaut
  }, [userLocation]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: Maps_API_KEY as string,
    libraries: mapLibraries,
    language: 'fr', // Défini la langue en français
    region: 'TN', // Région de la Tunisie
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  // Fonction pour effacer les marqueurs de la carte
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  }, []);

  // Fonction pour effectuer le géocodage inverse en utilisant OpenStreetMap Nominatim
  const reverseGeocodeUserLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`; // Ajout de accept-language=fr
      const res = await fetch(nominatimApiUrl);
      const data = await res.json();

      if (res.ok && data && data.display_name) {
        const fullAddress = data.display_name;
        const countryCode = data.address?.country_code?.toUpperCase() || null;

        setUserLocation(prev => prev ? { ...prev, formattedAddress: fullAddress, countryCode: countryCode } : null);
        toast.success(`Votre localisation générale détectée : ${fullAddress.split(',')[0]}`);
      } else {
        const errorMessage = data.error || "Adresse introuvable via OpenStreetMap.";
        toast.error(`La recherche d'adresse a échoué : ${errorMessage}`);
        setUserLocation(prev => prev ? { ...prev, formattedAddress: errorMessage, countryCode: null } : null);
      }
    } catch (err) {
      console.error("Le géocodage Nominatim a échoué :", err);
      toast.error("La recherche d'adresse a échoué via OpenStreetMap.");
      setUserLocation(prev => prev ? { ...prev, formattedAddress: "Échec de la requête de géocodage", countryCode: null } : null);
    }
  }, []);

  // --- Fonction pour encapsuler la logique des limites et du centre de la carte ---
  const updateMapBoundsAndCenter = useCallback((
    map: google.maps.Map,
    currentDoctors: DoctorLocation[],
    currentUserLocation: UserLocation | null,
    shouldFitAllDoctors: boolean = true
  ) => {
    if (!map || !window.google || !window.google.maps) {
      console.warn("La carte ou l'API Google Maps n'est pas entièrement prête pour updateMapBoundsAndCenter.");
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    if (shouldFitAllDoctors) {
      currentDoctors.forEach(doc => {
        const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
        const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

        if (docLat !== null && docLng !== null) {
          bounds.extend({ lat: docLat, lng: docLng });
          hasValidLocations = true;
        }
      });
    }

    if (currentUserLocation && currentUserLocation.latitude !== undefined && currentUserLocation.longitude !== undefined && currentUserLocation.permissionStatus === 'granted') {
      bounds.extend({ lat: currentUserLocation.latitude, lng: currentUserLocation.longitude });
      hasValidLocations = true;
    }

    if (hasValidLocations && !bounds.isEmpty()) {
      map.fitBounds(bounds);
      google.maps.event.addListenerOnce(map, 'idle', () => {
        const currentZoom = map.getZoom();
        if (currentZoom !== undefined) {
          if (currentZoom < 4) {
            map.setZoom(4);
          } else if (currentZoom > 15 && ((shouldFitAllDoctors ? currentDoctors.length : 0) + (currentUserLocation ? 1 : 0)) <= 2) {
            map.setZoom(15);
          }
        }
      });
    } else {
      map.setCenter(initialMapCenter);
      map.setZoom(initialMapZoom);
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    console.log("Instance de carte chargée et définie dans la référence.");
    if (!userLocation || userLocation.permissionStatus !== 'granted') {
      updateMapBoundsAndCenter(map, doctors, userLocation, true);
    }
  }, [doctors, userLocation, updateMapBoundsAndCenter]);


  const onMapUnmount = useCallback(() => {
    mapInstanceRef.current = null;
    setActiveInfoWindow(null);
    console.log("Instance de carte démontée de la référence.");
  }, []);

  // Styles de carte personnalisés pour un aspect plus propre
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#aadaff' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#c5c5c5' }] }
    ],
  }), []);

  // --- 1. Récupérer les localisations des médecins en utilisant axiosInstance ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError(null);
        const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/doctors/locations`);

        if (response.status !== 200) {
          throw new Error(response.data?.message || "Échec de la récupération des localisations des médecins.");
        }
        const data: DoctorLocation[] = response.data;
        setDoctors(data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des médecins :", err);
        setError(`Échec du chargement des médecins : ${err.message}. Veuillez vérifier votre connexion réseau et le serveur backend.`);
        toast.error(`Échec du chargement des médecins : ${err.message}.`);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // --- 2. Obtenir la localisation de l'utilisateur automatiquement au chargement ---
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) {
      return;
    }

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur. Veuillez utiliser un navigateur qui la prend en charge.");
      toast.error("La géolocalisation n'est pas prise en charge par votre navigateur.");
      setLoadingUserLocation(false);
      setUserLocation({ latitude: 0, longitude: 0, formattedAddress: null, permissionStatus: 'denied', countryCode: null });
      return;
    }

    setLoadingUserLocation(true);

    const handleGeolocationSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      console.log(`Géolocalisation réussie : Lat ${latitude}, Lng ${longitude}`);
      setUserLocation(prev => ({
        ...prev!,
        latitude,
        longitude,
        formattedAddress: null,
        permissionStatus: 'granted'
      }));
      setError(null);
      setLoadingUserLocation(false);
      reverseGeocodeUserLocation(latitude, longitude);
    };

    const handleGeolocationError = (geoError: GeolocationPositionError) => {
      let errorMessage = "Échec de l'obtention automatique de votre localisation.";
      let permissionState: 'denied' | 'prompt' | 'unknown' = 'unknown';

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = "Accès à la localisation refusé par l'utilisateur. Veuillez l'activer dans les paramètres du navigateur.";
          permissionState = 'denied';
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = "Les informations de localisation sont indisponibles (par exemple, erreur réseau, GPS désactivé).";
          break;
        case geoError.TIMEOUT:
          errorMessage = "La demande d'obtention de la localisation de l'utilisateur a expiré. Réessayez ou vérifiez la connexion réseau.";
          break;
        default:
          errorMessage = `Une erreur inconnue s'est produite lors de la détection de la localisation : ${geoError.message}`;
          break;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erreur de géolocalisation :', geoError);
      setLoadingUserLocation(false);
      setUserLocation(prev => ({
        ...prev!,
        latitude: prev?.latitude || 0,
        longitude: prev?.longitude || 0,
        formattedAddress: null,
        permissionStatus: permissionState,
        countryCode: null
      }));
    };

    navigator.geolocation.getCurrentPosition(
      handleGeolocationSuccess,
      handleGeolocationError,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      const currentPermission = permissionStatus.state;
      setUserLocation(prev => prev ? { ...prev, permissionStatus: currentPermission } : { latitude: 0, longitude: 0, formattedAddress: null, permissionStatus: currentPermission, countryCode: null });
    });
  }, [isLoaded, reverseGeocodeUserLocation]);

  // --- 3. Effet principal pour contrôler la vue de la carte en fonction de la disponibilité des données ---
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) {
      return;
    }
    const map = mapInstanceRef.current;

    clearMarkers();
    const doctorsToDisplayOnMap = doctors;

    doctorsToDisplayOnMap.forEach(doc => {
      const markerLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
      const markerLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

      if (markerLat !== null && markerLng !== null) {
        const marker = new window.google.maps.Marker({
          position: { lat: markerLat, lng: markerLng },
          map: map,
          title: doc.user_name || 'Médecin',
          icon: {
            url: closestDoctor?.id === doc.id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Vert pour le plus proche, rouge pour les autres
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        marker.addListener('click', () => {
          setActiveInfoWindow(doc);
        });
        markers.current.push(marker);
      }
    });

  }, [isLoaded, doctors, closestDoctor, activeInfoWindow, mapInstanceRef, clearMarkers]);

  const findClosestDoctor = useCallback(() => {
    setIsFindingClosestDoctor(true);
    setClosestDoctorsList([]); // Effacer la liste précédente lors d'une nouvelle recherche

    if (!userLocation || userLocation.latitude === undefined || userLocation.longitude === undefined || userLocation.permissionStatus !== 'granted') {
      toast.error("Votre **autorisation de localisation accordée** est requise pour trouver le médecin le plus proche. Veuillez l'activer dans les paramètres de votre navigateur.");
      setIsFindingClosestDoctor(false);
      return;
    }

    const doctorsWithDistance: DoctorLocation[] = [];
    doctors.forEach(doc => {
      const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
      const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

      if (docLat !== null && docLng !== null && userLocation) {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          docLat,
          docLng
        );
        doctorsWithDistance.push({ ...doc, distance });
      }
    });

    // Trier les médecins par distance
    doctorsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    if (doctorsWithDistance.length > 0) {
      setClosestDoctor(doctorsWithDistance[0]); // Définir le médecin le plus proche pour la mise en évidence sur la carte
      setClosestDoctorsList(doctorsWithDistance); // Définir la liste complète triée
      toast.success(`Médecin le plus proche trouvé : ${doctorsWithDistance[0].user_name || 'Médecin'} (${doctorsWithDistance[0].distance?.toFixed(2)} km)`);

      // Ajuster la carte pour afficher la localisation de l'utilisateur et les quelques médecins les plus proches
      if (mapInstanceRef.current && userLocation) {
        const map = mapInstanceRef.current;
        const newBounds = new window.google.maps.LatLngBounds();
        newBounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });

        // Ajouter les 5 premiers médecins les plus proches aux limites (ou moins si moins disponibles)
        doctorsWithDistance.slice(0, 5).forEach(doc => {
          const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
          const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);
          if (docLat !== null && docLng !== null) {
            newBounds.extend({ lat: docLat, lng: docLng });
          }
        });

        if (!newBounds.isEmpty()) {
          map.fitBounds(newBounds);
          google.maps.event.addListenerOnce(map, 'idle', () => {
            const currentZoom = map.getZoom();
            if (currentZoom !== undefined && currentZoom > 15) {
              map.setZoom(15);
            }
          });
        }
      }
      setActiveInfoWindow(doctorsWithDistance[0]); // Ouvrir la fenêtre d'information pour le plus proche
    } else {
      toast.info("Aucun médecin trouvé à proximité.");
      setClosestDoctor(null);
      setClosestDoctorsList([]);
    }
    setIsFindingClosestDoctor(false);
  }, [userLocation, doctors]);

  const renderMapContent = () => {
    if (loadError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-700 text-lg font-semibold z-10 p-4 rounded-xl text-center">
          <p className="mb-2">🚨 Erreur de chargement de Google Maps.</p>
          <p className="text-base font-normal">{loadError.message}</p>
          <p className="text-sm mt-2">Veuillez vérifier votre clé API, la configuration de la facturation et votre connexion réseau.</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 text-gray-600 text-lg font-semibold z-10 rounded-xl">
          <svg className="animate-spin h-8 w-8 mr-3" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement de la carte...
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {/* Marqueur de localisation de l'utilisateur */}
        {userLocation && userLocation.permissionStatus === 'granted' && (
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="Votre localisation"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Un point bleu plus clair
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {/* Marqueurs des médecins */}
        {doctors.map(doc => {
          const markerLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
          const markerLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

          if (markerLat !== null && markerLng !== null) {
            return (
              <Marker
                key={doc.id}
                position={{ lat: markerLat, lng: markerLng }}
                title={doc.user_name || 'Médecin'}
                onClick={() => setActiveInfoWindow(doc)}
                icon={{
                  url: closestDoctor?.id === doc.id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Vert pour le plus proche, rouge pour les autres
                  scaledSize: new window.google.maps.Size(32, 32)
                }}
              />
            );
          }
          return null;
        })}

        {/* Fenêtre d'information */}
        {activeInfoWindow && (activeInfoWindow.latitude !== null || COUNTRY_CENTERS[activeInfoWindow.country?.toUpperCase() || '']) && (
          <InfoWindow
            position={{
              lat: activeInfoWindow.latitude !== null ? activeInfoWindow.latitude : (COUNTRY_CENTERS[activeInfoWindow.country?.toUpperCase() || '']?.lat || 0),
              lng: activeInfoWindow.longitude !== null ? activeInfoWindow.longitude : (COUNTRY_CENTERS[activeInfoWindow.country?.toUpperCase() || '']?.lng || 0)
            }}
            onCloseClick={() => setActiveInfoWindow(null)}
          >
            <div className="p-3 flex flex-col space-y-1 text-gray-800 font-sans min-w-[200px] max-w-[300px]">
              {activeInfoWindow.profile_pic && (
                <div className="mb-2 flex justify-center">
                  <Image
                    src={activeInfoWindow.profile_pic}
                    alt={activeInfoWindow.user_name || 'Profil du médecin'}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-gray-300 shadow-md"
                    unoptimized={true}
                  />
                </div>
              )}
              <h3 className="font-bold text-lg text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                {activeInfoWindow.user_name || `${activeInfoWindow.first_name || ''} ${activeInfoWindow.last_name || ''}`.trim() || 'Médecin'}
              </h3>
              {activeInfoWindow.speciality && <p className="text-sm text-gray-600 text-center"><strong>Spécialité :</strong> {activeInfoWindow.speciality}</p>}
              {(activeInfoWindow.address || activeInfoWindow.city || activeInfoWindow.country) && (
                <p className="text-sm text-gray-600 flex items-center justify-center text-center">
                  <FaMapMarkerAlt className="mr-1 text-gray-500 flex-shrink-0" />
                  {activeInfoWindow.address ? `${activeInfoWindow.address}, ` : ''}
                  {activeInfoWindow.city ? `${activeInfoWindow.city}, ` : ''}
                  {activeInfoWindow.country || ''}
                </p>
              )}
              {(activeInfoWindow.phone || activeInfoWindow.office_phone) && (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <FaPhoneAlt className="mr-1 text-gray-500" />
                  <a href={`tel:${activeInfoWindow.office_phone || activeInfoWindow.phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                    {activeInfoWindow.office_phone || activeInfoWindow.phone}
                  </a>
                </p>
              )}
              {activeInfoWindow.email && (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <FaEnvelope className="mr-1 text-gray-500" />
                  <a href={`mailto:${activeInfoWindow.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{activeInfoWindow.email}</a>
                </p>
              )}
              {activeInfoWindow.distance !== undefined && (
                <p className="text-sm text-gray-700 text-center mt-2">
                  <strong>Distance :</strong> {activeInfoWindow.distance.toFixed(2)} km
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50"> {/* Couleur de fond changée */}
      <div className="max-w-7xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border-px border-gray-200">
        <header className="text-center mb-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
            style={{
              color: DEFAULT_PRESET_COLORS.dark,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Trouvez Votre <span style={{ color: DEFAULT_PRESET_COLORS.default }}>Médecin Idéal</span>
          </h1>
          <p className="text-center text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto">
            Découvrez facilement les professionnels de la santé les mieux notés à proximité.
            Votre santé, votre choix, simplifié.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 font-medium text-base border border-red-200 animate-fade-in flex items-center">
            <svg className="h-6 w-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            <span className="font-bold">Erreur :</span> {error}
          </div>
        )}

        {/* Section d'action principale : Bouton Trouver le médecin le plus proche et informations de localisation de l'utilisateur */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
          {/* Bouton Trouver le médecin le plus proche */}
          <Button
            onClick={findClosestDoctor}
            disabled={loadingUserLocation || loadingDoctors || isFindingClosestDoctor || userLocation?.permissionStatus !== 'granted'}
            className="w-full md:w-auto px-8 py-3 flex items-center justify-center text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.default,
              borderColor: DEFAULT_PRESET_COLORS.dark,
              '--tw-ring-color': DEFAULT_PRESET_COLORS.light, // Propriété personnalisée pour la couleur de l'anneau
            } as React.CSSProperties} // Cast vers React.CSSProperties
          >
            {isFindingClosestDoctor ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche du plus proche...
              </>
            ) : (
              <>
                <FaSearchLocation className="mr-2 text-xl" /> Trouver le médecin le plus proche
              </>
            )}
          </Button>

          {/* Informations de localisation de l'utilisateur */}
          {userLocation && (
            <div className="p-4 rounded-xl border shadow-sm animate-fade-in w-full md:w-auto flex-grow flex items-start"
              style={{
                backgroundColor: DEFAULT_PRESET_COLORS.lighter,
                borderColor: DEFAULT_PRESET_COLORS.light,
                color: DEFAULT_PRESET_COLORS.dark,
              }}
            >
              <FaMapMarkerAlt className="mr-3 text-xl flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
              <div>
                <h2 className="font-bold text-base mb-1">Votre localisation :</h2>
                {loadingUserLocation ? (
                  <p className="text-sm flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Détection...
                  </p>
                ) : (
                  <>
                    <p className="text-sm">{userLocation.formattedAddress || `Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}`}</p>
                    {userLocation.permissionStatus === 'denied' && (
                      <p className="text-xs mt-1 text-red-600 flex items-center">
                        <FaInfoCircle className="mr-1" /> Localisation refusée. Activez-la dans les paramètres.
                      </p>
                    )}
                    {userLocation.permissionStatus === 'prompt' && (
                      <p className="text-xs mt-1 text-blue-700 flex items-center">
                        <FaInfoCircle className="mr-1" /> Accordez l'autorisation de localisation lorsque vous y êtes invité.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section de la liste des médecins les plus proches */}
        {closestDoctorsList.length > 0 && (
          <>
            <hr className="my-8 border-gray-200" /> {/* Séparateur */}
            <div className="mb-6 p-5 rounded-xl border shadow-sm animate-fade-in"
              style={{
                backgroundColor: DEFAULT_PRESET_COLORS.lighter,
                borderColor: DEFAULT_PRESET_COLORS.light,
                color: DEFAULT_PRESET_COLORS.dark,
              }}
            >
              <h2 className="font-bold text-xl mb-4 flex items-center">
                <FaSortAmountUpAlt className="mr-3 text-2xl" style={{ color: DEFAULT_PRESET_COLORS.default }} /> Top des médecins les plus proches :
              </h2>
              <ul className="space-y-3">
                {closestDoctorsList.slice(0, 5).map((doc, index) => ( // Afficher les 5 premiers dans la liste
                  <li key={doc.id} className="p-3 rounded-lg flex items-center border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {doc.profile_pic && (
                      <Image
                        src={doc.profile_pic}
                        alt={doc.user_name || 'Profil du médecin'}
                        width={50}
                        height={50}
                        className="rounded-full object-cover mr-4 flex-shrink-0 border border-gray-200"
                        unoptimized={true}
                      />
                    )}
                    <div className="flex-grow">
                      <p className="font-semibold text-base" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                        {index + 1}. {doc.user_name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim() || 'Médecin'}
                        {doc.distance !== undefined && <span className="ml-2 text-gray-500 text-sm">({doc.distance.toFixed(2)} km)</span>}
                      </p>
                      {doc.speciality && <p className="text-sm text-gray-600">Spécialité : {doc.speciality}</p>}
                      {(doc.address || doc.city || doc.country) && (
                        <p className="text-xs text-gray-500">
                          {doc.address ? `${doc.address}, ` : ''}
                          {doc.city ? `${doc.city}, ` : ''}
                          {doc.country || ''}
                        </p>
                      )}
                    </div>
                    {/* CECI EST LA LIGNE QUI CAUSE L'ERREUR */}
                    <Link
                      href={
                        routes.doctors?.details // Vérifier si 'doctors' et 'details' existent
                          ? (typeof routes.doctors.details === 'function' // Vérifier si 'details' est une fonction
                            ? routes.doctors.details(doc.id) // Si c'est une fonction, l'appeler
                            : `${routes.doctors.details}/${doc.id}` // Si c'est une chaîne, concaténer
                          )
                          : `/doctors/${doc.id}` // Repli si 'routes.doctors.details' n'est pas défini
                      }
                      passHref
                    >
                      <Button
                        size="sm"
                        className="ml-4 px-4 py-2 rounded-full text-white font-medium"
                        style={{ backgroundColor: DEFAULT_PRESET_COLORS.default }}
                      >
                        Voir le profil
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
              {closestDoctorsList.length > 5 && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  Affichage des 5 meilleurs médecins. Plus sont disponibles sur la carte.
                </p>
              )}
            </div>
          </>
        )}


        <div className="w-full h-[450px] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative flex justify-center">
          {renderMapContent()}
        </div>

        {!loadingDoctors && doctors.length === 0 && !error && (
          <div className="text-center mt-6 p-4 rounded-lg border"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <p className="font-semibold text-lg">Aucun médecin trouvé.</p>
            <p className="text-sm">Nous n'avons pas pu récupérer les localisations des médecins. Veuillez vous assurer que votre backend est en cours d'exécution et accessible.</p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}