'use client';

import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  return (
    <SessionProvider session={session} refetchInterval={24 * 60 * 60}>
      {children}
    </SessionProvider>
  );
}
