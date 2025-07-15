'use client';

import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from 'rizzui';
import useSWR from 'swr';
import TreatmentTimeline from './treatment-timeline';

// Fetcher function
const fetcher = (url: string) =>
  axios
    .get(url, { withCredentials: true })
    .then((res) => res.data.data.user);

export default function TrackingPage() {
  const params = useParams();
  const [started, setStarted] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(true); // Loading state
  const [nbrMonthsDuration, setNbrMonthsDuration] = useState<number>(1); // New state for treatment duration
  const caseId = params?.caseId ? String(params.caseId) : 'Unknown Case';

  // Fetch the user's credentials
  const { data: user, error: userError, isLoading: isUserLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/me`, fetcher);
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        console.log("Unauthorized access - User not logged in.");
        // router.push("/signup");
      } else {
        console.log("Authenticated user:", user);
        console.log("Case ID being accessed:", caseId);

        // Give admin full access to all treatments
        if (user.role === 'admin') {
          setHasAccess(true);
        } else {
          // For non-admin users, check if they have access to this specific case
          const userHasAccess = user.cases.some((userCase: number) => Number(userCase) === Number(caseId));
          setHasAccess(userHasAccess);

          if (!userHasAccess) {
            console.log("Access to case unauthorized for caseId:", caseId);
            if (user.cases.length > 0) {
              console.log("Redirecting to the first accessible case:", user.cases[0]);
              // router.push(`/cases/${user.cases[0]}/treatment`);
            } else {
              console.log("No accessible cases found. Redirecting to the default page.");
              // router.push("/");
            }
          }
        }
      }
    }

    const fetchStartedStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cases/${caseId}/start-status`, { withCredentials: true });
        setStarted(response.data.started);
        setIsLoading(false); // Stop loading once the data is fetched
      } catch (error) {
        console.error('Error fetching started status:', error);
        setIsLoading(false); // Stop loading if there's an error
      }
    };

    fetchStartedStatus();
  }, [isUserLoading, router, user, caseId]);

  const pageHeader = {
    title: 'Plan du traitement',
    breadcrumb: [
      {
        href: routes.cases.list,
        name: 'cas',
      },
      {
        name: String(caseId),
      },
    ],
  };

  const handleStartTreatment = async () => {
    try {
      setIsLoading(true); // Set loading state
      console.log('caseId being sent:', caseId);

      // Step 1: Fetch steps for the treatment
      console.log('[INFO] Fetching steps for treatment...');
      const stepsResponse = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/treatment-step/${caseId}`,
        { withCredentials: true }
      );

      const { data: caseData } = stepsResponse.data;
      const steps = parseInt(caseData.steps, 10);

      if (isNaN(steps)) {
        throw new Error('Invalid steps fetched from the backend');
      }
      console.log('[INFO] Steps fetched successfully:', steps);

      // Step 2: Create treatments based on steps
      console.log('[INFO] Creating treatments...');
      const createTreatmentResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments`,
        { case_id: caseId, steps },
        { withCredentials: true }
      );

      if (createTreatmentResponse.status === 200) {
        toast.success('Traitement créé avec succès.');
      } else {
        throw new Error('Erreur lors de la création du Traitement.');
      }

      // Step 3: Update the start date and mark as started
      console.log('[INFO] Updating treatment start date...');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${caseId}/updateStartDate`,
        { started: true },
        { withCredentials: true }
      );

      setStarted(true);
      toast.success('Start date updated successfully');
    } catch (error) {
      console.error('Error during treatment initialization:', error);
      toast.error("Échec de l'initialisation du traitement. Veuillez réessayer.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader variant="spinner" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      {hasAccess && !started && (user?.roleId == 4 || user?.role === 'admin') && (
        <div className="mb-4 space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center">
            <button
              onClick={handleStartTreatment}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary-dark transition focus:outline-none focus-visible:ring-[1.8px] focus-visible:ring-muted focus-visible:ring-offset-2 ring-offset-background font-semibold"
            >
              Démarrer le traitement (Définir la date de début à aujourd'hui)
            </button>
          </div>
        </div>
      )}
      {hasAccess && !started && user?.roleId == 3 && (
          <div className="flex justify-center">
            Le Traitement n'a pas encore commencé
          </div>
      )}
      {hasAccess && started && <TreatmentTimeline user={user} className="mb-10" />}
    </>
  );
}
