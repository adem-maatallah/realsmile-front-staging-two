'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Text, Select, SelectOption } from 'rizzui';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaSearchLocation, FaGlobe } from 'react-icons/fa';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image'; // Import the Image component for doctor profiles

// config/colors.ts
export const DEFAULT_PRESET_COLORS = {
  lighter: '#fef9c3', // Yellow 100
  light: '#fde047', // Yellow 300
  default: '#d39424', // <-- THIS IS THE NEW VALUE YOU REQUESTED
  dark: '#a16207', // Yellow 800
  foreground: '#ffffff',
};

// --- Interfaces ---
interface DoctorLocation {
  id: string;
  user_name: string;
  first_name?: string;
  last_name?: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string; // Ensure this is available from your backend
  email?: string;
  speciality?: string;
  address?: string;
  city?: string;
  profile_pic?: string; // Added profile_pic
}

interface UserLocation {
  latitude: number;
  longitude: number;
  formattedAddress?: string | null; // Added for reverse geocoded address
}

// --- Environment Variables ---
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY;

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

const defaultMapCenter = {
  lat: 34.0, // A more central point for Tunisia, can be adjusted
  lng: 9.0
};

// Ensure 'places' and 'geocoding' libraries are loaded
const mapLibraries: google.maps.Libraries[] = ['places', 'geocoding'];

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorLocation[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [closestDoctor, setClosestDoctor] = useState<DoctorLocation | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState(true);
  const [loadingUserAddress, setLoadingUserAddress] = useState(false); // New loading state for geocoding
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<SelectOption[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<DoctorLocation | null>(null);
  const [isFindingClosestDoctor, setIsFindingClosestDoctor] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY as string,
    libraries: mapLibraries,
    language: 'en',
    region: 'TN', // Set default region for Geocoding API if most users are from Tunisia
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null); // Ref for Geocoder instance

  // Initialize Geocoder once map libraries are loaded
  useEffect(() => {
    if (isLoaded && !geocoderRef.current && window.google?.maps?.Geocoder) {
      geocoderRef.current = new window.google.maps.Geocoder();
      console.log("Google Maps Geocoder initialized.");
    }
  }, [isLoaded]);

  // Function to perform reverse geocoding for user's initial location
  const reverseGeocodeUserLocation = useCallback(async (lat: number, lng: number) => {
    if (!geocoderRef.current) {
      console.warn("Geocoder not ready for reverse geocoding.");
      return;
    }
    setLoadingUserAddress(true);
    try {
      const response = await geocoderRef.current.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {
        const fullAddress = response.results[0].formatted_address;
        setUserLocation(prev => prev ? { ...prev, formattedAddress: fullAddress } : null);
        toast.success(`Your address: ${fullAddress.split(',')[0]} detected!`); // Shorter toast
      } else {
        setUserLocation(prev => prev ? { ...prev, formattedAddress: 'Address not found' } : null);
        toast.info('Could not find a human-readable address for your location.');
      }
    } catch (geoError: any) {
      console.error('Reverse Geocoding Error:', geoError);
      setUserLocation(prev => prev ? { ...prev, formattedAddress: 'Error detecting address' } : null);
    } finally {
      setLoadingUserAddress(false);
    }
  }, []);

  // --- Function to encapsulate map bounds and center logic ---
  const updateMapBoundsAndCenter = useCallback((
    map: google.maps.Map,
    currentDoctors: DoctorLocation[],
    currentUserLocation: UserLocation | null,
    currentSelectedCountry: string | null
  ) => {
    if (!map || !window.google || !window.google.maps) {
      console.warn("Map or Google Maps API not fully ready for updateMapBoundsAndCenter.");
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    const doctorsToDisplay = currentSelectedCountry
      ? currentDoctors.filter(doc => doc.country === currentSelectedCountry)
      : currentDoctors;

    doctorsToDisplay.forEach(doc => {
      if (doc.latitude !== null && doc.longitude !== null) {
        bounds.extend({ lat: doc.latitude, lng: doc.longitude });
        hasValidLocations = true;
      }
    });

    if (currentUserLocation && currentUserLocation.latitude !== undefined && currentUserLocation.longitude !== undefined) {
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
          } else if (currentZoom > 15 && doctorsToDisplay.length + (currentUserLocation ? 1 : 0) <= 2) {
            map.setZoom(15);
          }
        }
      });
    } else {
      map.setCenter(defaultMapCenter);
      map.setZoom(2);
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    console.log("Map instance loaded and set in ref.");
    updateMapBoundsAndCenter(map, doctors, userLocation, selectedCountry);
  }, [doctors, userLocation, selectedCountry, updateMapBoundsAndCenter]);

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
        toast.error(`Failed to load doctors: ${err.message}.`);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // --- 2. Get User Location Automatically ---
  useEffect(() => {
    if (typeof window !== 'undefined' && !userLocation && !error) {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser. Please use a browser that supports it or manually input your location.');
        toast.error('Geolocation is not supported by your browser.');
        setLoadingUserLocation(false);
        return;
      }

      setLoadingUserLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude, formattedAddress: null }); // Initialize with null address for geocoding trigger
          setError(null);
          setLoadingUserLocation(false);
        },
        (geoError) => {
          let errorMessage = 'Failed to get your location automatically.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable it in browser settings to use location features.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case geoError.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
            default:
              errorMessage = `An unknown error occurred while detecting location: ${geoError.message}`;
              break;
          }
          setError(errorMessage);
          toast.error(errorMessage);
          console.error('Geolocation Error:', geoError);
          setLoadingUserLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [userLocation, error]);

  // Effect to trigger reverse geocoding when userLocation (latitude/longitude) is set and API is loaded
  useEffect(() => {
    if (userLocation && userLocation.latitude !== undefined && userLocation.longitude !== undefined && userLocation.formattedAddress === null && isLoaded) {
      reverseGeocodeUserLocation(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, reverseGeocodeUserLocation, isLoaded]);

  // --- 3. Trigger map updates when relevant data changes ---
  useEffect(() => {
    if (isLoaded && mapInstanceRef.current && (!loadingDoctors || !loadingUserLocation)) {
      console.log("Data changed, triggering map bounds update.");
      updateMapBoundsAndCenter(mapInstanceRef.current, doctors, userLocation, selectedCountry);
    }
  }, [isLoaded, doctors, userLocation, selectedCountry, updateMapBoundsAndCenter, loadingDoctors, loadingUserLocation]);

  const findClosestDoctor = useCallback(() => {
    setIsFindingClosestDoctor(true);
    if (!userLocation || userLocation.latitude === undefined || userLocation.longitude === undefined) {
      toast.error('Your location is required to find the closest doctor. Please allow location access in your browser, or refresh the page.');
      setIsFindingClosestDoctor(false);
      return;
    }

    let closest: DoctorLocation | null = null;
    let minDistance = Infinity;

    const doctorsToSearch = selectedCountry
      ? doctors.filter(doc => doc.country === selectedCountry)
      : doctors;

    if (doctorsToSearch.length === 0) {
      toast.info('No doctors found in the selected country to calculate the closest one.');
      setClosestDoctor(null);
      setIsFindingClosestDoctor(false);
      return;
    }

    doctorsToSearch.forEach(doc => {
      if (doc.latitude !== null && doc.longitude !== null && userLocation) {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          doc.latitude,
          doc.longitude
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
      newBounds.extend({ lat: closest.latitude, lng: closest.longitude });
      map.fitBounds(newBounds);

      google.maps.event.addListenerOnce(map, 'idle', () => {
        const currentZoom = map.getZoom();
        if (currentZoom !== undefined && currentZoom > 15) {
          map.setZoom(15);
        }
      });

      toast.success(`Closest doctor found: ${closest.user_name || 'Doctor'} (${minDistance.toFixed(2)} km away)`);
      setActiveInfoWindow(closest); // Open info window for closest doctor
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
    setActiveInfoWindow(null); // Close any open info window when country filter changes
    if (mapInstanceRef.current) {
      const filteredDoctors = value ? doctors.filter(doc => doc.country === value) : doctors;
      updateMapBoundsAndCenter(mapInstanceRef.current, filteredDoctors, userLocation, value);
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
        center={defaultMapCenter}
        zoom={2}
        options={mapOptions}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="Your Location"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // More reliable URL for blue dot
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {/* Doctor Markers */}
        {doctors
          .filter(doc => (selectedCountry ? doc.country === selectedCountry : true))
          .map(doc => (
            doc.latitude !== null && doc.longitude !== null && (
              <Marker
                key={doc.id}
                position={{ lat: doc.latitude, lng: doc.longitude }}
                title={doc.user_name || 'Doctor'}
                onClick={() => setActiveInfoWindow(doc)} // This allows clicking any marker for info
                icon={{
                  url: closestDoctor?.id === doc.id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Green for closest, red for others
                  scaledSize: new window.google.maps.Size(32, 32)
                }}
              />
            )
          ))}

        {/* Info Window */}
        {activeInfoWindow && activeInfoWindow.latitude !== null && activeInfoWindow.longitude !== null && (
          <InfoWindow
            position={{ lat: activeInfoWindow.latitude, lng: activeInfoWindow.longitude }}
            onCloseClick={() => setActiveInfoWindow(null)}
          >
            <div className="p-3 flex flex-col space-y-1 text-gray-800 font-sans">
              {activeInfoWindow.profile_pic && (
                <div className="mb-2 flex justify-center">
                  <Image
                    src={activeInfoWindow.profile_pic}
                    alt={activeInfoWindow.user_name || 'Doctor Profile'}
                    width={80} // Adjust size as needed
                    height={80} // Adjust size as needed
                    className="rounded-full object-cover border-2 border-gray-300 shadow-md"
                    unoptimized={true} // Add unoptimized for external images or if you don't need Next.js image optimization
                  />
                </div>
              )}
              <h3 className="font-bold text-lg text-center" style={{ color: DEFAULT_PRESET_COLORS.default }}>
                {activeInfoWindow.user_name || `${activeInfoWindow.first_name || ''} ${activeInfoWindow.last_name || ''}`.trim() || 'Doctor'}
              </h3>
              {activeInfoWindow.speciality && <p className="text-sm text-gray-600 text-center"><strong>Speciality:</strong> {activeInfoWindow.speciality}</p>}
              {(activeInfoWindow.address || activeInfoWindow.city || activeInfoWindow.country) && (
                <p className="text-sm text-gray-600 flex items-center justify-center"> {/* Added justify-center */}
                  <FaMapMarkerAlt className="mr-1 text-gray-500" />
                  {activeInfoWindow.address ? `${activeInfoWindow.address}, ` : ''}
                  {activeInfoWindow.city ? `${activeInfoWindow.city}, ` : ''}
                  {activeInfoWindow.country || ''}
                </p>
              )}
              {activeInfoWindow.phone && (
                <p className="text-sm text-gray-600 flex items-center justify-center"> {/* Added justify-center */}
                  📞 <a href={`tel:${activeInfoWindow.phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{activeInfoWindow.phone}</a>
                </p>
              )}
              {activeInfoWindow.email && (
                <p className="text-sm text-gray-600 flex items-center justify-center"> {/* Added justify-center */}
                  📧 <a href={`mailto:${activeInfoWindow.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{activeInfoWindow.email}</a>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 text-center">Lat: {activeInfoWindow.latitude.toFixed(4)}, Lng: {activeInfoWindow.longitude.toFixed(4)}</p>
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
      <div className="max-w-7xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border-px border-gray-200"> {/* Changed 'border' to 'border-px' for smaller border */}
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
            <Button
              onClick={findClosestDoctor}
              disabled={!userLocation || doctors.length === 0 || loadingDoctors || isFindingClosestDoctor}
              className="w-full h-12 rounded-xl text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center text-base font-semibold"
              isLoading={isFindingClosestDoctor}
              style={{
                backgroundColor: DEFAULT_PRESET_COLORS.default,
                color: DEFAULT_PRESET_COLORS.foreground,
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.dark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.default}
            >
              <FaSearchLocation className="mr-2" /> Find Closest Doctor
            </Button>
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
              {loadingUserAddress ? (
                <p className="text-base flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" style={{ color: DEFAULT_PRESET_COLORS.default }} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting address...
                </p>
              ) : (
                <>
                  {userLocation.formattedAddress ? (
                    <p className="text-base">Address: <span className="font-semibold">{userLocation.formattedAddress}</span></p>
                  ) : (
                    <>
                      <p className="text-base">Latitude: <span className="font-mono">{userLocation.latitude.toFixed(6)}</span></p>
                      <p className="text-base">Longitude: <span className="font-mono">{userLocation.longitude.toFixed(6)}</span></p>
                      <p className="text-sm mt-1 text-gray-500">Address could not be determined automatically.</p>
                    </>
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
              {closestDoctor.phone && <p className="text-base mb-1">Phone: <a href={`tel:${closestDoctor.phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{closestDoctor.phone}</a></p>}
              {closestDoctor.email && <p className="text-base mb-1">Email: <a href={`mailto:${closestDoctor.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{closestDoctor.email}</a></p>}
              <p className="text-xs text-gray-500 mt-2">Lat: {closestDoctor.latitude.toFixed(6)}, Lng: {closestDoctor.longitude.toFixed(6)}</p>
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
    </div>
  );
}