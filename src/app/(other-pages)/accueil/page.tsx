// src/app/(other-pages)/find-doctors/page.tsx

'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Text } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaSearchLocation, FaGlobe, FaPhoneAlt, FaEnvelope, FaInfoCircle, FaSortAmountUpAlt, FaUserMd, FaClinicMedical } from 'react-icons/fa';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/config/routes';
import axiosInstance from '@/utils/axiosInstance';

// Color configuration
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3', // Light yellow for backgrounds
  light: '#d39424',    // Medium yellow for borders/accents
  default: '#d39424', // Default button/link color
  dark: '#a16207',     // Darker yellow for text/headings
  foreground: '#ffffff', // White for text on dark backgrounds (not heavily used here)
};

// Constants
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY;

// Interfaces
interface DoctorLocation {
  id: string;
  user_name: string;
  first_name?: string;
  last_name?: string;
  country: string; // This comes from the users table as per your schema
  latitude: number | null;
  longitude: number | null;
  phone?: string;
  office_phone?: string;
  email?: string;
  speciality?: string;
  address?: string;
  city?: string;
  profile_pic?: string;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  countryCode?: string | null;
}

// Map constants
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

const initialMapCenter = {
  lat: 34.0,
  lng: 9.0
};

const initialMapZoom = 2;
// FIX: Corrected type for mapLibraries to be string literals
const mapLibraries: Array<'places' | 'geocoding'> = ['places', 'geocoding'];

// Country centers (for fallback if specific coordinates are missing)
const COUNTRY_CENTERS: { [key: string]: { lat: number; lng: number } } = {
  "TN": { lat: 34.0, lng: 9.0 },
  "MA": { lat: 31.7917, lng: -7.0926 },
  "DZ": { lat: 28.0339, lng: 1.6596 },
  "FR": { lat: 46.603354, lng: 1.888334 },
  "ES": { lat: 40.463667, lng: -3.74922 },
};

// Country Flags (for dropdown display - but now only used internally for sorting)
const COUNTRY_FLAGS: { [key: string]: string } = {
  "TN": "🇹🇳 Tunisia",
  "MA": "🇲🇦 Morocco",
  "DZ": "🇩🇿 Algeria",
  "FR": "🇫🇷 France",
  "ES": "🇪🇸 Spain",
  "US": "🇺🇸 United States",
  "CA": "🇨🇦 Canada",
  "GB": "🇬🇧 United Kingdom",
  "DE": "🇩🇪 Germany",
  "IT": "🇮🇹 Italy",
  "BE": "🇧🇪 Belgium",
  "CH": "🇨🇭 Switzerland",
  "AE": "🇦🇪 United Arab Emirates",
  "SA": "🇸🇦 Saudi Arabia",
  // Add more as needed
};

// Haversine distance formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorLocation[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [closestDoctor, setClosestDoctor] = useState<DoctorLocation | null>(null);
  const [closestDoctorsList, setClosestDoctorsList] = useState<DoctorLocation[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<DoctorLocation | null>(null);
  const [isFindingClosestDoctor, setIsFindingClosestDoctor] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // State for filters
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [userLocationInfoWindowOpen, setUserLocationInfoWindowOpen] = useState(false); // New state for user marker InfoWindow

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: Maps_API_KEY as string,
    libraries: mapLibraries,
    language: 'fr',
    region: 'TN', // Consider making this dynamic based on user's country if detected early
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Memoized filtered doctors based on selectedSpeciality and selectedCountry
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
        const matchesSpeciality = selectedSpeciality ? doc.speciality === selectedSpeciality : true;
        const matchesCountry = selectedCountry ? doc.country?.toUpperCase() === selectedCountry.toUpperCase() : true;
        return matchesSpeciality && matchesCountry;
    });
  }, [doctors, selectedSpeciality, selectedCountry]);

  // Memoized map center and zoom
  const mapCenter = useMemo(() => {
    if (closestDoctor && closestDoctor.latitude !== null && closestDoctor.longitude !== null) {
      return { lat: closestDoctor.latitude, lng: closestDoctor.longitude };
    }
    if (userLocation?.permissionStatus === 'granted' && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    if (filteredDoctors.length > 0) {
      const validDoctors = filteredDoctors.filter(doc => doc.latitude !== null && doc.longitude !== null);
      if (validDoctors.length > 0) {
        const avgLat = validDoctors.reduce((sum, doc) => sum + doc.latitude!, 0) / validDoctors.length;
        const avgLng = validDoctors.reduce((sum, doc) => sum + doc.longitude!, 0) / validDoctors.length;
        return { lat: avgLat, lng: avgLng };
      }
    }
    return initialMapCenter;
  }, [closestDoctor, userLocation, filteredDoctors]);

  const mapZoom = useMemo(() => {
    if (closestDoctor) {
      return 15;
    }
    if (userLocation?.permissionStatus === 'granted' && filteredDoctors.length > 0) {
      return 10;
    }
    if (userLocation?.permissionStatus === 'granted') {
      return 12;
    }
    if (filteredDoctors.length > 0) {
      return 6;
    }
    return initialMapZoom;
  }, [closestDoctor, userLocation, filteredDoctors]);

  // Reverse geocode user location
  const reverseGeocodeUserLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`;
      const res = await fetch(nominatimApiUrl);
      const data = await res.json();

      if (res.ok && data && data.display_name) {
        const fullAddress = data.display_name;
        const countryCode = data.address?.country_code?.toUpperCase() || null;
        setUserLocation(prev => prev ? { ...prev, formattedAddress: fullAddress, countryCode: countryCode } : null);
        toast.success(`Votre localisation détectée : ${fullAddress.split(',')[0]}`);
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

  // Update map bounds and center - modified to optionally fit only specific doctors
  const updateMapBoundsAndCenter = useCallback((
    map: google.maps.Map,
    doctorsToFit: DoctorLocation[],
    currentUserLocation: UserLocation | null,
  ) => {
    if (!map || !window.google || !window.google.maps) {
      console.warn("La carte ou l'API Google Maps n'est pas entièrement prête.");
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    doctorsToFit.forEach(doc => {
      const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
      const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);
      if (docLat !== null && docLng !== null) {
        bounds.extend({ lat: docLat, lng: docLng });
        hasValidLocations = true;
      }
    });

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
          } else if (currentZoom > 15 && doctorsToFit.length <= 2) {
            map.setZoom(15);
          }
        }
      });
    } else {
      map.setCenter(initialMapCenter);
      map.setZoom(initialMapZoom);
    }
  }, []);

  // Map load and unmount handlers
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    updateMapBoundsAndCenter(map, filteredDoctors, userLocation);
  }, [filteredDoctors, userLocation, updateMapBoundsAndCenter]);


  const onMapUnmount = useCallback(() => {
    mapInstanceRef.current = null;
    setActiveInfoWindow(null);
  }, []);

  // Map styles
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'on' }] },
      { featureType: 'transit', stylers: [{ visibility: 'on' }] },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#aadaff' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#c5c5c5' }]
      }
    ],
  }), []);

  // Fetch doctors data
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
        setError(`Échec du chargement des médecins : ${err.message}. Veuillez vérifier votre connexion réseau.`);
        toast.error(`Échec du chargement des médecins : ${err.message}.`);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Get user location
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      toast.error("La géolocalisation n'est pas prise en charge par votre navigateur.");
      setLoadingUserLocation(false);
      setUserLocation({
        latitude: 0,
        longitude: 0,
        formattedAddress: null,
        permissionStatus: 'denied',
        countryCode: null
      });
      return;
    }

    setLoadingUserLocation(true);

    const handleGeolocationSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
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
          errorMessage = "Accès à la localisation refusé. Veuillez l'activer dans les paramètres du navigateur.";
          permissionState = 'denied';
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = "Les informations de localisation sont indisponibles.";
          break;
        case geoError.TIMEOUT:
          errorMessage = "La demande de localisation a expiré. Réessayez ou vérifiez votre connexion.";
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
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
      setUserLocation(prev => prev ? { ...prev, permissionStatus: currentPermission } : {
        latitude: 0,
        longitude: 0,
        formattedAddress: null,
        permissionStatus: currentPermission,
        countryCode: null
      });
    });
  }, [isLoaded, reverseGeocodeUserLocation]);

  // Function to calculate and update closest doctors for the LIST view
  const calculateDoctorsForList = useCallback(() => {
    if (filteredDoctors.length === 0) {
      setClosestDoctorsList([]);
      setClosestDoctor(null); // Clear closest doctor if no doctors
      return;
    }

    if (!userLocation || userLocation.permissionStatus !== 'granted') {
      // If no valid user location, just show filtered doctors without distance
      setClosestDoctorsList(filteredDoctors.map(doc => ({ ...doc, distance: undefined })));
      setClosestDoctor(null); // Ensure closestDoctor is null if no valid location
      return;
    }

    const doctorsWithDistance: DoctorLocation[] = filteredDoctors
      .map(doc => {
        const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
        const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

        if (docLat !== null && docLng !== null) {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            docLat,
            docLng
          );
          return { ...doc, distance };
        }
        return null;
      })
      .filter(Boolean) as DoctorLocation[];

    doctorsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    setClosestDoctorsList(doctorsWithDistance);

    // Don't set closestDoctor or activeInfoWindow here, only for the list calculation.
    // The closestDoctor state will be handled by `focusMapOnClosestDoctors` for map interactions.
  }, [userLocation, filteredDoctors]);


  // Effect to automatically calculate closest doctors list when data is ready or filters change
  useEffect(() => {
    if (!loadingDoctors && !loadingUserLocation) {
      calculateDoctorsForList();
    }
    // When filters change, also reset the active info window and closest doctor
    setActiveInfoWindow(null);
    setClosestDoctor(null);
    if (mapInstanceRef.current) {
      // Fit all filtered doctors and user location when filters change
      updateMapBoundsAndCenter(mapInstanceRef.current, filteredDoctors, userLocation);
    }
  }, [doctors, userLocation, loadingDoctors, loadingUserLocation, calculateDoctorsForList, filteredDoctors, updateMapBoundsAndCenter]);


  // Function to focus the map and set activeInfoWindow on closest doctors (called by button)
  const focusMapOnClosestDoctors = useCallback(() => {
    setIsFindingClosestDoctor(true);
    if (!userLocation || userLocation.permissionStatus !== 'granted') {
      toast.error("Votre localisation est requise pour trouver le médecin le plus proche et ajuster la carte.");
      setIsFindingClosestDoctor(false);
      setClosestDoctor(null); // Clear any previous closest doctor if location denied
      setActiveInfoWindow(null);
      return;
    }

    // Recalculate based on current state of filteredDoctors
    const doctorsWithDistance: DoctorLocation[] = filteredDoctors
      .map(doc => {
        const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
        const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

        if (docLat !== null && docLng !== null && userLocation) {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            docLat,
            docLng
          );
          return { ...doc, distance };
        }
        return null;
      })
      .filter(Boolean) as DoctorLocation[];

    doctorsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    if (doctorsWithDistance.length > 0) {
      const topDoctors = doctorsWithDistance.slice(0, 5); // Consider top 5 for map fitting
      setClosestDoctor(doctorsWithDistance[0]); // Only the very closest is stored
      setActiveInfoWindow(doctorsWithDistance[0]); // Set info window for the closest one

      if (mapInstanceRef.current && userLocation) {
        updateMapBoundsAndCenter(mapInstanceRef.current, topDoctors, userLocation);
      }
      toast.success(`Médecin le plus proche trouvé : ${doctorsWithDistance[0].user_name || 'Médecin'} (${doctorsWithDistance[0].distance?.toFixed(2)} km)`);
    } else {
      toast.info("Aucun médecin trouvé à proximité avec les filtres actuels.");
      setClosestDoctor(null);
      setActiveInfoWindow(null);
      if (mapInstanceRef.current) { // Reset map if no doctors found after search
        updateMapBoundsAndCenter(mapInstanceRef.current, [], userLocation);
      }
    }
    setIsFindingClosestDoctor(false);
  }, [userLocation, filteredDoctors, updateMapBoundsAndCenter]);

  // Extract unique specialities for filter dropdown
  const uniqueSpecialities = useMemo(() => {
    const specialities = new Set<string>();
    doctors.forEach(doc => {
      if (doc.speciality) {
        specialities.add(doc.speciality);
      }
    });
    return Array.from(specialities).sort();
  }, [doctors]);

  // FIX: Extract unique countries for filter dropdown to show only country codes
  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    doctors.forEach(doc => {
      if (doc.country && doc.country.trim() !== '') {
        countries.add(doc.country.toUpperCase());
      }
    });
    // Sort by country code (alphabetically)
    return Array.from(countries).sort();
  }, [doctors]);

  // Render map content
  const renderMapContent = () => {
    if (loadError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-700 text-lg font-semibold z-10 p-4 rounded-xl text-center">
          <p className="mb-2">🚨 Erreur de chargement de Google Maps.</p>
          <p className="text-base font-normal">{loadError.message}</p>
          <p className="text-sm mt-2">Veuillez vérifier votre clé API et votre connexion réseau.</p>
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
        {/* User location marker */}
        {userLocation?.permissionStatus === 'granted' && (
          <>
            <Marker
              position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
              title="Votre position"
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Explicit blue dot icon
                scaledSize: new window.google.maps.Size(32, 32)
              }}
              onClick={() => setUserLocationInfoWindowOpen(true)}
            />
            {userLocationInfoWindowOpen && (
              <InfoWindow
                position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                onCloseClick={() => setUserLocationInfoWindowOpen(false)}
              >
                <div className="p-2 text-center">
                  <h3 className="font-bold text-base">Votre Position</h3>
                  <p className="text-sm text-gray-700">{userLocation.formattedAddress || 'Position exacte'}</p>
                </div>
              </InfoWindow>
            )}
          </>
        )}

        {/* Doctor markers (filteredDoctors used here) */}
        {filteredDoctors.map(doc => {
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
                  url: (closestDoctor && closestDoctor.id === doc.id)
                    ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' // Red for the *single* closest doctor after button press
                    : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green for all other doctors
                  scaledSize: new window.google.maps.Size(32, 32)
                }}
              />
            );
          }
          return null;
        })}

        {/* Info window for doctors */}
        {activeInfoWindow && (
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
              {activeInfoWindow.speciality && (
                <p className="text-sm text-gray-600 text-center flex items-center justify-center">
                  <FaUserMd className="mr-1" /> {activeInfoWindow.speciality}
                </p>
              )}
              {(activeInfoWindow.address || activeInfoWindow.city || activeInfoWindow.country) && (
                <p className="text-sm text-gray-600 flex items-center justify-center text-center">
                  <FaMapMarkerAlt className="mr-1 text-gray-500 flex-shrink-0" />
                  {activeInfoWindow.address ? `${activeInfoWindow.address}, ` : ''}
                  {activeInfoWindow.city ? `${activeInfoWindow.city}, ` : ''}
                  {COUNTRY_FLAGS[activeInfoWindow.country?.toUpperCase() || ''] || activeInfoWindow.country || ''}
                </p>
              )}
              {(activeInfoWindow.phone || activeInfoWindow.office_phone) && (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <FaPhoneAlt className="mr-1 text-gray-500" />
                  <a href={`tel:${activeInfoWindow.office_phone || activeInfoWindow.phone}`} className="hover:underline">
                    {activeInfoWindow.office_phone || activeInfoWindow.phone}
                  </a>
                </p>
              )}
              {activeInfoWindow.email && (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <FaEnvelope className="mr-1 text-gray-500" />
                  <a href={`mailto:${activeInfoWindow.email}`} className="hover:underline">{activeInfoWindow.email}</a>
                </p>
              )}
              {activeInfoWindow.distance !== undefined && (
                <p className="text-sm text-gray-700 text-center mt-2">
                  <strong>Distance :</strong> {activeInfoWindow.distance.toFixed(2)} km
                </p>
              )}
              <Link
                href={routes.doctors.details(activeInfoWindow.id)}
                passHref
                className="mt-3"
              >
                <Button
                  size="sm"
                  className="w-full px-4 py-2 rounded-full text-white font-medium"
                  style={{ backgroundColor: DEFAULT_PRESET_COLORS.default }}
                >
                  Voir le profil
                </Button>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
        <header className="text-center mb-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
            style={{
              color: DEFAULT_PRESET_COLORS.dark,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Trouvez Votre <span style={{ color: DEFAULT_PRESET_COLORS.default }}>Médecin</span>
          </h1>
          <p className="text-center text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto">
            Découvrez facilement les professionnels de la santé près de chez vous.
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

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
          <Button
            onClick={focusMapOnClosestDoctors} // This button now calls the specific map focus function
            disabled={loadingUserLocation || loadingDoctors || isFindingClosestDoctor || userLocation?.permissionStatus !== 'granted'}
            className="w-full md:w-auto px-8 py-3 flex items-center justify-center text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.default,
              borderColor: DEFAULT_PRESET_COLORS.dark,
              '--tw-ring-color': DEFAULT_PRESET_COLORS.light,
            } as React.CSSProperties}
          >
            {isFindingClosestDoctor ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche en cours...
              </>
            ) : (
              <>
                <FaSearchLocation className="mr-2 text-xl" /> Trouver les médecins les plus proches (sur carte)
              </>
            )}
          </Button>

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
                <h2 className="font-bold text-base mb-1">Votre position :</h2>
                {loadingUserLocation ? (
                  <p className="text-sm flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Détection en cours...
                  </p>
                ) : (
                  <>
                    <p className="text-sm">{userLocation.formattedAddress || `Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}`}</p>
                    {userLocation.permissionStatus === 'denied' && (
                      <p className="text-xs mt-1 text-red-600 flex items-center">
                        <FaInfoCircle className="mr-1" /> Localisation refusée. Activez-la dans les paramètres.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <div className="relative w-full sm:w-1/2 md:w-1/3">
                <FaUserMd className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedSpeciality}
                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, color: DEFAULT_PRESET_COLORS.dark, borderColor: DEFAULT_PRESET_COLORS.light }}
                >
                    <option value="">Toutes les spécialités</option>
                    {uniqueSpecialities.map(speciality => (
                        <option key={speciality} value={speciality}>{speciality}</option>
                    ))}
                </select>
            </div>
            <div className="relative w-full sm:w-1/2 md:w-1/3">
                <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, color: DEFAULT_PRESET_COLORS.dark, borderColor: DEFAULT_PRESET_COLORS.light }}
                >
                    <option value="">Tous les pays</option>
                    {/* FIX: Only show country codes in the option text as requested */}
                    {uniqueCountries.map(countryCode => (
                        <option key={countryCode} value={countryCode}>
                            {countryCode} {/* Show only the country code */}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* View mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'map' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={{ backgroundColor: viewMode === 'map' ? DEFAULT_PRESET_COLORS.default : '' }}
            >
              <FaGlobe className="inline mr-1" /> Carte
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={{ backgroundColor: viewMode === 'list' ? DEFAULT_PRESET_COLORS.default : '' }}
            >
              <FaSortAmountUpAlt className="inline mr-1" /> Liste
            </button>
          </div>
        </div>

        {/* Doctors list or map view */}
        {viewMode === 'list' ? (
          <div className="mb-6">
            {closestDoctorsList.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Médecin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spécialité
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adresse
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {closestDoctorsList.map((doc, index) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          {doc.profile_pic && (
                            <Image
                              src={doc.profile_pic}
                              alt={doc.user_name || 'Profil du médecin'}
                              width={40}
                              height={40}
                              className="rounded-full object-cover mr-3"
                              unoptimized={true}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.user_name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim()}</div>
                            <div className="text-sm text-gray-500">{doc.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.speciality || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {doc.address || 'Non spécifiée'}, {doc.city || ''}, {COUNTRY_FLAGS[doc.country?.toUpperCase() || ''] || doc.country || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userLocation?.permissionStatus === 'granted' && doc.distance !== undefined ? `${doc.distance.toFixed(2)} km` : 'Localisation requise'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={routes.doctors.details(doc.id)} passHref>
                            <Button
                              size="sm"
                              className="px-4 py-2 rounded-full text-white font-medium mr-2"
                              style={{ backgroundColor: DEFAULT_PRESET_COLORS.default }}
                            >
                              Voir le profil
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="px-4 py-2 rounded-full border border-gray-300 font-medium"
                            onClick={() => {
                              setActiveInfoWindow(doc);
                              if (mapInstanceRef.current) {
                                const markerLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
                                const markerLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);
                                if (markerLat !== null && markerLng !== null) {
                                  mapInstanceRef.current.setCenter({ lat: markerLat, lng: markerLng });
                                  mapInstanceRef.current.setZoom(15);
                                }
                              }
                              setClosestDoctor(null); // Clear closest doctor state so map icon resets
                              setViewMode('map');
                            }}
                          >
                            <FaMapMarkerAlt className="mr-1" /> Voir sur la carte
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                {loadingDoctors || loadingUserLocation ? (
                  <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des médecins...</h3>
                  </div>
                ) : (
                  <>
                    <FaClinicMedical className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun médecin trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {userLocation?.permissionStatus === 'denied'
                        ? "Veuillez activer votre localisation pour trouver des médecins à proximité ou ajuster les filtres."
                        : "Aucun médecin n'a été trouvé avec les filtres actuels ou la base de données est vide."}
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => setViewMode('map')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
                        style={{ backgroundColor: DEFAULT_PRESET_COLORS.default }}
                      >
                        <FaGlobe className="mr-2" />
                        Voir la carte
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[500px] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative flex justify-center">
            {renderMapContent()}
          </div>
        )}

        {!loadingDoctors && doctors.length === 0 && !error && (
          <div className="text-center mt-6 p-4 rounded-lg border"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <p className="font-semibold text-lg">Aucun médecin trouvé.</p>
            <p className="text-sm">Nous n'avons pas pu récupérer les localisations des médecins.</p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}