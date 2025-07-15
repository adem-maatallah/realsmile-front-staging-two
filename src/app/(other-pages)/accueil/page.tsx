'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Text, Select, SelectOption } from 'rizzui';
import toast from 'react-hot-toast'; // Revert to standard default import
import { Toaster } from 'react-hot-toast'; // Import Toaster component
import { FaMapMarkerAlt, FaSearchLocation, FaGlobe, FaPhoneAlt, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';

// config/colors.ts (Assuming this file exists and is correctly imported)
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3', // Yellow 100
  light: '#fde047', // Yellow 300
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
  latitude: number | null; // Can be null if not precise
  longitude: number | null; // Can be null if not precise
  phone?: string;
  office_phone?: string;
  email?: string;
  speciality?: string;
  address?: string;
  city?: string;
  profile_pic?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  countryCode?: string | null; // Keep for toast/dropdown suggestion, not core map logic
}

// --- Environment Variables ---
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY; // IMPORTANT: Ensure this is correctly set in your .env.local or .env file

// --- Haversine Formula ---
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// --- Map Constants ---
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

const initialMapCenter = {
  lat: 34.0, // A more central point for Tunisia, can be adjusted
  lng: 9.0
};
const initialMapZoom = 2; // Default world view zoom (showing entire world)

const mapLibraries: google.maps.Libraries[] = ['places', 'geocoding'];

// Predefined central coordinates for countries (expand as needed)
const COUNTRY_CENTERS: { [key: string]: { lat: number; lng: number } } = {
  "TN": { lat: 34.0, lng: 9.0 },
  "MA": { lat: 31.7917, lng: -7.0926 },
  "DZ": { lat: 28.0339, lng: 1.6596 },
  "FR": { lat: 46.603354, lng: 1.888334 },
  "ES": { lat: 40.463667, lng: -3.74922 },
  // Add more countries here
};

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorLocation[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [closestDoctor, setClosestDoctor] = useState<DoctorLocation | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // For manual filter
  const [availableCountries, setAvailableCountries] = useState<SelectOption[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<DoctorLocation | null>(null);
  const [isFindingClosestDoctor, setIsFindingClosestDoctor] = useState(false);

  // Derived state for map center and zoom, reactive to userLocation
  const actualMapCenter = useMemo(() => {
    if (userLocation?.permissionStatus === 'granted' && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return initialMapCenter;
  }, [userLocation]);

  const actualMapZoom = useMemo(() => {
    if (userLocation?.permissionStatus === 'granted') {
      return 14; // Good local zoom when user location is known
    }
    return initialMapZoom; // Default world view zoom
  }, [userLocation]);


  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY as string, // Ensure MAPS_API_KEY is correctly loaded from .env
    libraries: mapLibraries,
    language: 'en',
    region: 'TN',
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Function to perform reverse geocoding using OpenStreetMap Nominatim
  const reverseGeocodeUserLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(nominatimApiUrl);
      const data = await res.json();

      if (res.ok && data && data.display_name) {
        const fullAddress = data.display_name;
        const countryCode = data.address?.country_code?.toUpperCase() || null;

        setUserLocation(prev => prev ? { ...prev, formattedAddress: fullAddress, countryCode: countryCode } : null);
        toast.success(`Your general location detected: ${fullAddress.split(',')[0]}`);
      } else {
        const errorMessage = data.error || 'Address not found via OpenStreetMap.';
        toast.error(`Address lookup failed: ${errorMessage}`);
        setUserLocation(prev => prev ? { ...prev, formattedAddress: errorMessage, countryCode: null } : null);
      }
    } catch (err) {
      console.error("Nominatim Geocoding failed:", err);
      toast.error("Address lookup failed via OpenStreetMap.");
      setUserLocation(prev => prev ? { ...prev, formattedAddress: 'Geocoding request failed', countryCode: null } : null);
    }
  }, []);

  // --- Function to encapsulate map bounds and center logic ---
  const updateMapBoundsAndCenter = useCallback((
    map: google.maps.Map,
    currentDoctors: DoctorLocation[],
    currentUserLocation: UserLocation | null,
    // Note: effectiveCountryFilter is used for filtering `doctorsToDisplayOnMap`
    // If null, all doctors are considered for bounds.
    effectiveCountryFilter: string | null
  ) => {
    if (!map || !window.google || !window.google.maps) {
      console.warn("Map or Google Maps API not fully ready for updateMapBoundsAndCenter.");
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    // Determine which doctors to include in bounds calculation
    // Always consider all doctors first, then filter if a specific country is requested for bounds adjustment
    let doctorsForBounds = currentDoctors;
    if (effectiveCountryFilter) {
        const filteredByCountry = currentDoctors.filter(doc => doc.country && doc.country.toUpperCase() === effectiveCountryFilter.toUpperCase());
        // If filtered list is not empty, use it. Otherwise, use all doctors.
        if (filteredByCountry.length > 0) {
            doctorsForBounds = filteredByCountry;
        } else {
            console.log(`No doctors found for bounds in ${effectiveCountryFilter}. Using all doctors.`);
            doctorsForBounds = currentDoctors;
        }
    }
    
    doctorsForBounds.forEach(doc => {
      // Use doctor's specific lat/long if available, else fallback to country center
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
          if (currentZoom < 4) { // Prevent zooming too far out
            map.setZoom(4);
          } else if (currentZoom > 15 && doctorsForBounds.length + (currentUserLocation ? 1 : 0) <= 2) {
            // If only 1-2 markers, zoom in closer
            map.setZoom(15);
          }
        }
      });
    } else {
      // If no valid locations to fit, revert to initial/default view
      map.setCenter(initialMapCenter);
      map.setZoom(initialMapZoom);
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    console.log("Map instance loaded and set in ref.");
    // Initial centering and bounds will be handled by the main useEffect below,
    // which reacts to isLoaded, userLocation, and doctors data.
    // No need to set center/zoom or call updateMapBoundsAndCenter here directly.
  }, []);

  const onMapUnmount = useCallback(() => {
    mapInstanceRef.current = null;
    setActiveInfoWindow(null);
    console.log("Map instance unmounted from ref.");
  }, []);

  // Custom map styles for a cleaner look
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

  // --- 1. Fetch Doctor Locations ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError(null);
        const response = await fetch(`${BACKEND_API_BASE_URL}/doctors/locations`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch doctor locations.');
        }
        const data: DoctorLocation[] = await response.json();
        setDoctors(data);

        const countries = Array.from(new Set(data.map(d => d.country)))
          .filter(country => country && country.trim() !== '')
          .map(country => ({
            label: country,
            value: country
          }));
        setAvailableCountries([{ label: 'All Countries', value: '' }, ...countries.sort((a, b) => a.label.localeCompare(b.label))]);

      } catch (err: any) {
        console.error('Error fetching doctors:', err);
        setError(`Failed to load doctors: ${err.message}. Please check your network connection and backend server.`);
        toast.error(`Failed to load doctors: ${err.message}.`); // Using `toast` directly
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // --- 2. Get User Location Automatically on load ---
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) {
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a browser that supports it.');
      toast.error('Geolocation is not supported by your browser.'); // Using `toast` directly
      setLoadingUserLocation(false);
      setUserLocation({ latitude: 0, longitude: 0, formattedAddress: null, permissionStatus: 'denied', countryCode: null });
      return;
    }

    setLoadingUserLocation(true);

    const handleGeolocationSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      console.log(`Geolocation successful: Lat ${latitude}, Lng ${longitude}`);
      setUserLocation(prev => ({
        ...prev!,
        latitude,
        longitude,
        formattedAddress: null, // Will be filled by Nominatim (for toast only)
        permissionStatus: 'granted'
      }));
      setError(null);
      setLoadingUserLocation(false);
      reverseGeocodeUserLocation(latitude, longitude);
    };

    const handleGeolocationError = (geoError: GeolocationPositionError) => {
      let errorMessage = 'Failed to get your location automatically.';
      let permissionState: 'denied' | 'prompt' | 'unknown' = 'unknown';

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user. Please enable it in browser settings.';
          permissionState = 'denied';
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable (e.g., network error, GPS off).';
          break;
        case geoError.TIMEOUT:
          errorMessage = 'The request to get user location timed out. Try again or check network.';
          break;
        default:
          errorMessage = `An unknown error occurred while detecting location: ${geoError.message}`;
          break;
      }
      setError(errorMessage);
      toast.error(errorMessage); // Using `toast` directly
      console.error('Geolocation Error:', geoError);
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

    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      const currentPermission = permissionStatus.state;
      setUserLocation(prev => prev ? { ...prev, permissionStatus: currentPermission } : { latitude: 0, longitude: 0, formattedAddress: null, permissionStatus: currentPermission, countryCode: null });

      if (currentPermission === 'granted') {
        navigator.geolocation.getCurrentPosition(
          handleGeolocationSuccess,
          handleGeolocationError,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      } else if (currentPermission === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          handleGeolocationSuccess,
          handleGeolocationError,
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else if (currentPermission === 'denied') {
        setLoadingUserLocation(false);
        setError('Location access previously denied. Please enable it in your browser settings to use location features.');
        toast.error('Location access denied. Please enable it in browser settings.'); // Using `toast` directly
        setUserLocation(prev => ({ ...prev!, permissionStatus: 'denied', countryCode: null }));
      } else {
        setLoadingUserLocation(false);
        setError('Location permission status is uncertain. Please try again.');
        toast.info('Location permission needed.'); // Using `toast` directly
        setUserLocation(prev => ({ ...prev!, permissionStatus: 'unknown', countryCode: null }));
      }
    });
  }, [isLoaded, reverseGeocodeUserLocation]);

  // --- 3. Main Effect to control map view based on data readiness ---
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    // Condition 1: All data is loaded (doctors and user location)
    if (!loadingDoctors && !loadingUserLocation) {
      console.log("All necessary data loaded, triggering map bounds update.");
      // For general map display, use `selectedCountry` if user manually chose a filter, otherwise null to consider all for initial bounds.
      updateMapBoundsAndCenter(map, doctors, userLocation, selectedCountry);
    }
    // Condition 2: Map is loaded, and user location is available (but doctors might still be loading)
    else if (userLocation?.permissionStatus === 'granted' && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
      console.log("User location granted and map ready, centering on user.");
      map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      map.setZoom(14); // Good local zoom
    }
    // Condition 3: Doctors data is loaded, but user location is NOT granted/loaded
    // We still want to show all doctors if they're loaded
    else if (!loadingDoctors && doctors.length > 0) {
        console.log("Doctors data loaded, but user location not available/granted. Displaying all doctors.");
        const bounds = new window.google.maps.LatLngBounds();
        doctors.forEach(doc => {
            // Use doctor's specific lat/long if available, else fallback to country center
            const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
            const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);
            if (docLat !== null && docLng !== null) {
                bounds.extend({ lat: docLat, lng: docLng });
            }
        });
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds);
            google.maps.event.addListenerOnce(map, 'idle', () => {
              const currentZoom = map.getZoom();
              if (currentZoom !== undefined && currentZoom < 4) { // Prevent zooming too far out
                map.setZoom(4);
              }
            });
        } else {
            // If no valid doctor locations for bounds, revert to default world view
            map.setCenter(initialMapCenter);
            map.setZoom(initialMapZoom);
        }
    }
    // Condition 4: Fallback - Default map view or waiting for data/permission
    else {
      console.log("Default map view or waiting for data/permission.");
      map.setCenter(initialMapCenter);
      map.setZoom(initialMapZoom);
    }
  }, [isLoaded, doctors, userLocation, selectedCountry, updateMapBoundsAndCenter, loadingDoctors, loadingUserLocation, actualMapCenter, actualMapZoom]);


  const findClosestDoctor = useCallback(() => {
    setIsFindingClosestDoctor(true);
    if (!userLocation || userLocation.latitude === undefined || userLocation.longitude === undefined || userLocation.permissionStatus !== 'granted') {
      toast.error('Your **granted location permission** is required to find the closest doctor. Please enable it in your browser settings.');
      setIsFindingClosestDoctor(false);
      return;
    }

    let closest: DoctorLocation | null = null;
    let minDistance = Infinity;

    let doctorsToSearch = [...doctors]; // Start with all doctors

    // Apply filtering logic for "Find Closest" button
    // Priority: Manual filter > User's detected country filter > No filter (search all)
    if (selectedCountry) {
        const filteredBySelectedCountry = doctors.filter(doc => doc.country && doc.country.toUpperCase() === selectedCountry.toUpperCase());
        if (filteredBySelectedCountry.length > 0) {
            doctorsToSearch = filteredBySelectedCountry;
            toast.info(`Searching for closest doctor within selected country: ${selectedCountry}.`);
        } else {
            toast.info(`No doctors found in selected country ${selectedCountry}. Searching globally for closest.`);
            // No change to doctorsToSearch here, it remains all doctors
        }
    } else if (userLocation.countryCode) { // If no manual filter, try user's detected country
        const filteredByUserCountry = doctors.filter(doc => doc.country && doc.country.toUpperCase() === userLocation.countryCode.toUpperCase());
        if (filteredByUserCountry.length > 0) {
            doctorsToSearch = filteredByUserCountry;
            toast.info(`Searching for closest doctor within your detected country: ${userLocation.countryCode}.`);
        } else {
            toast.info(`No doctors found in your detected country ${userLocation.countryCode}. Searching globally for closest.`);
            // No change to doctorsToSearch here, it remains all doctors
        }
    } else {
        toast.info('No country filter applied for closest doctor search. Searching globally.');
    }


    if (doctorsToSearch.length === 0) {
      toast.info('No doctors available to calculate the closest one.');
      setClosestDoctor(null);
      setIsFindingClosestDoctor(false);
      return;
    }

    doctorsToSearch.forEach(doc => {
      // Use doctor's precise coordinates if available, otherwise fallback to country center
      const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
      const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

      if (docLat !== null && docLng !== null && userLocation) {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          docLat,
          docLng
        );
        if (distance < minDistance) {
          minDistance = distance;
          closest = doc;
        }
      }
    });

    setClosestDoctor(closest);

    if (closest && mapInstanceRef.current && userLocation) {
      const map = mapInstanceRef.current;
      const newBounds = new window.google.maps.LatLngBounds();
      newBounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
      
      // Ensure the closest doctor's location is added correctly (using fallback if needed)
      const closestDocLat = closest.latitude !== null ? closest.latitude : (COUNTRY_CENTERS[closest.country?.toUpperCase() || '']?.lat || null);
      const closestDocLng = closest.longitude !== null ? closest.longitude : (COUNTRY_CENTERS[closest.country?.toUpperCase() || '']?.lng || null);

      if (closestDocLat !== null && closestDocLng !== null) {
        newBounds.extend({ lat: closestDocLat, lng: closestDocLng });
      }

      if (!newBounds.isEmpty()) {
        map.fitBounds(newBounds);
        google.maps.event.addListenerOnce(map, 'idle', () => {
          const currentZoom = map.getZoom();
          if (currentZoom !== undefined && currentZoom > 15) {
            map.setZoom(15);
          }
        });
      }

      toast.success(`Closest doctor found: ${closest.user_name || 'Doctor'} (${minDistance.toFixed(2)} km away)`);
      setActiveInfoWindow(closest);
    } else if (closest) {
      toast.success(`Closest doctor found: ${closest.user_name || 'Doctor'}`);
    } else {
      toast.info('No doctors found in your vicinity or selected country.');
    }
    setIsFindingClosestDoctor(false);
  }, [userLocation, doctors, selectedCountry]);

  const handleCountryChange = useCallback((value: string | null) => {
    setSelectedCountry(value);
    setClosestDoctor(null);
    setActiveInfoWindow(null);
    if (mapInstanceRef.current) {
        // When manual country changes, the main useEffect will re-evaluate and call updateMapBoundsAndCenter.
        // We just need to trigger a re-render by changing selectedCountry.
        // The updateMapBoundsAndCenter will use `value` as `effectiveCountryFilter`.
        updateMapBoundsAndCenter(mapInstanceRef.current, doctors, userLocation, value);
    }
  }, [doctors, userLocation, updateMapBoundsAndCenter]);

  const renderMapContent = () => {
    if (loadError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-700 text-lg font-semibold z-10 p-4 rounded-xl text-center">
          <p className="mb-2">🚨 Error loading Google Maps.</p>
          <p className="text-base font-normal">{loadError.message}</p>
          <p className="text-sm mt-2">Please check your API key, billing setup, and network connection.</p>
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
          Loading Map...
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={actualMapCenter} // Uses derived center
        zoom={actualMapZoom}     // Uses derived zoom
        options={mapOptions}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {/* User Location Marker */}
        {userLocation && userLocation.permissionStatus === 'granted' && (
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="Your Location"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // A clearer blue dot
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {/* Doctor Markers */}
        {/* All doctors are rendered here. Their position is determined by lat/long or country center fallback. */}
        {doctors.map(doc => {
            // Determine marker position: Use doctor's precise coordinates if available,
            // otherwise fallback to country center if country is known.
            const markerLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
            const markerLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

            if (markerLat !== null && markerLng !== null) {
                return (
                    <Marker
                        key={doc.id}
                        position={{ lat: markerLat, lng: markerLng }}
                        title={doc.user_name || 'Doctor'}
                        onClick={() => setActiveInfoWindow(doc)}
                        icon={{
                            url: closestDoctor?.id === doc.id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Green for closest, red for others
                            scaledSize: new window.google.maps.Size(32, 32)
                        }}
                    />
                );
            }
            return null; // Don't render marker if no valid position
        })}

        {/* Info Window */}
        {activeInfoWindow && (activeInfoWindow.latitude !== null || COUNTRY_CENTERS[activeInfoWindow.country?.toUpperCase() || '']) && (
          <InfoWindow
            // Position for InfoWindow should ideally be the precise lat/long if available,
            // otherwise use the fallback country center used for the marker.
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
                    alt={activeInfoWindow.user_name || 'Doctor Profile'}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-gray-300 shadow-md"
                    unoptimized={true}
                  />
                </div>
              )}
              <h3 className="font-bold text-lg text-center" style={{ color: DEFAULT_PRESET_COLORS.default }}>
                {activeInfoWindow.user_name || `${activeInfoWindow.first_name || ''} ${activeInfoWindow.last_name || ''}`.trim() || 'Doctor'}
              </h3>
              {activeInfoWindow.speciality && <p className="text-sm text-gray-600 text-center"><strong>Speciality:</strong> {activeInfoWindow.speciality}</p>}
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
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center"
      style={{
        background: `linear-gradient(to bottom right, ${DEFAULT_PRESET_COLORS.lighter}, ${DEFAULT_PRESET_COLORS.light})`,
      }}
    >
      <div className="max-w-7xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border-px border-gray-200">
        <header className="text-center mb-10">
          <h1
            className="text-6xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
            style={{
              color: DEFAULT_PRESET_COLORS.dark,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Find Your <span style={{ color: DEFAULT_PRESET_COLORS.default }}>Perfect Doctor</span>
          </h1>
          <p className="text-center text-gray-700 text-xl max-w-3xl mx-auto">
            Easily discover top-rated healthcare professionals nearby or in any chosen country.
            Your health, your choice, simplified.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 font-medium text-base border border-red-200 animate-fade-in flex items-center">
            <svg className="h-6 w-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-end">
          {/* Country Filter */}
          <div>
            <Text className="block text-gray-700 text-base font-semibold mb-2 flex items-center">
              <FaGlobe className="mr-2 text-gray-500" /> Filter by Country:
            </Text>
            <Select
              options={availableCountries}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder={loadingDoctors ? "Loading countries..." : "Select a country"}
              className="w-full [&_button]:!h-12"
              dropdownClassName="z-50"
              disabled={loadingDoctors}
            />
          </div>

          {/* Find Closest Doctor Button */}
          <div className="flex flex-col justify-end">
            
          </div>
        </div>

        {loadingDoctors && (
          <div className="text-center text-gray-500 mt-6 text-base p-4 rounded-lg border animate-pulse"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <p className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading doctor data...
            </p>
          </div>
        )}

        {loadingUserLocation && !userLocation && !error && (
          <div className="text-center text-gray-500 mt-6 text-base p-4 rounded-lg border animate-pulse"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <p className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Attempting to detect your current location...
            </p>
          </div>
        )}

        {userLocation && (
          <div className="mb-6 p-5 rounded-xl border shadow-sm animate-fade-in flex items-start"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <FaMapMarkerAlt className="mr-4 text-2xl flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
            <div>
              <h2 className="font-bold text-xl mb-2">Your Detected Location:</h2>
              {loadingUserLocation ? (
                <p className="text-base flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting coordinates and permission status...
                </p>
              ) : (
                <>
                  <p className="text-base">Latitude: <span className="font-mono">{userLocation.latitude.toFixed(6)}</span></p>
                  <p className="text-base">Longitude: <span className="font-mono">{userLocation.longitude.toFixed(6)}</span></p>
                  {userLocation.countryCode && <p className="text-base">Country: <span className="font-mono">{userLocation.countryCode}</span></p>}
                  {userLocation.permissionStatus === 'denied' && (
                    <p className="text-sm mt-2 text-red-600 flex items-center">
                      <FaInfoCircle className="mr-1" /> Location access denied. Please enable it in your browser settings.
                    </p>
                  )}
                  {userLocation.permissionStatus === 'prompt' && (
                    <p className="text-sm mt-2 text-blue-700 flex items-center">
                      <FaInfoCircle className="mr-1" /> Please grant location permission when prompted by your browser.
                    </p>
                  )}
                </>
              )}
              <p className="text-sm mt-2" style={{ color: DEFAULT_PRESET_COLORS.dark }}>Your location is marked with a blue dot on the map.</p>
            </div>
          </div>
        )}

        {closestDoctor && (
          <div className="mb-6 p-5 rounded-xl border shadow-sm animate-fade-in flex items-start"
            style={{
              backgroundColor: DEFAULT_PRESET_COLORS.lighter,
              borderColor: DEFAULT_PRESET_COLORS.light,
              color: DEFAULT_PRESET_COLORS.dark,
            }}
          >
            <FaSearchLocation className="mr-4 text-2xl flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }} />
            <div>
              <h2 className="font-bold text-xl mb-2">Closest Doctor Found:</h2>
              <p className="font-bold text-lg mb-1" style={{ color: DEFAULT_PRESET_COLORS.default }}>{closestDoctor.user_name || 'Doctor'}</p>
              {closestDoctor.speciality && <p className="text-sm mb-1">Speciality: {closestDoctor.speciality}</p>}
              <p className="text-base mb-1">Country: {closestDoctor.country}</p>
              {closestDoctor.address && <p className="text-base mb-1">Address: {closestDoctor.address}{closestDoctor.city ? `, ${closestDoctor.city}` : ''}</p>}
              {(closestDoctor.office_phone || closestDoctor.phone) && <p className="text-base mb-1">Phone: <a href={`tel:${closestDoctor.office_phone || closestDoctor.phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{closestDoctor.office_phone || closestDoctor.phone}</a></p>}
              {closestDoctor.email && <p className="text-base mb-1">Email: <a href={`mailto:${closestDoctor.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{closestDoctor.email}</a></p>}
              <p className="text-xs text-gray-500 mt-2">Lat: {closestDoctor.latitude?.toFixed(6) || 'N/A'}, Lng: {closestDoctor.longitude?.toFixed(6) || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="w-full h-[600px] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
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
            <p className="font-semibold text-lg">No doctors found.</p>
            <p className="text-sm">We couldn't retrieve any doctor locations. Please ensure your backend is running and accessible.</p>
          </div>
        )}
      </div>
      {/* Add Toaster component at the root of your app or a high-level layout */}
      <Toaster /> 
    </div>
  );
}