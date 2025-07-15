'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Text, Select, SelectOption } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster component
import { FaMapMarkerAlt, FaSearchLocation, FaGlobe, FaPhoneAlt, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for navigation
import { routes } from '@/config/routes'; // Assuming you have a routes config
import axiosInstance from '@/utils/axiosInstance'; // Import axiosInstance

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
const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY; // Corrected env variable name

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
    width: '80%', // Reduced width
    height: '400px', // Reduced height
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
    // const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Removed: For manual filter
    // const [availableCountries, setAvailableCountries] = useState<SelectOption[]>([]); // Removed: For manual filter
    const [activeInfoWindow, setActiveInfoWindow] = useState<DoctorLocation | null>(null);
    const [isFindingClosestDoctor, setIsFindingClosestDoctor] = useState(false);

    // Derived state for map center and zoom, reactive to userLocation
    // This will now determine the *initial* center and zoom for the GoogleMap component
    const mapCenter = useMemo(() => {
        if (userLocation?.permissionStatus === 'granted' && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
            return { lat: userLocation.latitude, lng: userLocation.longitude };
        }
        return initialMapCenter;
    }, [userLocation]);

    const mapZoom = useMemo(() => {
        if (userLocation?.permissionStatus === 'granted') {
            return 14; // Good local zoom when user location is known
        }
        return initialMapZoom; // Default world view zoom
    }, [userLocation]);


    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: Maps_API_KEY as string, // Use Maps_API_KEY
        libraries: mapLibraries,
        language: 'en',
        region: 'TN',
    });

    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markers = useRef<google.maps.Marker[]>([]); // Keep markers ref here

    // Function to clear markers from the map - MOVED UP
    const clearMarkers = useCallback(() => {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    }, []);

    // Function to perform reverse geocoding using OpenStreetMap Nominatim
    const reverseGeocodeUserLocation = useCallback(async (lat: number, lng: number) => {
        try {
            const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            const res = await fetch(nominatimApiUrl); // Keep fetch for Nominatim as it's an external service
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
        // effectiveCountryFilter: string | null, // Removed
        shouldFitAllDoctors: boolean = true // New parameter: if true, fits all doctors; if false, only user+closest
    ) => {
        if (!map || !window.google || !window.google.maps) {
            console.warn("Map or Google Maps API not fully ready for updateMapBoundsAndCenter.");
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();
        let hasValidLocations = false;

        // Only add doctors to bounds if shouldFitAllDoctors is true
        if (shouldFitAllDoctors) {
            let doctorsForBounds = currentDoctors;
            // if (effectiveCountryFilter) { // Removed country filter logic
            //     const filteredByCountry = currentDoctors.filter(doc => doc.country && doc.country.toUpperCase() === effectiveCountryFilter.toUpperCase());
            //     if (filteredByCountry.length > 0) {
            //         doctorsForBounds = filteredByCountry;
            //     } else {
            //         console.log(`No doctors found for bounds in ${effectiveCountryFilter}. Using all doctors.`);
            //         doctorsForBounds = currentDoctors;
            //     }
            // }

            doctorsForBounds.forEach(doc => {
                const docLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
                const docLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

                if (docLat !== null && docLng !== null) {
                    bounds.extend({ lat: docLat, lng: docLng });
                    hasValidLocations = true;
                }
            });
        }

        // Always include user location if granted
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
                    } else if (currentZoom > 15 && (shouldFitAllDoctors ? doctorsForBounds.length : 0) + (currentUserLocation ? 1 : 0) <= 2) {
                        // Only zoom in closer if fitting a small number of specific points (e.g., user + 1 doctor)
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
        // Initial centering on user is handled by mapCenter/mapZoom props.
        // We might want to fit all doctors initially if no user location is available.
        if (!userLocation || userLocation.permissionStatus !== 'granted') {
            updateMapBoundsAndCenter(map, doctors, userLocation, true);
        }
    }, [doctors, userLocation, updateMapBoundsAndCenter]);


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

    // --- 1. Fetch Doctor Locations using axiosInstance ---
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoadingDoctors(true);
                setError(null);
                // Use axiosInstance for fetching doctor locations
                const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/doctors/locations`); // Corrected API path

                if (response.status !== 200) {
                    throw new Error(response.data?.message || 'Failed to fetch doctor locations.');
                }
                const data: DoctorLocation[] = response.data;
                setDoctors(data);

                // Removed country list population
                // const countries = Array.from(new Set(data.map(d => d.country)))
                //     .filter(country => country && country.trim() !== '')
                //     .map(country => ({
                //         label: country,
                //         value: country
                //     }));
                // setAvailableCountries([{ label: 'All Countries', value: '' }, ...countries.sort((a, b) => a.label.localeCompare(b.label))]);

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

    // --- 2. Get User Location Automatically on load ---
    useEffect(() => {
        if (typeof window === 'undefined' || !isLoaded) {
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser. Please use a browser that supports it.');
            toast.error('Geolocation is not supported by your browser.');
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
            toast.error(errorMessage);
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

        // Attempt to get current position
        navigator.geolocation.getCurrentPosition(
            handleGeolocationSuccess,
            handleGeolocationError,
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );

        // Also query permissions status for initial UI state
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            const currentPermission = permissionStatus.state;
            setUserLocation(prev => prev ? { ...prev, permissionStatus: currentPermission } : { latitude: 0, longitude: 0, formattedAddress: null, permissionStatus: currentPermission, countryCode: null });
        });
    }, [isLoaded, reverseGeocodeUserLocation]);

    // --- 3. Main Effect to control map view based on data readiness ---
    // This useEffect is now primarily for initial setup or fallback,
    // relying on mapCenter/mapZoom for primary control.
    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) {
            return;
        }
        const map = mapInstanceRef.current;

        // Add markers to the map whenever doctors or selectedCountry changes
        // This part remains responsible for updating markers on the map
        clearMarkers(); // Clear existing markers before adding new ones
        const doctorsToDisplayOnMap = doctors; // No country filter here

        doctorsToDisplayOnMap.forEach(doc => {
            const markerLat = doc.latitude !== null ? doc.latitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lat || null);
            const markerLng = doc.longitude !== null ? doc.longitude : (COUNTRY_CENTERS[doc.country?.toUpperCase() || '']?.lng || null);

            if (markerLat !== null && markerLng !== null) {
                const marker = new window.google.maps.Marker({
                    position: { lat: markerLat, lng: markerLng },
                    map: map,
                    title: doc.user_name || 'Doctor',
                    icon: {
                        url: closestDoctor?.id === doc.id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        scaledSize: new window.google.maps.Size(32, 32)
                    }
                });

                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="font-family: sans-serif;">
                            <h3 style="font-weight: bold; margin-bottom: 5px;">${doc.user_name}</h3>
                            <p>Country: ${doc.country}</p>
                            <p>Lat: ${doc.latitude?.toFixed(4) || 'N/A'}, Lng: ${doc.longitude?.toFixed(4) || 'N/A'}</p>
                            ${'phone' in doc && doc.phone ? `<p>Phone: ${doc.phone}</p>` : ''}
                            ${'office_phone' in doc && doc.office_phone ? `<p>Office Phone: ${doc.office_phone}</p>` : ''}
                            ${'email' in doc && doc.email ? `<p>Email: ${doc.email}</p>` : ''}
                            ${'speciality' in doc && doc.speciality ? `<p>Speciality: ${doc.speciality}</p>` : ''}
                            ${'address' in doc && doc.address ? `<p>Address: ${doc.address}</p>` : ''}
                            ${'city' in doc && doc.city ? `<p>City: ${doc.city}</p>` : ''}
                        </div>
                    `,
                });

                marker.addListener('click', () => {
                    setActiveInfoWindow(doc); // Set activeInfoWindow to open it
                });
                markers.current.push(marker);
            }
        });

        // Handle InfoWindow display separately
        if (activeInfoWindow && map) {
            const marker = markers.current.find(m => m.getTitle() === (activeInfoWindow.user_name || 'Doctor'));
            if (marker) {
                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="font-family: sans-serif;">
                            <h3 style="font-weight: bold; margin-bottom: 5px;">${activeInfoWindow.user_name}</h3>
                            <p>Country: ${activeInfoWindow.country}</p>
                            <p>Lat: ${activeInfoWindow.latitude?.toFixed(4) || 'N/A'}, Lng: ${activeInfoWindow.longitude?.toFixed(4) || 'N/A'}</p>
                            ${'phone' in activeInfoWindow && activeInfoWindow.phone ? `<p>Phone: ${activeInfoWindow.phone}</p>` : ''}
                            ${'office_phone' in activeInfoWindow && activeInfoWindow.office_phone ? `<p>Office Phone: ${activeInfoWindow.office_phone}</p>` : ''}
                            ${'email' in activeInfoWindow && activeInfoWindow.email ? `<p>Email: ${activeInfoWindow.email}</p>` : ''}
                            ${'speciality' in activeInfoWindow && activeInfoWindow.speciality ? `<p>Speciality: ${activeInfoWindow.speciality}</p>` : ''}
                            ${'address' in activeInfoWindow && activeInfoWindow.address ? `<p>Address: ${activeInfoWindow.address}</p>` : ''}
                            ${'city' in activeInfoWindow && activeInfoWindow.city ? `<p>City: ${activeInfoWindow.city}</p>` : ''}
                        </div>
                    `,
                });
                infoWindow.open(map, marker);
                // Store info window instance to close others
                markers.current.forEach(m => {
                    if (m !== marker && m.getMap()) { // Close other info windows
                        // This requires managing infoWindow instances, which is complex with InfoWindow component.
                        // For simplicity, InfoWindow component handles its own open/close.
                    }
                });
            }
        }

    }, [isLoaded, doctors, closestDoctor, activeInfoWindow, mapInstanceRef, clearMarkers]); // Removed selectedCountry from deps

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

        // Removed country filtering logic for "Find Closest" button
        // if (selectedCountry) {
        //     const filteredBySelectedCountry = doctors.filter(doc => doc.country && doc.country.toUpperCase() === selectedCountry.toUpperCase());
        //     if (filteredBySelectedCountry.length > 0) {
        //         doctorsToSearch = filteredBySelectedCountry;
        //         toast.info(`Searching for closest doctor within selected country: ${selectedCountry}.`);
        //     } else {
        //         toast.info(`No doctors found in selected country ${selectedCountry}. Searching globally for closest.`);
        //     }
        // } else if (userLocation.countryCode) { // If no manual filter, try user's detected country
        //     const filteredByUserCountry = doctors.filter(doc => doc.country && doc.country.toUpperCase() === userLocation.countryCode.toUpperCase());
        //     if (filteredByUserCountry.length > 0) {
        //         doctorsToSearch = filteredByUserCountry;
        //         toast.info(`Searching for closest doctor within your detected country: ${userLocation.countryCode}.`);
        //     } else {
        //         toast.info(`No doctors found in your detected country ${userLocation.countryCode}. Searching globally for closest.`);
        //     }
        // } else {
        //     toast.info('No country filter applied for closest doctor search. Searching globally.');
        // }


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
            toast.info('No doctors found in your vicinity.');
        }
        setIsFindingClosestDoctor(false);
    }, [userLocation, doctors]); // Removed selectedCountry from deps

    // Removed handleCountryChange
    // const handleCountryChange = useCallback((value: string | null) => {
    //     setSelectedCountry(value);
    //     setClosestDoctor(null);
    //     setActiveInfoWindow(null);
    //     if (mapInstanceRef.current) {
    //         const map = mapInstanceRef.current;
    //         const countryCenter = value ? COUNTRY_CENTERS[value.toUpperCase()] : initialMapCenter;
    //         const zoom = value ? 6 : initialMapZoom; // Zoom in for a country, or default for world
    //         map.setCenter(countryCenter);
    //         map.setZoom(zoom);
    //         // Also fit bounds for doctors in that country if they exist
    //         updateMapBoundsAndCenter(map, doctors, userLocation, value, true);
    //     }
    // }, [doctors, userLocation, updateMapBoundsAndCenter]);

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
                center={mapCenter} // Uses derived center
                zoom={mapZoom}      // Uses derived zoom
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
        <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-white"
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
                        Easily discover top-rated healthcare professionals nearby.
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
                    {/* Removed Country Filter */}
                    {/* <div>
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
                    </div> */}

                    {/* User Location and Find Closest Buttons */}
                    <div className="flex flex-col justify-end space-y-3">
                        {/* The "Find Closest Doctor" button should remain */}
                        <Button
                            onClick={findClosestDoctor}
                            disabled={loadingUserLocation || loadingDoctors || isFindingClosestDoctor}
                            className="w-full h-12 flex items-center justify-center text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                                backgroundColor: DEFAULT_PRESET_COLORS.default,
                                borderColor: DEFAULT_PRESET_COLORS.dark,
                                '&:hover': {
                                    backgroundColor: DEFAULT_PRESET_COLORS.dark,
                                },
                                '&:active': {
                                    backgroundColor: DEFAULT_PRESET_COLORS.dark,
                                },
                                '&:focus': {
                                    borderColor: DEFAULT_PRESET_COLORS.dark,
                                }
                            }}
                        >
                            {isFindingClosestDoctor ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Finding Closest...
                                </>
                            ) : (
                                <>
                                    <FaSearchLocation className="mr-2" /> Find Closest Doctor
                                </>
                            )}
                        </Button>
                    </div>
                </div>

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
                            {(closestDoctor.office_phone || closestDoctor.phone) && (
                                <p className="text-base mb-1">Phone: <a href={`tel:${closestDoctor.office_phone || closestDoctor.phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                                    {closestDoctor.office_phone || closestDoctor.phone}
                                </a></p>
                            )}
                            {closestDoctor.email && <p className="text-base mb-1">Email: <a href={`mailto:${closestDoctor.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{closestDoctor.email}</a></p>}
                            <p className="text-xs text-gray-500 mt-2">Lat: {closestDoctor.latitude?.toFixed(6) || 'N/A'}, Lng: {closestDoctor.longitude?.toFixed(6) || 'N/A'}</p>
                        </div>
                    </div>
                )}

                <div className="w-full h-[400px] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative flex justify-center"> {/* Added flex justify-center to center the map when its width is less than 100% */}
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