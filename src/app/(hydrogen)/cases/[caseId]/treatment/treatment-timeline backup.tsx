/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check, Circle, Router } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
// import { useRouter } from 'next/router';
import { Button, Input, Loader, Progressbar } from 'rizzui';
import VideoUploadDisplay from './video-upload-display'
import Image from 'next/image';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import MessageBody from '@/app/shared/support/inbox/message-body';
import MessageDetails from '@/app/shared/support/inbox/message-details';
import { CommentSkeleton } from './skeletonComment';
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

const statusColors = {
  completed: 'text-green-500',
  in_progress: 'text-yellow-500',
  pending: 'text-gray-500',
  overdue: 'text-red-500'
}

const videoStatusColors = {
  approved: 'text-green-500',
  pending: 'text-yellow-500',
  rejected: 'text-red-500',
}
const statusTranslation = {
  completed: "Terminé",
  pending: "En attente",
  overdue: "En retard",
  in_progress: "En cours"
};



interface TreatmentTimelineProps {
  user: {id:number, email: string, role:number}
  className?: string
}
interface Video {
  id: string
  thumbnail: string
  iframe: string
}

interface TreatmentSlot {
  id: number;
  case_id: number;
  treatment_number: number;
  video_horizontal_link: string | null;
  video_vertical_link: string | null;
  video_outer_link: string | null;
  video_horizontal_upload_date: string | null;
  video_vertical_upload_date: string | null;
  video_outer_upload_date: string | null;
  video_horizontal_status: 'pending' | 'approved' | 'rejected';
  video_vertical_status: 'pending' | 'approved' | 'rejected';
  video_outer_status: 'pending' | 'approved' | 'rejected';
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  finalized: boolean
  qr_code: string
  verified: boolean
}
type Message = {
  id: number;
  case_id: number;
  treatment_id: number;
  user_id: number;
  comment: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};
// SWR treatmentFetcher function using Axios
const treatmentFetcher = (url: string) =>
  axios
    .get(url, { withCredentials: true }) // Ensure cookies are sent with the request
    .then((res) => res.data.data); // Adjust based on your response structure


export default function TreatmentTimeline({user, className}: TreatmentTimelineProps) {
  if (!user) {
    // Handle when user is not logged in (e.g., redirect to login or show a message)
    const router = useRouter()
    router.replace("/signin")
    return <div>You must be logged in to view this page.</div>;
  }
  const { caseId } = useParams();
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [treatmentVideos, setTreatmentVideos] = useState<{ [key: number]: { outer: Video | null; horizontal: Video | null; vertical: Video | null; finalized: boolean } }>({});
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // State for skeleton loading
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);  // State for skeleton loading
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
  const [parsedUsers, setParsedUsers] = useState([]);

  const [selectedTreatment, setSelectedTreatment] = useState<number | null>(null);
  const [timelineStart, setTimelineStart] = useState<Date | null>(null);
  const [timelineEnd, setTimelineEnd] = useState<Date | null>(null);
  const [months, setMonths] = useState<string[]>([]);

  const { data: treatmentSlots, error } = useSWR<TreatmentSlot[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`,
    treatmentFetcher
  )
  const uploadToken = "touVpl914yKWLPB1bzBYRkF"
  // console.log("user in TreatmentTimeline", user)
  // Toggle slot and fetch messages if not already loaded
  const toggleSlot = (id: number) => {
    if (openSlot === id) {
      setOpenSlot(null); // Collapse if already open
    } else {
      setOpenSlot(id);
      if (!messages[id]) {
        fetchMessages(id); // Fetch messages if not already fetched
      }
    }
  };
  // Fetch comments when a treatment slot is opened
  const fetchMessages = async (treatmentId: number) => {
    setIsLoadingMessages(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/comment/${caseId}/${treatmentId}`,
        { withCredentials: true }
      );
      // console.log("res:", res);
  
      const data = res.data; // Axios automatically parses JSON
      // console.log("comments:", data);
  
      setMessages((prev) => ({
        ...prev,
        [treatmentId]: Object.values(data).map((msg: any) => ({
          ...msg,
          id: Number(msg.id),
          case_id: Number(msg.case_id),
          treatment_id: Number(msg.treatment_id),
          user_id: Number(msg.user_id),
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  const getCurrentTime = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/current-time`);
      return new Date(res.data.currentTime);
    } catch (error) {
      console.error('Error fetching current time:', error);
      throw error;
    }
  };
  // updates the treatment slot everytime you open (check current date if it's included then that slot becomes in progress)
  const checkAndUpdateTreatmentStatus = async (treatmentSlots: TreatmentSlot[]) => {
    // Simulate the current date as 14 days from now
    const currentDate =  await getCurrentTime();
    console.log("currentDate:", currentDate)
    // currentDate.setDate(currentDate.getDate() + 14); // Add 14 days to the current date
    // currentDate.setDate(currentDate.getDate() + 28); // Add 28 days to the current date
    // currentDate.setDate(currentDate.getDate() + 42); // Add 42 days to the current date
    // currentDate.setDate(currentDate.getDate() + 56); // Add 56 days to the current date
    // currentDate.setDate(currentDate.getDate() + 70); // Add 70 days to the current date

    // console.log(`Simulated current date: ${currentDate.toISOString()}`);
  
    // Sort slots by start_date to ensure correct ordering
    const sortedSlots = treatmentSlots.sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  
    const updatedSlots = await Promise.all(
      sortedSlots.map(async (slot, index) => {
        const startDate = new Date(slot.start_date);
        const endDate = new Date(new Date(slot.end_date).getTime()); // Subtract 1 hour
        // console.log(`Simulated startDate ${index}: ${startDate.toISOString()}`);
        // console.log(`Simulated startDate ${index}: ${startDate.toLocaleDateString()}`);
        // console.log(`Simulated endDate local time ${index}: ${endDate.toISOString()}`);
        // console.log(`Simulated endDate local time ${index}: ${endDate.toLocaleDateString()} \n`);

        // Check if the simulated date is within this slot's start and end dates
        if (currentDate >= startDate && currentDate <= endDate) {
          // Check the previous slot
          const previousSlot = sortedSlots[index - 1];
          if (previousSlot && previousSlot.status === 'in_progress') {
            try {
              // Update previous slot status to overdue
              await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/treatments/${previousSlot.id}/updateTreatmentSlotStatus`,
                { status: 'overdue' },
                { withCredentials: true }
              );
              previousSlot.status = 'overdue'; // Update locally
            } catch (error) {
              console.error(`Error updating slot ${previousSlot.id} to overdue:`, error);
            }
          }
  
          // Update the current slot's status to in_progress
          if (slot.status !== 'in_progress') {
            try {
              await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/treatments/${slot.id}/updateTreatmentSlotStatus`,
                { status: 'in_progress' },
                { withCredentials: true }
              );
              slot.status = 'in_progress'; // Update locally
            } catch (error) {
              console.error(`Error updating slot ${slot.id} to in_progress:`, error);
            }
          }
        }
  
        return slot; // Return the updated slot
      })
    );
  
    return updatedSlots;
  };
  
  

  const fetchVideoDetails =  async (videoId: string): Promise<Video | null> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/treatments/videoObj/${videoId}`, {withCredentials: true})
      const videoDetails = response.data

      return {
        id: videoDetails.videoId,
        thumbnail: videoDetails.assets.thumbnail,
        iframe: videoDetails.assets.iframe,
      }
    } catch (error) {
      console.error(`Error fetching video details for ID ${videoId}:`, error)
      return null
    }
  }

  const loadCompletedTreatmentVideos = async (
    slotId: number,
    links: { outer: string | null, horizontal: string | null, vertical: string | null },
    isFinalized: boolean
  ) => {
    const videoData = { outer: null, horizontal: null, vertical: null, finalized:isFinalized }
    console.log("parsedUsers in treatment timeline: ", parsedUsers)
    for (const [type, link] of Object.entries(links)) {
      if (link) {
        const videoDetails = await fetchVideoDetails(link)
        if (videoDetails) {
          videoData[type] = videoDetails
        }
      }
    }

    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        ...videoData,
      },
    }))
    console.log("loadCompletedTreatments treatmentVideos: \n",treatmentVideos)
  }
  useEffect(() => {
    const fetchParsedUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/user-names/${caseId}`,
          { withCredentials: true }
        );
        console.log("response:", response);
        const users = response.data.parsedUsers.map((user) => ({
          ...user,
          id: Number(user.id), // Ensure IDs are numbers
        }));
        setParsedUsers(users);
      } catch (error) {
        console.error("Error fetching user names:", error);
      }
    };
  
    fetchParsedUsers();
  
    const updateTreatmentStatuses = async (slots: TreatmentSlot[]) => {
      try {
        const updatedSlots = await checkAndUpdateTreatmentStatus(slots);
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`,
          updatedSlots,
          false // Do not revalidate immediately
        );
        console.log("updatedSlots:", updatedSlots);
        return updatedSlots;
      } catch (error) {
        console.error("Error updating treatment statuses:", error);
        throw error;
      }
    };
    const loadVideosForSlots = async (slots: TreatmentSlot[]) => {
      const videosToLoad = slots.filter(
        (slot) =>
          !treatmentVideos[slot.id] &&
          (slot.status === "completed" ||
            slot.status === "in_progress" ||
            slot.status === "overdue")
      );

      try {
        await Promise.all(
          videosToLoad.map(async (slot) => {
            await loadCompletedTreatmentVideos(
              slot.id,
              {
                outer: slot.video_outer_link,
                horizontal: slot.video_horizontal_link,
                vertical: slot.video_vertical_link,
              },
              slot.finalized
            );
          })
        );
      } catch (error) {
        console.error("Error loading videos for slots:", error);
        throw error;
      }
    };
  
    const loadTreatmentSlots = async () => {
      if (!treatmentSlots || videosLoaded) return;
  
      try {
        setIsLoading(true); // Set loading state to true before processing
  
        const updatedSlots = await updateTreatmentStatuses(treatmentSlots);
        console.log("updatedSlots:", updatedSlots);
  
        await loadVideosForSlots(updatedSlots);
        setVideosLoaded(true);
      } catch (error) {
        console.error("Error loading treatment slots:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadTreatmentSlots();
  
    if (!treatmentSlots || treatmentSlots.length === 0) return;

    const dates = treatmentSlots.map((t) => new Date(t.start_date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    setTimelineStart(minDate);
    setTimelineEnd(maxDate);

    // Generate months between start and end dates
    const monthsArray = [];
    let current = new Date(minDate);
    while (current <= maxDate) {
      monthsArray.push(current.toLocaleString("default", { month: "short", year: "numeric" }));
      current.setMonth(current.getMonth() + 1);
    }
    setMonths(monthsArray);
  }, [treatmentSlots, videosLoaded, treatmentVideos]);
  
  // Function to calculate relative position on timeline
  const getPositionPercentage = (date: string) => {
    if (!timelineStart || !timelineEnd) return 0;

    const treatmentDate = new Date(date).getTime();
    const start = timelineStart.getTime();
    const end = timelineEnd.getTime();

    if (end === start) return 0; // Avoid division by zero

    return ((treatmentDate - start) / (end - start)) * 100;
  };
    

  const handleVideoUpload = (slotId: number, videoId: string, thumbnail: string, type: 'outer' | 'horizontal' | 'vertical') => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        [type]: { id: videoId, thumbnail },
        finalized: prev[slotId]?.finalized ?? false,
      },
    }))
    console.log("handleVideoUpload, treatmentVideos",treatmentVideos)
  }

  const handleVideoRemove =(slotId: number, type: 'outer' | 'horizontal' | 'vertical') => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], [type]: null },
    }))
    console.log("handleVideoRemove treatmentVideos", treatmentVideos)
  }

  const allSlotsFilled = (slotId:number) => {
    const slotVideos = treatmentVideos[slotId]
    return slotVideos?.outer && slotVideos?.horizontal && slotVideos?.vertical
  }

  const handleFinalize = async (slotId: number) => {
    const slot = treatmentSlots.find((slot) => slot.id === slotId);
    if (!slot) return;
  
    const videoLinks = {
      horizontal: treatmentVideos[slotId]?.horizontal?.id || null,
      outer: treatmentVideos[slotId]?.outer?.id || null,
      vertical: treatmentVideos[slotId]?.vertical?.id || null,
    };
  
    try {
      // Update the backend with finalized status
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${slotId}/finalize`,
        {
          finalized: true,
        },
        { withCredentials: true } // Include session cookies
      );
  
      // Update the local state
      setTreatmentVideos((prev) => ({
        ...prev,
        [slotId]: {
          ...prev[slotId],
          finalized: true,
        },
      }));
  
      // Revalidate SWR to refresh the finalized status
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`, async () => {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`,
          { withCredentials: true } // Ensure session cookies are sent
        );
        return response.data.data;
      });
  
      toast.success(
        <span className="font-semibold">Votre traitement est finalisé.</span>
      );
      console.log(slot);
    } catch (error) {
      console.error('Error finalizing treatment:', error);
      toast.error(
        <span className="font-semibold">
          Une erreur s'est produite lors de la finalisation du traitement.
        </span>
      );
    }
  };
  
  const handleFinalizedChange = (slotId: number, finalized: boolean) => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        finalized,
      },
    }));
    console.log("handleFinalizedChange: ",treatmentVideos)
  };

  const handleCompleteTreatment = async (slotId: number) => {
    const slot = treatmentSlots.find((slot) => slot.id === slotId);
    console.log("slot in handleCompletedTreatment: ",slot)
    if (!slot) return;

    try {
      // Update the backend with the new status
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${slotId}/updateTreatmentSlotStatus`,
        {
          status: 'completed', // Update the status to 'completed'
        },
        { withCredentials: true } // Include session cookies
      );
  
      // Update the local state to reflect the new status
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`, async () => {
        const updatedSlots = treatmentSlots.map((treatmentSlot) =>
          treatmentSlot.id === slotId ? { ...treatmentSlot, status: 'completed' } : treatmentSlot
        );
        return updatedSlots;
      });
  
      toast.success(
        <span className="font-semibold">
          Le traitement a été marqué comme terminé.
        </span>
      );
      console.log(`Treatment slot ${slotId} updated to completed.`);
    } catch (error) {
      console.error('Error updating treatment status:', error);
      toast.error(
        <span className="font-semibold">
          Une erreur s'est produite lors de la mise à jour du traitement.
        </span>
      );
    }
  };
  

  if (error) return <div>Erreur lors du chargement des créneaux de traitement</div>
  if (!treatmentSlots || isLoading) {
    // Show a loading skeleton or spinner
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader variant="spinner" />
      </div>
    );
  }  return (
    <>
      {/* MONTH LABELS */}
      <div className="relative flex justify-between text-gray-600 text-sm font-semibold">
        {months.map((month, index) => (
          <div key={index} className="w-24 text-center">
            {month}
          </div>
        ))}
      </div>
    {/* TIMELINE BAR */}
    <div className="relative flex items-center w-full border-b pb-4">
      <div className="relative w-full h-1 bg-gray-300">
        {treatmentSlots.map((treatment) => (
          <div
            key={treatment.id}
            className={`absolute w-6 h-6 -top-2.5 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              selectedTreatment === treatment.id ? 'bg-blue-500' : statusColors[treatment.status]
            }`}
            style={{ left: `${getPositionPercentage(treatment.start_date)}%`, transform: 'translateX(-50%)' }}
            onClick={() => setSelectedTreatment(treatment.id === selectedTreatment ? null : treatment.id)}
          >
            {treatment.status === 'completed' ? <Check className="text-white w-4 h-4" /> : <Circle className="text-white w-4 h-4" />}
          </div>
        ))}
      </div>
    </div>
          {/* EXPANDED TREATMENT DETAILS */}
          {selectedTreatment && (
        <div className="p-4 bg-white rounded-lg shadow-md">
          {treatmentSlots.map(
            (slot) =>
              slot.id === selectedTreatment && (
                <div key={slot.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{`Traitement ${slot.treatment_number}`}</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTreatment(null)}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Status:</strong> {statusTranslation[slot.status]}
                  </p>

                  {/* CONDITIONAL RENDERING BASED ON STATUS */}
                  {slot.status === 'pending' && <p className="text-gray-500 mt-2">Ce traitement est en attente.</p>}

                  {slot.status === 'in_progress' && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Ajouter des vidéos :</h4>
                      <VideoUploadDisplay
                        uploadToken={uploadToken}
                        initialVideos={treatmentVideos[slot.id] || { outer: null, horizontal: null, vertical: null }}
                        onVideoUpload={(videoId, thumbnail, type) => handleVideoUpload(slot.id, videoId, thumbnail, type)}
                        onVideoRemove={(type) => handleVideoRemove(slot.id, type)}
                        finalized={treatmentVideos[slot.id]?.finalized || false}
                        treatmentSlotId={slot.id}
                        caseId={slot.case_id}
                        treatmentNumber={slot.treatment_number}
                        onFinalizedChange={handleFinalizedChange}
                        user={user}  />
                    </div>
                  )}

                  {slot.status === 'completed' && <p className="text-green-500 font-semibold mt-2">Traitement terminé.</p>}
                </div>
              )
          )}
        </div>
      )}
    <div className={cn('relative', className)}>
        {treatmentSlots.map((slot, index) => (
          <Collapsible key={slot.id} open={openSlot === slot.id} onOpenChange={() => toggleSlot(slot.id)}>
            <div className="relative mb-8 pl-10">
              {index !== treatmentSlots.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
              )}

              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
                <div className="relative h-5 w-5">
                  <div className={cn(
                    'absolute inset-0 rounded-full',
                    slot.status === 'completed' ? 'bg-green-500' : slot.status === 'in_progress' ? 'bg-yellow-500' : slot.status === 'overdue' ? 'bg-red-500' : 'bg-gray-500'
                  )}>
                    {slot.status === 'completed' ? (
                      <Check className="h-4 w-4 text-white translate-x-0.5 translate-y-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-white translate-x-0.5 translate-y-0.5" />
                    )}
                  </div>
                </div>
              </div>

              <CollapsibleTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between">
                  <h3 className={cn('text-base font-semibold', statusColors[slot.status])}>
                    Traitement {slot.treatment_number}
                  </h3>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    {openSlot === slot.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CollapsibleTrigger>

              <div className="mt-1 text-sm text-gray-500">
                {new Date(slot.start_date).toLocaleDateString()} -
                {new Date(new Date(slot.end_date).getTime() - 1).toLocaleDateString()}
              </div>
              <CollapsibleContent className="mt-4 space-y-4">
                <div className="text-sm">
                  <p>
                    <strong>Status:</strong> {statusTranslation[slot.status] || slot.status}
                  </p>
                </div>
                {/* PENDING TREATMENT */}
                {slot.status === 'pending' && slot.finalized === false && (
                  <p className="text-gray-500">Ce traitement est en attente. Aucune vidéo disponible pour le moment.</p>
                )}
                {/* QR Code Verification for in_progress or overdue */}
                {(slot.status === 'in_progress' || slot.status === 'overdue') && !slot.verified && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Verification du QR Code</h4>
                    <p className="text-gray-500">Veuillez vérifier l'emplacement de traitement en entrant le code QR.</p>
                    <form
                      className="space-y-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const qrCode = formData.get("qr_code") as string;

                        if (!qrCode) {
                          alert("Please enter the QR code.");
                          return;
                        }

                        try {
                          const res = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/treatments/verifyTreatmentSlot/${slot.id}`,
                            { qr_code: qrCode },
                            { withCredentials: true }
                          );
                          toast.success(
                            <span className="font-semibold">
                              Code QR vérifié.
                            </span>
                          );
                          // alert(res.data.message); // Show success message
                          mutate(
                            `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`
                          );
                        } catch (error: any) {
                          toast.error(
                            <span className="font-semibold">
                              QR code est incorrect
                            </span>
                          );
                          console.error("QR code verification failed:", error);
                          // alert(error.response?.data?.message || "Verification failed. Please try again.");
                        }
                      } }
                    >
                      <Input
                        type="text"
                        name="qr_code"
                        placeholder="Enter QR code"
                        className="block w-full px-4 py-2 " />
                      <Button
                        type="submit"
                        className="px-4 py-2 text-white"
                      >
                        Vérifier le code QR.
                      </Button>
                    </form>
                  </div>
                )}
                {/* COMPLETED TREATMENT */}
                {/* Video Upload or Display Section */}
                {(slot.status === 'completed') && treatmentVideos[slot.id] && (
                  <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
                      {selectedVideo ? (
                        <iframe
                          src={selectedVideo}
                          style={{ width: '100%', height: '100%' }}
                          frameBorder="0"
                          allowFullScreen />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                          Aucune vidéo sélectionnée.
                        </div>
                      )}
                    </div>

                    {/* Video Thumbnails */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {(['outer', 'horizontal', 'vertical'] as const).map((type) => (
                        treatmentVideos[slot.id][type] && (
                          <div key={type} className="flex flex-col items-center space-y-1">
                            <div className="w-full flex justify-start">
                              <div
                                className={cn(
                                  'text-xs font-semibold px-2 py-1 rounded',
                                  videoStatusColors[slot[`video_${type}_status`]]
                                )}
                              >
                                {`${slot[`video_${type}_status`].charAt(0).toUpperCase() + slot[`video_${type}_status`].slice(1)}`}
                              </div>
                            </div>
                            <div
                              className="aspect-video cursor-pointer relative bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                              onClick={() => {
                                const iframeString = treatmentVideos[slot.id][type]!.iframe;
                                const srcMatch = iframeString.match(/src="([^"]+)"/);
                                if (srcMatch && srcMatch[1]) {
                                  setSelectedVideo(srcMatch[1]);
                                }
                              } }
                            >
                              <Image
                                src={treatmentVideos[slot.id][type]!.thumbnail}
                                alt={`${type} video thumbnail`}
                                className="w-full h-full object-cover"
                                width={300}
                                height={200} />
                              <span className="absolute bottom-2 left-2 text-white font-semibold bg-black bg-opacity-50 rounded px-2 py-1">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                              {selectedVideo === treatmentVideos[slot.id][type]!.iframe && (
                                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg" />
                              )}
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-8 mt-8">
                      <h4 className="font-semibold">Commentaires :</h4>
                      {isLoadingMessages ? (
                        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                          {/* Skeleton Loader */}
                          <div className="space-y-4">
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                      ) : (
                        <MessageDetails
                          user={user}
                          treatmentId={slot.id}
                          treatmentStatus={slot.status}
                          caseId={slot.case_id}
                          messages={messages[slot.id] || []}
                          setMessages={(newMessages) => {
                            setMessages((prevMessages) => ({
                              ...prevMessages,
                              [slot.id]: newMessages,
                            }));
                          } } />
                      )}
                    </div>
                  </div>
                )}

                {/* IN PROGRESS TREATMENT */}
                {slot.status === 'in_progress' && slot.verified && (
                  <><div className="space-y-4">
                    <h4 className="font-semibold">Ajouter des vidéos :</h4>
                    <VideoUploadDisplay
                      uploadToken={uploadToken}
                      initialVideos={treatmentVideos[slot.id] || { outer: null, horizontal: null, vertical: null }}
                      onVideoUpload={(videoId, thumbnail, type) => handleVideoUpload(slot.id, videoId, thumbnail, type)}
                      onVideoRemove={(type) => handleVideoRemove(slot.id, type)}
                      finalized={treatmentVideos[slot.id]?.finalized || false}
                      treatmentSlotId={slot.id}
                      caseId={slot.case_id}
                      treatmentNumber={slot.treatment_number}
                      onFinalizedChange={handleFinalizedChange}
                      user={user} />
                    <div className="flex justify-between space-x-4">
                      {user.role == 4 && (<Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFinalize(slot.id)}
                        disabled={!allSlotsFilled(slot.id) || treatmentVideos[slot.id]?.finalized}
                      >
                        Finaliser
                      </Button>)}
                      {user.role == 3 && (<Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteTreatment(slot.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Marquer comme terminé.
                      </Button>)}
                    </div>
                  </div>
                    {/* Comments Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Commentaires :</h4>

                      {isLoadingMessages ? (
                        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                          {/* Your Skeleton Component */}
                          <div className="space-y-4">
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                      ) : (
                        <MessageDetails
                          user={user}
                          treatmentId={slot.id}
                          caseId={slot.case_id}
                          messages={messages[slot.id] || []}
                          setMessages={(newMessages) => {
                            setMessages((prevMessages) => ({
                              ...prevMessages,
                              [slot.id]: newMessages,
                            }));
                          } } />
                      )}


                      {/* Skeleton Loader */}
                      {isLoading && (
                        <div className="flex items-start space-x-4 animate-pulse">
                          <div className="rounded-full bg-gray-200 w-8 h-8" />
                          <div className="rounded-lg bg-gray-200 px-4 py-2 w-1/4" />
                        </div>
                      )}

                    </div></>
                )}

                {/* TREATMENT OVERDUE */}
                {slot.status === 'overdue' && slot.verified && (
                  <><div className="space-y-4">
                    <h4 className="font-semibold">Ajouter des vidéos :</h4>
                    <VideoUploadDisplay
                      uploadToken={uploadToken}
                      initialVideos={treatmentVideos[slot.id] || { outer: null, horizontal: null, vertical: null }}
                      onVideoUpload={(videoId, thumbnail, type) => handleVideoUpload(slot.id, videoId, thumbnail, type)}
                      onVideoRemove={(type) => handleVideoRemove(slot.id, type)}
                      finalized={treatmentVideos[slot.id]?.finalized || false}
                      treatmentSlotId={slot.id}
                      caseId={slot.case_id}
                      treatmentNumber={slot.treatment_number}
                      onFinalizedChange={handleFinalizedChange}
                      user={user} />
                    <div className="flex justify-between space-x-4">
                      {user.role == 4 && (<Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFinalize(slot.id)}
                        disabled={!allSlotsFilled(slot.id) || treatmentVideos[slot.id]?.finalized}
                      >
                        Finaliser
                      </Button>)}
                      {user.role == 3 && (<Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteTreatment(slot.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Marquer comme terminé.
                      </Button>)}
                    </div>
                  </div>
                    {/* Comments Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Commentaires :</h4>

                      {isLoadingMessages ? (
                        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                          {/* Your Skeleton Component */}
                          <div className="space-y-4">
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                      ) : (
                        <MessageDetails
                          user={user}
                          treatmentId={slot.id}
                          caseId={slot.case_id}
                          messages={messages[slot.id] || []}
                          setMessages={(newMessages) => {
                            setMessages((prevMessages) => ({
                              ...prevMessages,
                              [slot.id]: newMessages,
                            }));
                          } } />
                      )}


                      {/* Skeleton Loader */}
                      {isLoading && (
                        <div className="flex items-start space-x-4 animate-pulse">
                          <div className="rounded-full bg-gray-200 w-8 h-8" />
                          <div className="rounded-lg bg-gray-200 px-4 py-2 w-1/4" />
                        </div>
                      )}
                    </div></>
                )}

              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div></>
  );
  

}
