// app/verify-location/page.tsx
'use client';

import React from 'react';
import LocationTracker from '@/components/location-tracker/LocationTracker'; // Adjust path if needed



export default function VerifyLocationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {/* The LocationTracker component will handle displaying the non-dismissible modal */}
      <LocationTracker />
    </div>
  );
}
