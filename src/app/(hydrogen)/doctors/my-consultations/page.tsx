'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer, EventProps, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axiosInstance from '@/utils/axiosInstance';
import { Title, Text, Modal, Button } from 'rizzui';
import { FaCalendarAlt, FaVideo, FaMapMarkerAlt, FaUsers, FaExternalLinkAlt, FaInfoCircle, FaRegCalendarTimes, FaCalendarCheck } from 'react-icons/fa';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/app/shared/page-header';

// Setup moment localizer for French language
moment.locale('fr');
const localizer = momentLocalizer(moment);

// Interfaces
interface CalendarEvent {
  id?: string;
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  resource?: {
    description?: string;
    location?: string;
    attendees?: { email: string; displayName?: string; responseStatus: string }[];
    meetLink?: string;
    calendarLink?: string;
  };
}

interface ApiResponse {
  events: CalendarEvent[];
  message?: string;
}

// Custom Event Component for the Month view (shows a centered icon)
const MonthEvent = ({ event }: EventProps<CalendarEvent>) => (
  <div className="w-full h-full flex items-center justify-center" title={event.title}>
    <FaCalendarCheck className="text-white text-base" />
  </div>
);

// FIX: Added a dedicated component to ensure Agenda events render correctly.
const AgendaEvent = ({ event }: EventProps<CalendarEvent>) => (
  <div className="font-semibold text-gray-800">
    {event.title}
  </div>
);


// More user-friendly loading message
const LoadingState = () => (
    <div className="flex flex-col justify-center items-center h-[85vh] bg-gray-50 rounded-xl">
        <svg className="animate-spin h-12 w-12 text-[#d39424]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <Title as="h3" className="text-xl font-semibold mt-4 text-gray-600">Chargement de vos consultations...</Title>
        <Text className="text-gray-500 mt-1">Un instant, s'il vous plaît.</Text>
    </div>
);

// A dedicated component for error or informational messages
const InfoState = ({ message, isError }: { message: string, isError: boolean }) => (
    <div className={`flex flex-col justify-center items-center h-[85vh] bg-white rounded-xl p-8 text-center border-2 ${isError ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <FaInfoCircle className={`h-12 w-12 mb-4 ${isError ? 'text-red-500' : 'text-yellow-500'}`} />
        <Title as="h3" className="text-xl font-bold mb-2">{isError ? 'Une Erreur est Survenue' : 'Information'}</Title>
        <Text className="max-w-md text-gray-600">{message}</Text>
        {(message.includes("révoquée") || message.includes("not linked")) && (
            <Link href={routes.forms.doctorCalendarSettings} className="mt-4">
                <Button as="span" className="bg-[#d39424] hover:bg-[#a16207]">
                    Aller aux Paramètres du Calendrier
                </Button>
            </Link>
        )}
    </div>
);

// More engaging empty state message
const EmptyState = () => (
    <div className="flex flex-col justify-center items-center h-[85vh] bg-white rounded-xl p-8 text-center border-2 border-dashed">
        <FaRegCalendarTimes className="h-16 w-16 mb-4 text-gray-300" />
        <Title as="h3" className="text-2xl font-bold text-gray-700 mb-2">Agenda Dégagé ! 🗓️</Title>
        <Text className="max-w-md text-gray-500">
            Aucune consultation n'est prévue pour le moment. Les nouvelles réservations apparaîtront ici.
        </Text>
    </div>
);

// Comprehensive styles for ALL calendar views
const CalendarStyles = () => (
  <style jsx global>{`
    /* General Toolbar */
    .rbc-toolbar {
      display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem; font-size: 1rem;
    }
    .rbc-toolbar .rbc-toolbar-label {
      font-size: 1.5em; font-weight: 700; color: #1f2937;
    }
    .rbc-toolbar .rbc-btn-group button {
      background-color: #f9fafb; border: 1px solid #d1d5db; color: #374151;
      padding: 0.5rem 1rem; cursor: pointer; transition: background-color 0.2s;
    }
    .rbc-toolbar .rbc-btn-group button:hover { background-color: #f3f4f6; }
    .rbc-toolbar .rbc-btn-group button.rbc-active {
      background-color: #d39424; color: white; border-color: #a16207;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* --- MONTH VIEW --- */
    .rbc-month-view .rbc-event {
        width: 32px !important; height: 32px !important; border-radius: 50% !important;
        padding: 0 !important; border: none !important; background-color: #d39424 !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15); cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .rbc-month-view .rbc-event:hover {
        transform: scale(1.15); box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .rbc-month-view .rbc-event-content { font-size: 0; }
    .rbc-month-view .rbc-row-segment {
        padding: 0; display: flex; justify-content: center; align-items: center;
        height: 100%; width: 100%;
    }
    .rbc-month-row { min-height: 90px; overflow: visible; }
    .rbc-day-bg.rbc-today { background-color: #fef9c3; }

    /* --- AGENDA VIEW --- */
    .rbc-agenda-view .rbc-agenda-table {
        border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden;
    }
    .rbc-agenda-view .rbc-agenda-table tr { transition: background-color 0.2s ease; cursor: pointer; }
    .rbc-agenda-view .rbc-agenda-table tr:hover { background-color: #f9fafb; }
    .rbc-agenda-view .rbc-agenda-table td {
        padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;
    }
    .rbc-agenda-view .rbc-agenda-table tr:last-child td { border-bottom: none; }
    .rbc-agenda-view .rbc-agenda-date-cell, .rbc-agenda-view .rbc-agenda-time-cell {
        color: #6b7280; font-weight: 500;
    }
    .rbc-agenda-view .rbc-header { display: none; }
    
    /* --- WEEK & DAY VIEWS (TimeGrid) --- */
    .rbc-time-view .rbc-event {
        border-radius: 5px !important; background-color: #d39424; color: white;
        padding: 5px 8px; border: 1px solid #a16207;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: background-color 0.2s, box-shadow 0.2s;
    }
    .rbc-time-view .rbc-event:hover {
        background-color: #a16207; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .rbc-time-view .rbc-event-label { font-size: 0.8rem; }
    .rbc-time-view .rbc-event-content { font-size: 0.9rem; }
    .rbc-time-view, .rbc-agenda-view { height: 100%; }
  `}</style>
);


const pageHeader = {
  title: 'Mes Consultations',
  breadcrumb: [
    { name: 'Docteur' },
    { name: 'Mes Consultations' },
  ],
};

export default function MyConsultationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'doctor')) {
      router.push(routes.accessDenied);
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user && user.role === 'doctor') {
      const fetchConsultations = async () => {
        try {
          setLoading(true);
          setError(null);
          setIsAuthError(false);
          const response = await axiosInstance.get<ApiResponse>('/contact/consultations');
          
          const formattedEvents = (response.data.events || []).map(event => ({
            ...event,
            start: event.start ? new Date(event.start) : undefined,
            end: event.end ? new Date(event.end) : undefined,
          }));
          setEvents(formattedEvents);

          if (response.data.message) {
            setError(response.data.message);
          }
        } catch (err: any) {
          console.error("Failed to fetch consultations:", err);
          const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la récupération de vos consultations.";
          setError(errorMessage);
          if (err.response?.status === 401) {
              setIsAuthError(true);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchConsultations();
    }
  }, [user]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  }, []);

  const messages = useMemo(() => ({
    allDay: 'Journée', previous: 'Précédent', next: 'Suivant', today: "Aujourd'hui",
    month: 'Mois', week: 'Semaine', day: 'Jour',
    date: 'Date', time: 'Heure', event: 'Événement',
    noEventsInRange: 'Aucune consultation dans cette période.',
    showMore: (total: number) => `+ ${total} de plus`,
  }), []);

  const eventStyleGetter = useCallback(() => ({ style: {} }), []);

  const renderContent = () => {
    if (isAuthLoading || loading) {
      return <LoadingState />;
    }
    if (error) {
      return <InfoState message={error} isError={isAuthError} />;
    }
    if (events.length === 0) {
      return <EmptyState />;
    }
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200" style={{ minHeight: '85vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          // FIX: Use specific components for each view to ensure correct rendering
          components={{
            month: { event: MonthEvent },
          }}
          views={['month', 'week', 'day']}
          defaultView={'month' as View}
          popup
          defaultDate={new Date()}
          length={90}
          scrollToTime={new Date()}
        />
      </div>
    );
  };
  
  if (isAuthLoading || !user || user.role !== 'doctor') {
     return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
            <div className="p-4 sm:p-6 lg:p-8 -mt-4">
                <LoadingState />
            </div>
        </>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CalendarStyles />
      <div className="p-4 sm:p-6 lg:p-8 -mt-4">
        {renderContent()}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} containerClassName="max-w-xl">
        <div className="m-auto px-4 pt-8 pb-6 sm:px-6 sm:pb-8">
          {selectedEvent && (
            <>
              <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center">
                      <div className="flex-shrink-0 bg-[#fef9c3] rounded-full p-3 mr-4">
                          <FaCalendarAlt className="text-2xl text-[#d39424]" />
                      </div>
                      <div>
                          <Title as="h3" className="text-xl font-bold text-gray-900">{selectedEvent.title}</Title>
                          <Text className="text-gray-500">{moment(selectedEvent.start).format('dddd D MMMM YYYY')}</Text>
                      </div>
                  </div>
                  <Button size="sm" variant="text" onClick={closeModal} className="text-gray-500 hover:text-gray-800">Fermer</Button>
              </div>
              <div className="space-y-5 text-gray-700 border-t border-gray-200 pt-5">
                  <div>
                      <Text className="font-semibold text-gray-800">Date et Heure :</Text>
                      <Text>{moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</Text>
                  </div>

                  {selectedEvent.resource?.location && (
                      <div>
                          <Text className="font-semibold text-gray-800 flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-400"/>Localisation :</Text>
                          <Text>{selectedEvent.resource.location}</Text>
                      </div>
                  )}
                  
                  {selectedEvent.resource?.description && (
                      <div>
                          <Text className="font-semibold text-gray-800">Description / Message du Patient :</Text>
                          <Text as="p" className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200 mt-1">
                              {selectedEvent.resource.description}
                          </Text>
                      </div>
                  )}

                  {selectedEvent.resource?.attendees && (
                      <div>
                          <Text className="font-semibold text-gray-800 flex items-center"><FaUsers className="mr-2 text-gray-400"/>Participants :</Text>
                          <ul className="list-disc list-inside pl-2 mt-1">
                              {selectedEvent.resource.attendees.map((att, index) => (
                                  <li key={index} className="text-sm">{att.displayName || att.email} ({att.responseStatus})</li>
                              ))}
                          </ul>
                      </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      {selectedEvent.resource?.meetLink && (
                          <a href={selectedEvent.resource.meetLink} target="_blank" rel="noopener noreferrer">
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                  <FaVideo className="mr-2" /> Rejoindre avec Google Meet
                              </Button>
                          </a>
                      )}
                       {selectedEvent.resource?.calendarLink && (
                          <a href={selectedEvent.resource.calendarLink} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="shadow-sm">
                                  <FaExternalLinkAlt className="mr-2" /> Voir dans Google Calendar
                              </Button>
                          </a>
                      )}
                  </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}