// pages/api/logout-all.js

import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

/* export async function POST(req) {
  // Invalidate all sessions in your store (as shown above)
  // Example:
  // await invalidateAllSessions();

  // Create a response object
  const response = NextResponse.json({ message: 'All users logged out' });

  // Set the cookies to expire
  response.headers.set('Set-Cookie', [
    serialize('next-auth.session-token', '', {
      maxAge: -1,
      path: '/',
    }),
    serialize('next-auth.csrf-token', '', {
      maxAge: -1,
      path: '/',
    }),
  ]);

  return response;
} */
