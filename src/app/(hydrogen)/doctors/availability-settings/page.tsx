// FILE: src/app/(hydrogen)/doctors/availability-settings/page.tsx (REPLACE ENTIRE FILE)
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Title, Text, Checkbox, Input } from 'rizzui';
import axiosInstance from '@/utils/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/app/shared/page-header';

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const pageHeader = {
  title: 'Gérer mes disponibilités',
  breadcrumb: [
    { name: 'Docteur' },
    { name: 'Paramètres de disponibilité' },
  ],
};

// Self-contained LoadingSpinner to prevent import errors
const LoadingSpinner = () => (
    <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-700">
        <svg className="animate-spin h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Chargement des paramètres...
    </div>
);


// --- Main Component ---
export default function AvailabilitySettingsPage() {
  const [schedule, setSchedule] = useState({});
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [consultationType, setConsultationType] = useState('BOTH');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- FIX: Simplified data fetching to a single API call ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/doctors/my-availability');
        const { consultation_type, working_days, closed_dates } = response.data;

        // Format weekly schedule
        const formattedSchedule = {};
        weekdays.forEach(day => {
          const dayData = working_days.find((d: any) => d.weekday === day);
          formattedSchedule[day] = {
            enabled: dayData ? !dayData.disabled : false,
            start: dayData ? new Date(dayData.start_time).toISOString().substr(11, 5) : '09:00',
            end: dayData ? new Date(dayData.end_time).toISOString().substr(11, 5) : '17:00',
          };
        });
        setSchedule(formattedSchedule);

        // Set closed dates
        setClosedDates(closed_dates.map((d: any) => d.closed_date.split('T')[0]));

        // Set consultation type
        setConsultationType(consultation_type || 'BOTH');

      } catch (error) {
        toast.error('Failed to load availability settings.');
        console.error("Fetch availability error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleAddClosedDate = async () => {
    if (!newClosedDate) return toast.error("Please select a date.");
    if (closedDates.includes(newClosedDate)) return toast.error("This date is already added.");

    toast.promise(
      axiosInstance.post('/doctors/my-closed-dates', { date: newClosedDate }),
      {
        loading: 'Adding date...',
        success: (res) => {
          setClosedDates(prev => [...prev, newClosedDate].sort());
          setNewClosedDate('');
          return res.data.message || 'Date added successfully!';
        },
        error: (err) => err.response?.data?.message || 'Failed to add date.',
      }
    );
  };
  
  const handleRemoveClosedDate = async (dateToRemove: string) => {
      toast.promise(
          axiosInstance.delete('/doctors/my-closed-dates', { data: { date: dateToRemove } }),
          {
              loading: 'Removing date...',
              success: (res) => {
                  setClosedDates(prev => prev.filter(date => date !== dateToRemove));
                  return res.data.message || 'Date removed successfully!';
              },
              error: (err) => err.response?.data?.message ||'Failed to remove date.',
          }
      );
  };

  const handleSaveAllSettings = () => {
    setIsSaving(true);
    const payload = { schedule, consultationType };
    toast.promise(
      axiosInstance.post('/doctors/my-availability', payload),
      {
        loading: 'Saving all settings...',
        success: (res) => res.data.message || 'Settings updated successfully!',
        error: (err) => err.response?.data?.message || 'Failed to save settings.',
      }
    ).finally(() => setIsSaving(false));
  };
  
  if (isLoading) {
      return <div className="p-8 text-center"><LoadingSpinner /></div>;
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-12">
        
        <section className="p-6 bg-white rounded-lg shadow">
          <Title as="h3" className="mb-2">Horaires de travail hebdomadaires</Title>
          <Text className="mb-6 text-gray-600">Définissez votre disponibilité hebdomadaire standard.</Text>
          <div className="space-y-4 max-w-2xl">
            {weekdays.map(day => (
              <div key={day} className="grid grid-cols-[150px_1fr_1fr] gap-4 items-center p-4 border rounded-lg bg-gray-50">
                <Checkbox 
                    label={day.charAt(0).toUpperCase() + day.slice(1)} 
                    checked={schedule[day]?.enabled || false} 
                    onChange={(e) => handleScheduleChange(day, 'enabled', e.target.checked)} 
                />
                <Input 
                    type="time" 
                    value={schedule[day]?.start || '09:00'} 
                    onChange={(e) => handleScheduleChange(day, 'start', e.target.value)} 
                    disabled={!schedule[day]?.enabled} 
                />
                <Input 
                    type="time" 
                    value={schedule[day]?.end || '17:00'} 
                    onChange={(e) => handleScheduleChange(day, 'end', e.target.value)} 
                    disabled={!schedule[day]?.enabled} 
                />
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 bg-white rounded-lg shadow">
          <Title as="h3" className="mb-2">Méthode de consultation</Title>
          <Text className="mb-6 text-gray-600">Choisissez comment vous effectuerez les consultations.</Text>
          {/* --- FIX: Using custom HTML radio buttons for reliability --- */}
          <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${consultationType === 'BOTH' ? 'bg-yellow-100 border-yellow-400 shadow-sm' : 'border-gray-200'}`}>
                  <input type="radio" name="consultationType" value="BOTH" checked={consultationType === 'BOTH'} onChange={(e) => setConsultationType(e.target.value)} className="form-radio h-4 w-4 text-yellow-600"/>
                  <span className="font-medium text-gray-800">En Ligne & En Cabinet</span>
              </label>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${consultationType === 'ONLINE' ? 'bg-yellow-100 border-yellow-400 shadow-sm' : 'border-gray-200'}`}>
                  <input type="radio" name="consultationType" value="ONLINE" checked={consultationType === 'ONLINE'} onChange={(e) => setConsultationType(e.target.value)} className="form-radio h-4 w-4 text-yellow-600"/>
                  <span className="font-medium text-gray-800">En Ligne Uniquement</span>
              </label>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${consultationType === 'IN_PERSON' ? 'bg-yellow-100 border-yellow-400 shadow-sm' : 'border-gray-200'}`}>
                  <input type="radio" name="consultationType" value="IN_PERSON" checked={consultationType === 'IN_PERSON'} onChange={(e) => setConsultationType(e.target.value)} className="form-radio h-4 w-4 text-yellow-600"/>
                  <span className="font-medium text-gray-800">En Cabinet Uniquement</span>
              </label>
          </div>
        </section>
        
        <section className="p-6 bg-white rounded-lg shadow">
          <Title as="h3" className="mb-2">Jours de congé / Vacances</Title>
          <Text className="mb-6 text-gray-600">Ajoutez les dates auxquelles vous n'êtes pas disponible.</Text>
          <div className="flex items-center gap-4 mb-4">
            <Input type="date" value={newClosedDate} onChange={(e) => setNewClosedDate(e.target.value)} className="max-w-xs" />
            <Button onClick={handleAddClosedDate} disabled={isSaving}>Ajouter une date</Button>
          </div>
          <div className="space-y-2 max-w-xs">
            {closedDates.length > 0 ? closedDates.map(date => (
              <div key={date} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <Text>{new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                <Button variant="text" size="sm" onClick={() => handleRemoveClosedDate(date)} disabled={isSaving} className="text-red-500">Retirer</Button>
              </div>
            )) : <Text className="text-gray-500">Aucune date ajoutée.</Text>}
          </div>
        </section>

        <div className="mt-10 flex justify-start border-t pt-6">
          <Button onClick={handleSaveAllSettings} isLoading={isSaving} size="lg">
            Enregistrer tous les paramètres
          </Button>
        </div>
      </div>
    </>
  );
}