// components/location-tracker/location-tracker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import your useAuth hook
import { Button, Modal, Text } from 'rizzui'; // Assuming RizzUI Button, Modal, Text components
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance'; // Your configured axios instance
import { PiMapPinLineFill } from 'react-icons/pi'; // Example icon for location
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

interface LocationData {
    id: string; // Changed to string as BigInt will be stringified from backend
    latitude: number | null; // Allow null for initial state or if not set in DB
    longitude: number | null; // Allow null for initial state or if not set in DB
    timestamp: string | null; // Allow null for initial state or if not set in DB
}

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Assuming this is your backend base URL

const LocationTracker: React.FC = () => {
    const { user, isLoading: isAuthLoading } = useAuth(); // Get user and loading state from AuthContext
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null); // Now stores a single object
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // For location detection/saving
    const [statusMessage, setStatusMessage] = useState<string>('');
    // State to control the visibility of the location modal
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const router = useRouter(); // Initialize useRouter

    // Determine if the current user is a doctor
    const isDoctor = user?.role === 'doctor';

    // Effect to fetch and display the current location when user data is available
    useEffect(() => {
        console.log('[LocationTracker useEffect] User:', user, 'isAuthLoading:', isAuthLoading, 'isDoctor:', isDoctor);
        if (user && !isAuthLoading) {
            setStatusMessage(`Authenticated as: ${user.id}`);
            // Only attempt to fetch location if the user is a doctor
            if (isDoctor) {
                fetchAndDisplayCurrentLocation(); // Call the new function
            } else {
                // If not a doctor, ensure modal is closed and no location is tracked
                setIsLocationModalOpen(false);
                setCurrentLocation(null);
                setStatusMessage('Location tracking is not required for your role.');
            }
        } else if (!isAuthLoading) {
            setStatusMessage('Please log in to track your location.');
            setCurrentLocation(null); // Clear current location if user logs out
            setIsLocationModalOpen(false); // Ensure modal is closed if not authenticated
        }
    }, [user, isAuthLoading, isDoctor]); // Add isDoctor to dependency array

    /**
     * Fetches the current location for the authenticated user from the Express backend.
     */
    const fetchAndDisplayCurrentLocation = async () => {
        if (!user || !isDoctor) { // Ensure user is a doctor before fetching
            setError('User is not authenticated or not a doctor to fetch location.');
            console.log('[fetchAndDisplayCurrentLocation] User not available or not a doctor.');
            return;
        }

        console.log(`[fetchAndDisplayCurrentLocation] Attempting to fetch location for doctor: ${user.id}`);
        try {
            const response = await axiosInstance.get(`${BACKEND_API_BASE_URL}/locations`);
            console.log('[fetchAndDisplayCurrentLocation] Backend response:', response.status, response.data);

            if (response.status === 404) {
                setCurrentLocation(null);
                setStatusMessage('No location saved yet. Please enable location tracking.');
                setError('');
                setIsLocationModalOpen(true); // Open modal if no location is found
                console.log('[fetchAndDisplayCurrentLocation] 404 Response: Opening modal.');
                return;
            }
            
            if (response.status !== 200) {
                throw new Error(response.data?.message || 'Failed to fetch current location.');
            }

            const data = response.data; // The raw data from the backend

            const parsedLocation: LocationData = {
                id: String(data.id),
                latitude: data.latitude !== null && data.latitude !== undefined ? parseFloat(data.latitude) : null,
                longitude: data.longitude !== null && data.longitude !== undefined ? parseFloat(data.longitude) : null,
                timestamp: data.timestamp,
            };

            console.log('[fetchAndDisplayCurrentLocation] Parsed Location:', parsedLocation);
            setCurrentLocation(parsedLocation);
            setError('');
            setStatusMessage('Current location loaded.');

            // Logic to open/close modal and redirect
            if (parsedLocation.latitude === null || parsedLocation.longitude === null) {
                setIsLocationModalOpen(true);
                setStatusMessage('Your location data is missing. Please allow location access.');
                console.log('[fetchAndDisplayCurrentLocation] Location data is null/undefined: Opening modal.');
            } else {
                setIsLocationModalOpen(false); // Close modal if location is successfully loaded
                console.log('[fetchAndDisplayCurrentLocation] Location data is valid: Closing modal.');
                // Redirect to home page if location is valid and modal was open (or if we just verified it)
                router.push('/'); // Redirect to your main dashboard/home page
                toast.success('Location verified! Redirecting...');
            }

        } catch (err: any) {
            console.error('Error fetching current location:', err);
            setError(`Failed to load current location: ${err.message}`);
            toast.error(`Failed to load location: ${err.message}`);
            setIsLocationModalOpen(true); // Keep modal open on error to allow retry
            console.log('[fetchAndDisplayCurrentLocation] Fetch error: Opening modal.');
        }
    };

    /**
     * Detects the user's current geographical location using the Geolocation API.
     * If successful, it updates the state and sends the location to the backend.
     */
    const detectAndSaveLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        if (!user || !isDoctor) { // Ensure user is a doctor before allowing detection/save
            setError('User is not authenticated or not a doctor to save location.');
            toast.error('Location saving is only for doctors.');
            return;
        }

        setLoading(true);
        setError('');
        setStatusMessage('Detecting location...');
        console.log('[detectAndSaveLocation] Starting geolocation request...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`[detectAndSaveLocation] Geolocation success: Lat ${latitude}, Lon ${longitude}`);
                setCurrentLocation({
                    id: user.id.toString(),
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString(),
                });
                setStatusMessage(`Location detected: Lat ${latitude.toFixed(6)}, Lon ${longitude.toFixed(6)}`);

                try {
                    await sendLocationToBackend(latitude, longitude);
                    setStatusMessage('Location saved successfully!');
                    toast.success('Location saved!');
                    console.log('[detectAndSaveLocation] Location sent to backend. Re-fetching current location...');
                    await fetchAndDisplayCurrentLocation();
                } catch (backendError: any) {
                    console.error("Backend Save Error:", backendError);
                    setError(`Failed to save location to backend: ${backendError.message}`);
                    toast.error(`Failed to save location: ${backendError.message}`);
                } finally {
                    setLoading(false);
                }
            },
            (geoError) => {
                setLoading(false);
                let errorMessage = 'Failed to get location.';
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by the user. Please enable location services for this site.';
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case geoError.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                    default:
                        errorMessage = `An unknown geolocation error occurred: ${geoError.message}`;
                        break;
                }
                setError(errorMessage);
                setStatusMessage('Location detection failed.');
                toast.error(errorMessage);
                console.error("Geolocation Error:", geoError);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    /**
     * Sends the detected location data to the Express.js backend.
     * @param {number} latitude - The latitude to send.
     * @param {number} longitude - The longitude to send.
     */
    const sendLocationToBackend = async (latitude: number, longitude: number) => {
        if (!user || !isDoctor) {
            throw new Error("User not authenticated or not a doctor for sending location.");
        }

        const response = await axiosInstance.post(`${BACKEND_API_BASE_URL}/locations`, {
            latitude,
            longitude,
        });

        if (response.status !== 201) {
            throw new Error(response.data?.message || 'Failed to save location to backend.');
        }

        return response.data;
    };

    return (
        <>
            {/* The Modal for mandatory location tracking - only rendered if isLocationModalOpen AND isDoctor */}
            {isDoctor && (
                <Modal
                    isOpen={isLocationModalOpen}
                    onClose={() => { /* Modal cannot be closed by user action */ }}
                    overlayClassName="!bg-gray-900/80"
                    containerClassName="!p-0 !max-w-md"
                    closable={false}
                >
                    <div className="p-6 text-center bg-white rounded-xl shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <PiMapPinLineFill className="h-16 w-16 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Location Required</h2>
                        <Text className="text-gray-600 mb-6">
                            As a doctor, to access all features of your account, please allow us to detect and save your current geographical location.
                        </Text>

                        {statusMessage && (
                            <div className="mb-4 p-3 rounded-lg bg-blue-100 text-blue-700 text-sm">
                                {statusMessage}
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 font-medium text-sm">
                                Error: {error}
                            </div>
                        )}

                        <Button
                            onClick={detectAndSaveLocation}
                            disabled={loading || isAuthLoading || !user}
                            className="w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition duration-300 ease-in-out transform
                                       bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-md hover:shadow-lg active:scale-95"
                            isLoading={loading}
                        >
                            {loading ? 'Detecting Location...' : 'Allow Location Access'}
                        </Button>
                        {!user && !isAuthLoading && (
                            <Text className="text-sm text-gray-500 mt-4">
                                Waiting for user authentication...
                            </Text>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default LocationTracker;
