// app/shared/doctors/[id].tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // For app router
// import { useRouter } from 'next/router'; // For pages router
import { Button, Text, Input, Textarea } from 'rizzui';
import toast, { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUserMd, FaCity, FaGlobe, FaRegAddressCard } from 'react-icons/fa';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import { DEFAULT_PRESET_COLORS } from '../find-doctors/FindDoctorsPage'; // Adjust path based on your structure

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
}

export default function DoctorProfilePage() {
  // For app router:
  const params = useParams();
  const doctorId = params.id as string;

  // For pages router:
  // const router = useRouter();
  // const { id: doctorId } = router.query;

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`${DEFAULT_PRESET_COLORS.dark}/doctors/${doctorId}`); // Use your API URL
        if (response.status !== 200) {
          throw new Error(response.data?.message || "Failed to fetch doctor details.");
        }
        setDoctor(response.data);
      } catch (err: any) {
        console.error("Error fetching doctor details:", err);
        setError(`Failed to load doctor profile: ${err.message}. Please check network connection.`);
        toast.error(`Failed to load doctor profile: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.dismiss(); // Clear existing toasts

    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Veuillez remplir tous les champs du formulaire.");
      setIsSubmitting(false);
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      toast.error("Veuillez entrer une adresse email valide.");
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real application, you'd send this to your backend
      // which would then send an email to the doctor.
      console.log("Sending contact form:", {
        toDoctorId: doctorId,
        fromName: contactName,
        fromEmail: contactEmail,
        message: contactMessage,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Votre message a été envoyé avec succès au médecin !");
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      console.error("Error sending contact form:", err);
      toast.error("Échec de l'envoi du message. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Text className="text-lg font-semibold text-gray-700">Chargement du profil du médecin...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-red-700 text-lg font-semibold text-center">
        {error}
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

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter flex flex-col items-center bg-gray-50">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border-px border-gray-200">
        <header className="text-center mb-10">
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
            style={{ color: DEFAULT_PRESET_COLORS.dark, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
          >
            Profil du Dr. <span style={{ color: DEFAULT_PRESET_COLORS.default }}>{doctor.first_name} {doctor.last_name}</span>
          </h1>
          <p className="text-center text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Informations détaillées sur le Dr. {doctor.last_name}.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Doctor Info Section */}
          <div className="flex flex-col items-center p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: DEFAULT_PRESET_COLORS.lighter, borderColor: DEFAULT_PRESET_COLORS.light }}
          >
            {doctor.profile_pic && (
              <div className="mb-4">
                <Image
                  src={doctor.profile_pic}
                  alt={doctor.user_name || 'Profil du médecin'}
                  width={150}
                  height={150}
                  className="rounded-full object-cover border-4 border-gray-300 shadow-lg"
                  unoptimized={true}
                />
              </div>
            )}
            <h2 className="font-bold text-3xl mb-2" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
              {doctor.user_name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim()}
            </h2>
            {doctor.speciality && <p className="text-lg text-gray-700 flex items-center mb-2"><FaUserMd className="mr-2" /> <strong>Spécialité:</strong> {doctor.speciality}</p>}
            {doctor.email && <p className="text-lg text-gray-700 flex items-center mb-2"><FaEnvelope className="mr-2" /> <strong>Email:</strong> <a href={`mailto:${doctor.email}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{doctor.email}</a></p>}
            {(doctor.phone || doctor.office_phone) && <p className="text-lg text-gray-700 flex items-center mb-2"><FaPhoneAlt className="mr-2" /> <strong>Téléphone:</strong> <a href={`tel:${doctor.phone || doctor.office_phone}`} className="hover:underline" style={{ color: DEFAULT_PRESET_COLORS.dark }}>{doctor.phone || doctor.office_phone}</a></p>}
            {(doctor.address || doctor.address_2 || doctor.city || doctor.zip || doctor.country) && (
              <p className="text-lg text-gray-700 flex items-start mb-2 text-center md:text-left">
                <FaRegAddressCard className="mr-2 flex-shrink-0 mt-1" /> <strong>Adresse:</strong><br />
                {doctor.address}{doctor.address_2 ? `, ${doctor.address_2}` : ''}<br />
                {doctor.city}{doctor.zip ? `, ${doctor.zip}` : ''}<br />
                {doctor.country}
              </p>
            )}
            {(doctor.latitude !== null && doctor.longitude !== null) && (
              <p className="text-lg text-gray-700 flex items-center mb-2">
                <FaGlobe className="mr-2" /> <strong>Coordonnées:</strong> Lat: {doctor.latitude?.toFixed(6)}, Lng: {doctor.longitude?.toFixed(6)}
              </p>
            )}
          </div>

          {/* Contact Form Section */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: '#ffffff', borderColor: DEFAULT_PRESET_COLORS.light }}
          >
            <h2 className="font-bold text-2xl mb-5 text-center" style={{ color: DEFAULT_PRESET_COLORS.dark }}>
              Contacter le Dr. {doctor.last_name}
            </h2>
            <form onSubmit={handleSubmitContactForm} className="space-y-4">
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Nom</Text>
                <Input
                  type="text"
                  placeholder="Votre nom complet"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Email</Text>
                <Input
                  type="email"
                  placeholder="votre.email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-1">Votre Message</Text>
                <Textarea
                  placeholder="Écrivez votre message ici..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
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
                    Envoi...
                  </>
                ) : (
                  "Envoyer le message"
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