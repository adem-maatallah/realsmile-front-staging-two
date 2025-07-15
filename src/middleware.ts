// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { get } from '@vercel/edge-config'; // Assuming you still use Vercel Edge Config for maintenance mode
import axios from 'axios'; // Import axios directly for middleware fetch, as axiosInstance might not be suitable here

// --- Role Access Map (Keep this as is) ---
const roleAccessMap: any = {
  admin: [
    '/',
    '/devis',
    '/invoices',
    '/invoices/[id]',
    '/doctors',
    '/doctors/[id]',
    '/devis/[id]',
    '/cases',
    '/cases/sub-cases/[id]',
    '/retaining-gutters/create',
    '/retaining-gutters',
    '/cases/renumerer/[id]',
    '/cases/[id]',
    '/cases/[id]/treatment',
    '/cases/realsmile-ai',
    '/cases/doctor/create/[id]',
    '/cases/update/[id]',
    '/pricing',
    '/users',
    '/users/[id]',
    '/patients',
    '/patients/[patientId]',
    '/patients/[patientId]/cases',
    '/patients/[patientId]/cases/[caseId]',
    '/labo',
    '/labo/[id]',
    '/labo/iiwgl/[id]',
    '/pricing',
    '/profile-settings',
    '/profile-settings/password',
    '/profile-settings/security',
    '/labo/[id]',
    '/labo/iiwgl/[id]',
    '/announcement',
    '/activity',
    '/support',
    '/access-denied',
    '/advancement',
    '/doctors/[id]/fiche',
    '/doctors/[id]/transactions',
    // E-commerce URLs for admin
    '/products',
    '/products/[slug]',
    '/products/create',
    '/products/[slug]/edit',
    '/categories',
    '/orders',
    '/orders/[id]',
    '/shop',
    '/checkout/[reference]',
    '/formations',
    '/commercials',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
    '/alerts/[patient_user_id]',
    '/alerts',
  ],
  doctor: [
    '/',
    '/devis',
    '/invoices',
    '/invoices/[id]',
    '/devis/[id]',
    '/cases',
    '/advancement',
    '/cases/sub-cases/[id]',
    '/profile-settings',
    '/profile-settings/password',
    '/retaining-gutters/create',
    '/retaining-gutters',
    '/cases/renumerer/[id]',
    '/profile-settings/security',
    '/patients',
    '/patients/[patientId]',
    '/patients/[patientId]/cases',
    '/patients/[patientId]/cases/[caseId]',
    '/cases/create',
    '/pricing',
    '/cases/realsmile-ai',
    '/cases/[id]',
    '/cases/[id]/treatment',
    '/cases/update/[id]',
    '/activity',
    '/support',
    '/access-denied',
    '/doctors/[id]/fiche',
    '/doctors/[id]/transactions',
    // New E-commerce URLs for doctor
    '/shop',
    '/orders',
    '/orders/[id]',
    '/checkout/[reference]',
    '/formations',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
    '/alerts/[patient_user_id]',
    '/alerts/[patient_user_id]/doctor',
    '/alerts'
  ],
  labo: [
    '/',
    '/cases',
    '/labo',
    '/labo/[id]',
    '/profile-settings',
    '/profile-settings/password',
    '/profile-settings/security',
    '/labo/iiwgl/[id]',
    '/activity',
    '/access-denied',
    '/formations',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
  ],
  patient: [
    '/',
    '/profile-settings',
    '/profile-settings/password',
    '/profile-settings/security',
    '/labo/inrealsmile-ai',
    '/activity',
    '/access-denied',
    '/formations',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
  ],
  hachem: [
    '/',
    '/users/[id]',
    '/labo/inconstruction',
    '/cases/in-construction',
    '/cases/[id]',
    '/profile-settings',
    '/profile-settings/password',
    '/profile-settings/security',
    '/retaining-gutters',
    '/activity',
    '/invoices',
    '/invoices/[id]',
    '/access-denied',
    '/formations',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
    '/devis',
    '/devis/[id]',
  ],
  commercial: [
    '/cases', // Mes cas
    '/cases/[id]', // Mes cas
    '/cases/update/[id]', // Mes cas
    '/cases/doctor/create/[id]', // Mes cas
    '/doctors', // Mes praticiens
    '/doctors/[id]', // Mes praticiens
    '/doctors/[id]/transactions', // Transactions
    '/doctors/[id]/fiche', // fiche
    '/doctors/create', // Ajouter un praticien
    '/invoices', // Liste des factures
    '/shop',
    '/orders',
    '/orders/[id]',
    '/checkout/[reference]',
    '/formations',
    '/helpdesk', // Centre d'aide
    '/profile-settings',
    '/profile-settings/password',
    '/profile-settings/security',
    '/realsmile-ai',
    '/realsmile-ai/[caseId]',
  ],
  finance: [
    '/',
    '/invoices',
    '/invoices/[id]'
  ],
};

function pathMatches(pattern: string, pathname: string): boolean {
  const regex = new RegExp(
    '^' +
    pattern
      .replace(/\[.*?\]/g, '[^/]+')
      .replace(/\//g, '\\/') +
    '$'
  );
  return regex.test(pathname);
}

function roleAllows(role: string, pathname: string): boolean {
  return (roleAccessMap[role] || []).some((p: string) => pathMatches(p, pathname));
}

// Function to fetch session from your backend /me endpoint
// IMPORTANT: Ensure your backend's /me endpoint returns latitude and longitude for the user
async function fetchSession(sessionCookie: string): Promise<any> {
  console.log('[Middleware] fetchSession: Attempting to fetch user data from /me');
  try {
    // Use direct fetch or a simple axios instance for middleware to avoid client-side axiosInstance config issues
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      headers: {
        'Cookie': `realsmile.session=${sessionCookie}`
      },
      // credentials: 'include' might be needed if your API is on a different domain/subdomain
      // and you want to ensure cookies are sent. For same-origin, it's often default.
    });

    console.log(`[Middleware] fetchSession: /me response status: ${res.status}`);

    if (!res.ok) { // Check for non-2xx status codes
      console.error(`[Middleware] fetchSession: Backend /me endpoint returned non-OK response: ${res.status}`);
      throw new Error(`Failed to fetch session: Backend responded with status ${res.status}.`);
    }

    const data = await res.json(); // Parse JSON response
    console.log('[Middleware] fetchSession: Raw data from /me:', JSON.stringify(data, null, 2));

    if (data && data.status === 'success' && data.data && data.data.user) {
      console.log(`[Middleware] fetchSession: Successfully extracted user data for ID: ${data.data.user.id}, Role: ${data.data.user.role}`);
      return data.data.user; // Return only the user object, which should now include latitude/longitude
    }

    console.error('[Middleware] fetchSession: Unexpected response structure from /me:', JSON.stringify(data, null, 2));
    throw new Error('Invalid session data structure received from /me endpoint.');

  } catch (error: any) {
    console.error(`[Middleware] fetchSession error: ${error.message}`, error);
    throw error;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`\n--- Middleware: Processing path: ${pathname} ---`);

  // 1) Bypass Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // Catches favicon.ico, .png, .jpg, etc.
    pathname.startsWith('/api') // Bypass API routes
  ) {
    console.log('[Middleware] Bypass: Matched internal/static/API pattern. Allowing.');
    return NextResponse.next();
  }

  // 2) Define public routes that do NOT require authentication or authorization
  const PUBLIC_ROUTES = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/otp',
    '/access-denied',
    '/maintenance',
    '/verify-email/', // Specific prefix for email verification
    '/verify-location', // NEW: Allow access to the location verification page
    '/accueil',
  ];

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    route.endsWith('/') ? pathname.startsWith(route) : pathname === route
  );
  console.log(`[Middleware] Is public route (${pathname}): ${isPublicRoute}`);

  // If accessing a public route
  if (isPublicRoute) {
    // Special handling for /signin: if user has a valid session, redirect them to home
    if (pathname === '/signin') {
      console.log('[Middleware] On /signin. Checking for existing session.');
      const sessionCookie = req.cookies.get('realsmile.session')?.value;
      if (sessionCookie) {
        console.log('[Middleware] /signin: realsmile.session cookie found. Attempting to validate...');
        try {
          await fetchSession(sessionCookie); // Try to validate session
          console.log('[Middleware] /signin: Session is valid. Redirecting to /');
          return NextResponse.redirect(new URL('/', req.url)); // Valid session, go home
        } catch (error) {
          console.log("[Middleware] /signin: Existing session cookie is invalid/expired. Allowing access to /signin.");
          // If session is invalid, allow them to stay on /signin to re-login
        }
      } else {
        console.log('[Middleware] /signin: No realsmile.session cookie found.');
      }
    }
    console.log('[Middleware] Allowing access to public route.');
    return NextResponse.next(); // Allow access to other public routes
  }

  // 3) Maintenance Mode Check (after public routes, so maintenance page itself is accessible)
  try {
    const isInMaintenanceMode = await get('isInMaintenanceMode');
    console.log(`[Middleware] Maintenance mode status from Edge Config: ${isInMaintenanceMode}`);
    if (isInMaintenanceMode) {
      console.log('[Middleware] Maintenance mode active, redirecting to /maintenance.');
      return NextResponse.rewrite(new URL('/maintenance', req.url));
    }
  } catch (error) {
    console.error("[Middleware] Error fetching maintenance mode from Edge Config:", error);
    // If Edge Config fails, assume not in maintenance for safety and proceed
  }

  // 4) Session Authentication for ALL other routes (protected routes)
  console.log(`[Middleware] Protected route (${pathname}). Checking for session cookie.`);
  const sessionCookie = req.cookies.get('realsmile.session')?.value;

  if (!sessionCookie) {
    console.log(`[Middleware] No realsmile.session cookie found for ${pathname}. Redirecting to /signin.`);
    return NextResponse.redirect(new URL('/signin', req.url));
  }
  console.log(`[Middleware] realsmile.session cookie found for ${pathname}. Value present.`);

  let userSessionData: any;
  try {
    userSessionData = await fetchSession(sessionCookie);
    console.log(`[Middleware] User session data successfully fetched for ID: ${userSessionData.id}, Role: ${userSessionData.role}`);
  } catch (error) {
    console.error(`[Middleware] Session validation failed for ${pathname}: ${error}`);
    // Clear bad cookie and redirect to login
    const response = NextResponse.redirect(new URL('/signin', req.url));
    response.headers.set(
      'Set-Cookie',
      `realsmile.session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0;`
    );
    console.log('[Middleware] Invalid session cookie. Clearing cookie and redirecting to /signin.');
    return response;
  }

  // 5) User Status Check
  if (!userSessionData || userSessionData.status === false) {
    console.log(`[Middleware] User ${userSessionData?.id} is inactive or data is missing. Redirecting to /signin.`);
    const response = NextResponse.redirect(new URL('/signin', req.url));
    response.headers.set(
      'Set-Cookie',
      `realsmile.session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0;`
    );
    return response;
  }
  console.log(`[Middleware] User ${userSessionData.id} status is active.`);

  // 6) Two-Factor Authentication / Phone Verification Check
  if (userSessionData.two_factor_enabled && !userSessionData.phone_verified) {
    console.log(`[Middleware] User ${userSessionData.id}: 2FA enabled (${userSessionData.two_factor_enabled}) and phone verified (${userSessionData.phone_verified}).`);
    if (!pathname.startsWith('/otp')) { // Use startsWith to cover /otp and /otp/something
      console.log(`[Middleware] User ${userSessionData.id}: Redirecting to /otp because 2FA is enabled but phone is not verified.`);
      return NextResponse.redirect(new URL('/otp', req.url));
    } else {
      console.log(`[Middleware] User ${userSessionData.id}: Already on /otp page. Allowing access.`);
    }
  } else {
      console.log(`[Middleware] User ${userSessionData.id}: 2FA not required or phone already verified. (2FA: ${userSessionData.two_factor_enabled}, Phone Verified: ${userSessionData.phone_verified})`);
  }

  // 7) Location Verification Check (NEW)
  // Check if latitude or longitude are null/undefined for the authenticated user
  const hasLocationData = userSessionData.latitude !== null && userSessionData.latitude !== undefined &&
                          userSessionData.longitude !== null && userSessionData.longitude !== undefined;

  console.log(`[Middleware] User ${userSessionData.id} has location data: ${hasLocationData}`);
  const isDoctor = userSessionData.role === 'doctor';
  console.log(`[Middleware] User ${userSessionData.role_id} is a doctor: ${isDoctor}`);
  if (isDoctor && !hasLocationData && pathname !== '/verify-location') {
    console.log(`[Middleware] User ${userSessionData.id} has no location data. Redirecting to /verify-location.`);
    return NextResponse.redirect(new URL('/verify-location', req.url));
  }

  // 8) Role-Based Authorization
  const userRole = userSessionData.role;
  console.log(`[Middleware] User ${userSessionData.id} has role: '${userRole}'. Checking role access for path '${pathname}'.`);

  if (!userRole) {
    console.warn(`[Middleware] User ${userSessionData.id} has no defined role. Redirecting to /access-denied.`);
    return NextResponse.redirect(new URL('/access-denied', req.url));
  }

  if (!roleAllows(userRole, pathname)) {
    console.log(`[Middleware] User ${userSessionData.id} with role '${userRole}' NOT allowed for path '${pathname}'. Redirecting to /access-denied.`);
    return NextResponse.redirect(new URL('/access-denied', req.url));
  }
  console.log(`[Middleware] User ${userSessionData.id} with role '${userRole}' IS allowed for path '${pathname}'.`);

  // 9) All checks passed, allow the request to proceed
  console.log(`[Middleware] All checks passed for ${pathname}. Allowing request.`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|pdf|css|js|txt)$).*)'],
};
