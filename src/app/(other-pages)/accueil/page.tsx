// app/find-doctors/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader'; // For loading Google Maps API
import { Button, Text, Select, SelectOption } from 'rizzui'; // Assuming RizzUI components
import toast from 'react-hot-toast';

interface DoctorLocation {
    id: string;
    user_name: string;
    country: string;
    latitude: number;
    longitude: number;
    // Add other fields if returned by backend, e.g., phone, email
    // phone?: string;
    // email?: string;
}

interface UserLocation {
    latitude: number;
    longitude: number;
}

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Haversine formula to calculate distance between two lat/lon points
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

export default function FindDoctorsPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMap = useRef<google.maps.Map | null>(null);
    const markers = useRef<google.maps.Marker[]>([]);

    const [doctors, setDoctors] = useState<DoctorLocation[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [closestDoctor, setClosestDoctor] = useState<DoctorLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [availableCountries, setAvailableCountries] = useState<SelectOption[]>([]);


    // 1. Fetch Doctor Locations
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${BACKEND_API_BASE_URL}/doctors/locations`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch doctor locations.');
                }
                const data: DoctorLocation[] = await response.json();
                setDoctors(data);

                // Extract unique countries for the dropdown
                const countries = Array.from(new Set(data.map(d => d.country))).map(country => ({
                    label: country,
                    value: country
                }));
                setAvailableCountries([{ label: 'All Countries', value: '' }, ...countries]);

            } catch (err: any) {
                console.error('Error fetching doctors:', err);
                setError(`Failed to load doctors: ${err.message}`);
                toast.error(`Failed to load doctors: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // 2. Load Google Maps API Script
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            setError('Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
            return;
        }

        const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['places'], // If you need place search functionality
        });

        loader.load()
            .then(() => {
                setMapLoaded(true);
                console.log('Google Maps API loaded successfully.');
            })
            .catch(e => {
                console.error('Error loading Google Maps API:', e);
                setError('Failed to load Google Maps. Please check your API key and network connection.');
            });
    }, []);

    // 3. Initialize Map and Add Markers
    useEffect(() => {
        if (mapLoaded && mapRef.current && doctors.length > 0) {
            // Filter doctors by selected country
            const filteredDoctors = selectedCountry
                ? doctors.filter(doc => doc.country === selectedCountry)
                : doctors;

            if (filteredDoctors.length === 0 && selectedCountry) {
                // If a country is selected but no doctors, clear map and closest doctor
                if (googleMap.current) {
                    googleMap.current.setCenter({ lat: 0, lng: 0 }); // Center map globally
                    googleMap.current.setZoom(2); // Zoom out
                }
                clearMarkers();
                setClosestDoctor(null);
                return;
            }

            // Calculate bounds to fit all doctors
            const bounds = new google.maps.LatLngBounds();
            filteredDoctors.forEach(doc => {
                if (doc.latitude !== null && doc.longitude !== null) {
                    bounds.extend({ lat: doc.latitude, lng: doc.longitude });
                }
            });

            // Initialize map if not already initialized
            if (!googleMap.current) {
                googleMap.current = new google.maps.Map(mapRef.current!, {
                    center: { lat: 0, lng: 0 }, // Default center before fitting bounds
                    zoom: 2, // Default zoom
                    mapId: 'YOUR_MAP_ID', // Optional: Use a Cloud-based map style ID if you have one
                });
            }

            clearMarkers(); // Clear existing markers before adding new ones

            filteredDoctors.forEach(doc => {
                if (doc.latitude !== null && doc.longitude !== null) {
                    const marker = new google.maps.Marker({
                        position: { lat: doc.latitude, lng: doc.longitude },
                        map: googleMap.current,
                        title: doc.user_name || 'Doctor',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red dot for doctors
                        }
                    });

                    // Add info window for marker click
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="font-family: sans-serif;">
                                <h3 style="font-weight: bold; margin-bottom: 5px;">${doc.user_name}</h3>
                                <p>Country: ${doc.country}</p>
                                <p>Lat: ${doc.latitude.toFixed(4)}, Lng: ${doc.longitude.toFixed(4)}</p>
                                ${doc.phone ? `<p>Phone: ${doc.phone}</p>` : ''}
                                ${doc.email ? `<p>Email: ${doc.email}</p>` : ''}
                            </div>
                        `,
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(googleMap.current, marker);
                    });

                    markers.current.push(marker);
                }
            });

            // Fit map to markers, or center globally if no doctors with location
            if (!bounds.isEmpty()) {
                googleMap.current.fitBounds(bounds);
            } else {
                googleMap.current.setCenter({ lat: 0, lng: 0 });
                googleMap.current.setZoom(2);
            }
        }
    }, [mapLoaded, doctors, selectedCountry]); // Re-run when map loads or doctors data changes or country changes

    // Function to clear markers from the map
    const clearMarkers = useCallback(() => {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    }, []);

    // 4. Get User Location and Find Closest Doctor
    const findClosestDoctor = () => {
        if (!userLocation) {
            toast.error('Please allow location access to find the closest doctor.');
            return;
        }

        let closest: DoctorLocation | null = null;
        let minDistance = Infinity;

        // Filter doctors by selected country first
        const doctorsToSearch = selectedCountry
            ? doctors.filter(doc => doc.country === selectedCountry)
            : doctors;

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

        if (closest && googleMap.current && userLocation) {
            // Add a marker for user's location
            const userMarker = new google.maps.Marker({
                position: { lat: userLocation.latitude, lng: userLocation.longitude },
                map: googleMap.current,
                title: 'Your Location',
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue dot for user
                }
            });
            markers.current.push(userMarker); // Add to markers to be cleared later

            // Optionally, center map between user and closest doctor
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
            bounds.extend({ lat: closest.latitude, lng: closest.longitude });
            googleMap.current.fitBounds(bounds);
        } else if (closest) {
             toast.success(`Closest doctor found: ${closest.user_name}`);
        } else {
            toast.info('No doctors found in your vicinity or selected country.');
        }
    };

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                setLoading(false);
                setError(null);
                toast.success('Your location detected!');
            },
            (geoError) => {
                setLoading(false);
                let errorMessage = 'Failed to get your location.';
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable it in browser settings.';
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case geoError.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                    default:
                        errorMessage = `An unknown error occurred: ${geoError.message}`;
                        break;
                }
                setError(errorMessage);
                toast.error(errorMessage);
                console.error('Geolocation Error:', geoError);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleCountryChange = (value: string | null) => {
        setSelectedCountry(value);
        setClosestDoctor(null); // Reset closest doctor when country changes
        // Map will re-render markers based on selectedCountry via useEffect
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-inter">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
                    Find a Doctor Near You
                </h1>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 font-medium text-sm">
                        Error: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Country Filter */}
                    <div>
                        <Text className="block text-gray-700 text-sm font-bold mb-2">Filter by Country:</Text>
                        <Select
                            options={availableCountries}
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            placeholder="Select a country"
                            className="w-full"
                        />
                    </div>

                    {/* Location Buttons */}
                    <div className="flex flex-col space-y-3">
                        <Button
                            onClick={getUserLocation}
                            disabled={loading}
                            className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            isLoading={loading && !userLocation}
                        >
                            {loading && !userLocation ? 'Detecting...' : 'Detect My Location'}
                        </Button>
                        <Button
                            onClick={findClosestDoctor}
                            disabled={!userLocation || doctors.length === 0 || loading}
                            className="w-full py-2 px-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            isLoading={loading && userLocation}
                        >
                            Find Closest Doctor
                        </Button>
                    </div>
                </div>

                {userLocation && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
                        <h2 className="font-semibold text-lg mb-2">Your Location:</h2>
                        <p>Lat: <span className="font-mono">{userLocation.latitude.toFixed(6)}</span></p>
                        <p>Lng: <span className="font-mono">{userLocation.longitude.toFixed(6)}</span></p>
                    </div>
                )}

                {closestDoctor && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200 text-purple-800">
                        <h2 className="font-semibold text-lg mb-2">Closest Doctor:</h2>
                        <p className="font-bold">{closestDoctor.user_name}</p>
                        <p>Country: {closestDoctor.country}</p>
                        <p>Lat: {closestDoctor.latitude.toFixed(6)}, Lng: {closestDoctor.longitude.toFixed(6)}</p>
                        {/* {closestDoctor.phone && <p>Phone: {closestDoctor.phone}</p>}
                        {closestDoctor.email && <p>Email: {closestDoctor.email}</p>} */}
                    </div>
                )}

                <div ref={mapRef} className="w-full h-[500px] rounded-lg shadow-md border border-gray-200">
                    {!mapLoaded && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Loading Map...
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="text-center text-gray-500 mt-4">
                        {userLocation ? 'Finding closest doctor...' : 'Loading doctors and map...'}
                    </div>
                )}
            </div>
        </div>
    );
}
