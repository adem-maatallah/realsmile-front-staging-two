// src/app/(other-pages)/doctor-profile/[id]/page.tsx

'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button, Text, Input, Textarea, Modal, Title, ActionIcon, Select } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaRegAddressCard, FaUser, FaCalendarAlt, FaTimes, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// --- NEW: Import react-datepicker and its styles ---
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

// Register the French locale for the date picker
registerLocale('fr', fr);


// --- Helper Components and Constants ---

// Color configuration
export const DEFAULT_PRESET_COLORS = {
    lighter: '#fef9c3',
    light: '#d39424',
    default: '#d39424',
    dark: '#a16207',
    foreground: '#ffffff',
};

// Self-contained LoadingSpinner
const LoadingSpinner = ({ text = "Chargement..." }: { text?: string }) => (
    <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-700">
        <svg className="animate-spin h-6 w-6" style={{ color: DEFAULT_PRESET_COLORS.default }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text}
    </div>
);

// Helper component for info display
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 148, 36, 0.1)' }}>
        <div className="text-xl mr-3 mt-1 flex-shrink-0" style={{ color: DEFAULT_PRESET_COLORS.default }}>{icon}</div>
        <div>
            <Text className="text-sm font-medium text-gray-600 mb-1">{label}</Text>
            <div className="font-medium" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{value}</div>
        </div>
    </div>
);


// --- Interfaces ---
interface DoctorDetails {
    id: string;
    user_name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    profile_pic?: string;
    country?: string;
    latitude?: number | null;
    longitude?: number | null;
    speciality?: string;
    address?: string;
    address_2?: string;
    city?: string;
    zip?: string;
    office_phone?: string;
    consultation_type: 'ONLINE' | 'IN_PERSON' | 'BOTH';
}
interface WorkingDay {
    weekday: string;
    start_time: string;
    end_time: string;
    disabled: boolean;
}
interface ClosedDate {
    closed_date: string;
}
interface Booking {
    start_datetime: string;
}
interface AvailabilityData {
    working_days: WorkingDay[];
    closed_dates: ClosedDate[];
    bookings: Booking[];
}
interface TimeSlot {
    value: string; // ISO string format
    label: string; // User-friendly format e.g., "09:00"
}

const mapLibraries: Array<'places' | 'geocoding'> = ['places', 'geocoding'];
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY;

// --- Main DoctorProfilePage Component ---
export default function DoctorProfilePage() {
    const params = useParams();
    const doctorId = params.id as string;

    const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the smart calendar
    const [availability, setAvailability] = useState<AvailabilityData | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);

    // Form state
    const [clientFirstName, setClientFirstName] = useState('');
    const [clientLastName, setClientLastName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState<string | undefined>(undefined);
    const [clientMessage, setClientMessage] = useState('');
    const [selectedConsultationType, setSelectedConsultationType] = useState<'ONLINE' | 'IN_PERSON' | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const { isLoaded: isMapLoaded } = useJsApiLoader({
        id: 'google-map-script-profile',
        googleMapsApiKey: Maps_API_KEY as string,
        libraries: mapLibraries,
    });

    // Fetch Doctor Details & Availability
    useEffect(() => {
        if (!doctorId) {
            setLoading(false);
            setError("Invalid doctor ID.");
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setIsAvailabilityLoading(true);
            try {
                const [detailsRes, availabilityRes] = await Promise.all([
                    axiosInstance.get(`/doctors/details/${doctorId}`),
                    axiosInstance.get(`/doctors/availability/${doctorId}`)
                ]);

                setDoctor(detailsRes.data);
                setAvailability(availabilityRes.data);

                if (detailsRes.data.consultation_type !== 'BOTH') {
                    setSelectedConsultationType(detailsRes.data.consultation_type);
                } else {
                    setSelectedConsultationType('IN_PERSON');
                }

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError("Failed to load doctor's profile or availability.");
                toast.error("Failed to load doctor's data.");
            } finally {
                setLoading(false);
                setIsAvailabilityLoading(false);
            }
        };

        fetchAllData();
    }, [doctorId]);

    // Generate available slots when availability data is loaded
    useEffect(() => {
        if (!availability) return;

        const { working_days, closed_dates, bookings } = availability;
        const generatedSlots: Record<string, TimeSlot[]> = {};
        const bookedTimes = new Set(bookings.map(b => new Date(b.start_datetime).toISOString()));
        const closedDatesSet = new Set(closed_dates.map(d => d.closed_date.split('T')[0]));
        const weekdaysMap = new Map(working_days.map(d => [d.weekday, d]));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);

            const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
            const dayName = date.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

            if (closedDatesSet.has(dateString)) continue;

            const workingDay = weekdaysMap.get(dayName);
            if (!workingDay || workingDay.disabled) continue;

            const slotsForDay: TimeSlot[] = [];
            const startTime = new Date(workingDay.start_time);
            const endTime = new Date(workingDay.end_time);

            let currentTime = new Date(date);
            currentTime.setHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0, 0);

            const endSlotTime = new Date(date);
            endSlotTime.setHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0, 0);

            while (currentTime < endSlotTime) {
                const slotIso = currentTime.toISOString();
                if (!bookedTimes.has(slotIso) && currentTime > new Date()) {
                    slotsForDay.push({
                        value: slotIso,
                        label: currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
                    });
                }
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            if (slotsForDay.length > 0) {
                generatedSlots[dateString] = slotsForDay;
            }
        }
        setAvailableSlots(generatedSlots);
    }, [availability]);

    const handleInitiateBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();

        if (!clientFirstName.trim() || !clientLastName.trim() || !clientEmail.trim() || !clientPhone || !selectedTime) {
            toast.error("Veuillez remplir tous les champs et sélectionner un créneau.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post(`/contact/bookings/initiate`, {
                toDoctorId: doctor?.id,
                clientFirstName, clientLastName, clientEmail, clientPhone,
                consultationDate: selectedTime,
                consultationType: selectedConsultationType,
                clientMessage,
            });

            if (response.status === 200) {
                toast.success(response.data.message);
                setIsOtpModalOpen(true);
            } else {
                throw new Error(response.data?.message || "Failed to initiate booking.");
            }
        } catch (err: any) {
            console.error("Error initiating booking:", err);
            const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
            toast.error(`Échec de la réservation: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [clientFirstName, clientLastName, clientEmail, clientPhone, selectedTime, selectedConsultationType, clientMessage, doctor]);

    const handleVerifyAndCreateBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) {
            toast.error("Veuillez entrer le code à 6 chiffres.");
            return;
        }
        setIsVerifyingOtp(true);
        try {
            const response = await axiosInstance.post(`/contact/bookings/verify-and-create`, {
                clientPhone,
                otpCode,
            });
            if (response.status === 201) {
                toast.success("Votre consultation a été réservée avec succès !");
                setIsOtpModalOpen(false);
                setClientFirstName(''); setClientLastName(''); setClientEmail('');
                setClientPhone(undefined); setClientMessage(''); setOtpCode('');
                setSelectedDate(null); setSelectedTime('');
                const availabilityRes = await axiosInstance.get(`/doctors/availability/${doctorId}`);
                setAvailability(availabilityRes.data);
            } else {
                throw new Error(response.data?.message || "Verification failed.");
            }
        } catch (err: any) {
            console.error("Error verifying OTP:", err);
            const errorMessage = err.response?.data?.message || "OTP invalide ou la demande a expiré.";
            toast.error(`Échec de la vérification: ${errorMessage}`);
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [otpCode, clientPhone, doctorId]);

    const handleDateSelect = (date: Date | null) => {
        setSelectedDate(date);
        setSelectedTime('');
    };

    const selectedDateKey = selectedDate ? selectedDate.getFullYear() + '-' + String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + String(selectedDate.getDate()).padStart(2, '0') : '';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner text="Chargement du profil du médecin..." /></div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-red-700">{error}</div>;
    }
    if (!doctor) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Text>Aucun médecin trouvé pour cet ID.</Text></div>;
    }

    const { user_name, first_name, last_name, email, phone, profile_pic, country, speciality, address, city, consultation_type } = doctor;
    const displayName = user_name || `${first_name || ''} ${last_name || ''}`.trim();

    return (
        <>
            <style>{`
        .react-datepicker {
            border-radius: 0.5rem;
            border-color: ${DEFAULT_PRESET_COLORS.light};
        }
        .react-datepicker__header {
            background-color: ${DEFAULT_PRESET_COLORS.lighter};
            border-bottom-color: ${DEFAULT_PRESET_COLORS.light};
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
            background-color: ${DEFAULT_PRESET_COLORS.default};
            color: ${DEFAULT_PRESET_COLORS.foreground};
        }
        .react-datepicker__day:hover {
            background-color: ${DEFAULT_PRESET_COLORS.lighter};
        }
        .react-datepicker__day--disabled {
            color: #ccc;
        }
      `}</style>
            <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50">
                <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
                            Profil du Dr. <span style={{ color: DEFAULT_PRESET_COLORS.default }}>{displayName}</span>
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="flex flex-col p-6 rounded-xl border" style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, borderColor: DEFAULT_PRESET_COLORS.light }}>
                            {profile_pic && (
                                <div className="mb-6 flex justify-center">
                                    <Image src={profile_pic} alt={displayName} width={150} height={150} className="rounded-full object-cover border-4 border-gray-300 shadow-lg" unoptimized />
                                </div>
                            )}
                            <h2 className="font-bold text-3xl mb-6 text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{displayName}</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {speciality && <InfoItem icon={<FaUser />} label="Spécialité" value={speciality} />}
                                {email && <InfoItem icon={<FaEnvelope />} label="Email" value={<a href={`mailto:${email}`} className="hover:underline">{email}</a>} />}
                                {phone && <InfoItem icon={<FaPhoneAlt />} label="Téléphone" value={<a href={`tel:${phone}`} className="hover:underline">{phone}</a>} />}
                                {(address || city) && <InfoItem icon={<FaRegAddressCard />} label="Adresse" value={`${address || ''}, ${city || ''}, ${country || ''}`} />}
                            </div>
                        </div>

                        <div className="p-6 rounded-xl border shadow-sm bg-white" style={{ borderColor: DEFAULT_PRESET_COLORS.light }}>
                            <h2 className="font-bold text-2xl mb-6 text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>Prendre un rendez-vous</h2>
                            <form onSubmit={handleInitiateBooking} className="space-y-5">
                                <div className="space-y-2">
                                    <Text className="block text-sm font-medium text-gray-700">Type de Consultation</Text>
                                    {consultation_type === 'BOTH' ? (
                                        <div className="flex gap-4">
                                            <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${selectedConsultationType === 'IN_PERSON' ? 'bg-yellow-100 border-yellow-400 shadow-sm' : 'border-gray-200'}`}>
                                                <input type="radio" name="consultationType" value="IN_PERSON" checked={selectedConsultationType === 'IN_PERSON'} onChange={(e) => setSelectedConsultationType(e.target.value as 'IN_PERSON')} className="form-radio h-4 w-4 text-yellow-600"/>
                                                <span className="font-medium text-gray-800">En Cabinet</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${selectedConsultationType === 'ONLINE' ? 'bg-yellow-100 border-yellow-400 shadow-sm' : 'border-gray-200'}`}>
                                                <input type="radio" name="consultationType" value="ONLINE" checked={selectedConsultationType === 'ONLINE'} onChange={(e) => setSelectedConsultationType(e.target.value as 'ONLINE')} className="form-radio h-4 w-4 text-yellow-600"/>
                                                <span className="font-medium text-gray-800">En Ligne</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-md bg-gray-100 text-gray-800 font-medium">
                                            {consultation_type === 'IN_PERSON' ? 'Ce médecin ne propose que des consultations en cabinet.' : 'Ce médecin ne propose que des consultations en ligne.'}
                                        </div>
                                    )}
                                </div>

                                {/* --- NEW: Calendar and Time Slot UI --- */}
                                <div className="space-y-4">
                                    <div>
                                        <Text className="block text-sm font-medium text-gray-700 mb-2">Choisir une date</Text>
                                        {isAvailabilityLoading ? <LoadingSpinner text="Chargement des disponibilités..." /> :
                                            Object.keys(availableSlots).length > 0 ? (
                                                <div className="p-3 border rounded-lg flex justify-center">
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={handleDateSelect}
                                                        locale="fr"
                                                        minDate={new Date()}
                                                        maxDate={new Date(new Date().setDate(new Date().getDate() + 29))}
                                                        filterDate={(date) => {
                                                            const dateKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                            return !!availableSlots[dateKey];
                                                        }}
                                                        inline
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-3 border rounded-lg text-center text-gray-500">
                                                    Aucun créneau disponible pour le moment.
                                                </div>
                                            )
                                        }
                                    </div>
                                    {selectedDate && (
                                        <div>
                                            <Select label="Heure souhaitée" options={availableSlots[selectedDateKey] || []} value={selectedTime} onChange={setSelectedTime} placeholder="Choisir une heure" />
                                        </div>
                                    )}
                                </div>

                                <Input label="Prénom" placeholder="Votre prénom" value={clientFirstName} onChange={(e) => setClientFirstName(e.target.value)} required />
                                <Input label="Nom de famille" placeholder="Votre nom de famille" value={clientLastName} onChange={(e) => setClientLastName(e.target.value)} required />
                                <Input label="Email" type="email" placeholder="votre.email@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
                                <div>
                                    <Text as="label" className="block text-sm font-medium text-gray-700 mb-1">Téléphone (pour vérification)</Text>
                                    <PhoneInput placeholder="Numéro de téléphone" value={clientPhone} onChange={setClientPhone} defaultCountry="TN" className="react-phone-number-input-custom-style" limitMaxLength required />
                                </div>
                                <Textarea label="Message (Optionnel)" placeholder="Décrivez brièvement le motif..." value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} rows={3} />

                                <Button type="submit" disabled={isSubmitting || !selectedTime} isLoading={isSubmitting} className="w-full" size="lg" style={{ backgroundColor: DEFAULT_PRESET_COLORS.default, color: DEFAULT_PRESET_COLORS.foreground }}>
                                    Demander le rendez-vous
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} containerClassName="max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <Title as="h3">Vérifier votre numéro</Title>
                        <ActionIcon variant="outline" onClick={() => setIsOtpModalOpen(false)}><FaTimes /></ActionIcon>
                    </div>
                    <Text className="mt-2 text-gray-600">Un code à 6 chiffres a été envoyé au <span className="font-semibold">{clientPhone}</span>. Veuillez l'entrer ci-dessous.</Text>
                    <form onSubmit={handleVerifyAndCreateBooking} className="mt-6 space-y-4">
                        <Input label="Code de vérification (OTP)" placeholder="_ _ _ _ _ _" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={6} inputClassName="text-center tracking-[1em]" prefix={<FaShieldAlt className="text-gray-400" />} required />
                        <Button type="submit" disabled={isVerifyingOtp} isLoading={isVerifyingOtp} className="w-full" size="lg" style={{ backgroundColor: DEFAULT_PRESET_COLORS.default, color: DEFAULT_PRESET_COLORS.foreground }}>
                            Vérifier et Confirmer
                        </Button>
                    </form>
                </div>
            </Modal>

            <Toaster position="top-center" />
        </>
    );
}
