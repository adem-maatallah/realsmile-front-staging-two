// treatment-timeline.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Loader } from 'rizzui';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { Grid2X2, AlignHorizontalJustifyCenter, ChevronUp, Check, Circle } from 'lucide-react';
import { TreatmentSlotCard } from './treatment-slot-card';

// Import constants and types from shared files
import { statusColors, statusTranslation } from '@/utils/treatment-constants';
import { Video, TreatmentSlot, VideoData, UserAdapted } from '@/types/index';

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

interface TreatmentTimelineProps {
  user: { id: number; email: string; role: string };
  className?: string;
}

const treatmentFetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data.data);

export default function TreatmentTimeline({ user, className }: TreatmentTimelineProps) {
  const router = useRouter();
  const { caseId } = useParams();

  const [openTreatments, setOpenTreatments] = useState<number[]>([]);
  const [treatmentVideos, setTreatmentVideos] = useState<{ [key: number]: VideoData }>({});
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<{ [key: number]: any[] }>({});
  const [parsedUsers, setParsedUsers] = useState([]);

  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('horizontal');

  const { data: treatmentSlots, error } = useSWR<TreatmentSlot[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`,
    treatmentFetcher
  );

  if (!user) {
    router.replace('/signin');
    return <div>You must be logged in to view this page.</div>;
  }

  const uploadToken = 'touVpl914yKWLPB1bzBYRkF';

  const toggleSlot = (id: number) => {
    const slotToToggle = treatmentSlots?.find(s => s.id === id);
    if (slotToToggle) {
      console.log("Slot Status on Toggle:", slotToToggle.id, slotToToggle.status);
    }

    if (openTreatments.includes(id)) {
      setOpenTreatments((prev) => prev.filter((treatmentId) => treatmentId !== id));
      if (selectedVideo && slotToToggle &&
          (treatmentVideos[slotToToggle.id]?.with_aligners?.iframe?.includes(selectedVideo) ||
           treatmentVideos[slotToToggle.id]?.without_aligners?.iframe?.includes(selectedVideo))) {
        setSelectedVideo(null);
      }
    } else {
      if (String(viewMode) === 'horizontal' && openTreatments.length >= 2) {
        const newOpenTreatments = [...openTreatments];
        newOpenTreatments.shift();
        setOpenTreatments([...newOpenTreatments, id]);
      } else {
        setOpenTreatments((prev) => [...prev, id]);
      }

      if (!messages[id]) {
        fetchMessages(id);
      }

      if (slotToToggle && !selectedVideo) {
          const videosForSlot = treatmentVideos[slotToToggle.id];
          if (videosForSlot?.with_aligners?.iframe) {
              const srcMatch = videosForSlot.with_aligners.iframe.match(/src="([^"]+)"/);
              setSelectedVideo(srcMatch && srcMatch[1] ? srcMatch[1] : videosForSlot.with_aligners.iframe);
          } else if (videosForSlot?.without_aligners?.iframe) {
              const srcMatch = videosForSlot.without_aligners.iframe.match(/src="([^"]+)"/);
              setSelectedVideo(srcMatch && srcMatch[1] ? srcMatch[1] : videosForSlot.without_aligners.iframe);
          }
      }
    }
  };

  const fetchMessages = async (treatmentId: number) => {
    setIsLoadingMessages(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/treatments/comment/${caseId}/${treatmentId}`, { withCredentials: true });
      const data = res.data;
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

  const fetchVideoDetails = async (videoId: string): Promise<Video | null> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/treatments/videoObj/${videoId}`, { withCredentials: true });
      const videoDetails = response.data;

      return {
        id: videoDetails.videoId,
        thumbnail: videoDetails.assets.thumbnail,
        iframe: videoDetails.assets.iframe,
      };
    } catch (error) {
      console.error(`Error fetching video details for ID ${videoId}:`, error);
      return null;
    }
  };

  const loadCompletedTreatmentVideos = async (
    slotId: number,
    links: { with_aligners: string | null; without_aligners: string | null },
    isFinalized: boolean
  ) => {
    const videoData: VideoData = { with_aligners: null, without_aligners: null, finalized: isFinalized };
    for (const [type, link] of Object.entries(links)) {
      if (link) {
        const videoDetails = await fetchVideoDetails(link);
        if (videoDetails) {
          if (type === 'with_aligners') {
            videoData.with_aligners = videoDetails;
          } else if (type === 'without_aligners') {
            videoData.without_aligners = videoDetails;
          }
        }
      }
    }

    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        ...videoData,
      },
    }));
  };

  useEffect(() => {
    const fetchParsedUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user-names/${caseId}`, { withCredentials: true });
        const users = response.data.parsedUsers.map((u: any) => ({
          ...u,
          id: Number(u.id),
        }));
        setParsedUsers(users);
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };

    fetchParsedUsers();

    const loadVideosForSlots = async (slots: TreatmentSlot[]) => {
      const videosToLoad = slots.filter(
        (slot) => !treatmentVideos[slot.id] && (slot.status === 'completed' || slot.status === 'in_progress' || slot.status === 'overdue')
      );

      try {
        await Promise.all(
          videosToLoad.map(async (slot) => {
            await loadCompletedTreatmentVideos(
              slot.id,
              {
                with_aligners: slot.video_with_aligners_link,
                without_aligners: slot.video_without_aligners_link,
              },
              slot.finalized
            );
          })
        );
      } catch (error) {
        console.error('Error loading videos for slots:', error);
        throw error;
      }
    };

    const loadTreatmentSlotsData = async () => {
      if (!treatmentSlots || videosLoaded) return;

      try {
        setIsLoading(true);
        await loadVideosForSlots(treatmentSlots);
        setVideosLoaded(true);
      } catch (error) {
        console.error('Error loading treatment slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTreatmentSlotsData();
  }, [treatmentSlots, videosLoaded, treatmentVideos, caseId]);

  const handleFinalizedChange = (slotId: number, finalized: boolean) => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        finalized,
      },
    }));
  };

  const handleCompleteTreatment = async (slotId: number) => {
    if (!treatmentSlots) return;

    const slot = treatmentSlots.find((slot) => slot.id === slotId);
    if (!slot) return;

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/treatments/${slot.id}/updateTreatmentSlotStatus`, { status: 'completed' }, { withCredentials: true });
      mutate(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`,
        (currentData: TreatmentSlot[] | undefined) => {
          if (!currentData) return currentData;
          return currentData.map((s) => (s.id === slot.id ? { ...s, status: 'completed' } : s));
        },
        false
      );
      toast.success(<span className="font-semibold">Le traitement a été marqué comme terminé.</span>);
    } catch (error) {
      console.error('Error updating treatment status:', error);
      toast.error(<span className="font-semibold">Une erreur s'est produite lors de la mise à jour du traitement.</span>);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => {
      if (prev === 'horizontal') {
        // When switching to vertical, clear all open treatments except possibly the first one if needed
        // For simplicity, we'll clear all to ensure a clean switch to vertical collapsible view
        setOpenTreatments([]);
        setSelectedVideo(null); // Clear selected video when switching from horizontal to vertical
        return 'vertical';
      }
      // When switching to horizontal, don't change openTreatments immediately, it's handled by specific toggleSlot logic
      return 'horizontal';
    });
  };

  const adaptedUser: UserAdapted = {
    id: user.id,
    email: user.email,
    role: user.role,
    roleId:
      typeof user.role === 'string'
        ? user.role === ROLES.ADMIN
          ? 1
          : user.role === ROLES.COORDINATOR
          ? 2
          : user.role === ROLES.DOCTOR
          ? 3
          : user.role === ROLES.PATIENT
          ? 4
          : 0
        : user.role,
    firstName: '',
    lastName: '',
  };

  if (error) return <div>Erreur lors du chargement des créneaux de traitement</div>;
  if (!treatmentSlots || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader variant="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={toggleViewMode} className="flex items-center gap-2">
          {viewMode === 'vertical' ? (
            <>
              <AlignHorizontalJustifyCenter className="h-4 w-4" />
              Affichage horizontal
            </>
          ) : (
            <>
              <Grid2X2 className="h-4 w-4" />
              Affichage vertical
            </>
          )}
        </Button>
      </div>

      {/* Horizontal timeline layout */}
      {viewMode === 'horizontal' && (
        <div className="space-y-6">
          {/* Timeline overview - collapsed items */}
          <div className="flex flex-wrap gap-2 mb-4">
            {treatmentSlots?.map((slot) => {
              console.log('Horizontal View Slot Status:', slot.id, slot.status);
              return (
                <div
                  key={`timeline-${slot.id}`}
                  className={cn(
                    'cursor-pointer rounded-full p-2 flex items-center gap-2',
                    openTreatments.includes(slot.id) ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200',
                    slot.status === 'completed'
                      ? 'border-2 border-green-500'
                      : slot.status === 'in_progress'
                      ? 'border-2 border-yellow-500'
                      : slot.status === 'overdue'
                      ? 'border-2 border-red-500'
                      : 'border-2 border-gray-300'
                  )}
                  onClick={() => toggleSlot(slot.id)}
                >
                  <div
                    className={cn(
                      'rounded-full h-6 w-6 flex items-center justify-center',
                      slot.status === 'completed'
                        ? 'bg-green-500'
                        : slot.status === 'in_progress'
                        ? 'bg-yellow-500'
                        : slot.status === 'overdue'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    )}
                  >
                    {slot.status === 'completed' ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-white text-xs">{slot.treatment_number}</span>
                    )}
                  </div>
                  <span className="font-medium">T{slot.treatment_number}</span>
                </div>
              );
            })}
          </div>

          {/* Open treatments container - This is where the two-column layout should be applied */}
          <div className={`grid ${openTreatments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {openTreatments.map((treatmentId) => {
              const slot = treatmentSlots.find((s) => s.id === treatmentId);
              if (!slot) return null;

              return (
                // Key here is important for React to efficiently re-render open slots
                <div key={`opened-slot-${treatmentId}`} className="bg-white rounded-lg shadow-lg p-4 border-t-4 border-primary">
                  {/* Removed duplicated header information from here */}
                  {/* This information is now managed by TreatmentSlotCard's internal CollapsibleTrigger */}

                  <TreatmentSlotCard
                    slot={slot}
                    user={adaptedUser}
                    uploadToken={uploadToken}
                    treatmentVideos={treatmentVideos}
                    setTreatmentVideos={setTreatmentVideos}
                    handleFinalizedChange={handleFinalizedChange}
                    handleCompleteTreatment={handleCompleteTreatment}
                    // In horizontal view, TreatmentSlotCard itself needs to manage its open/closed state via props
                    // but the "toggleSlot" action from the main timeline *also* needs to affect it.
                    // The `open` prop of Collapsible in TreatmentSlotCard handles its own internal state.
                    // We can pass `true` to `open` prop of TreatmentSlotCard here, as it's meant to be "open" in this block.
                    openTreatments={openTreatments} // Still pass to allow its internal CollapsibleTrigger to manage
                    toggleSlot={toggleSlot} // Still pass to allow it to close itself and affect parent openTreatments
                    viewMode={viewMode}
                    caseId={String(caseId)}
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                    setMessages={setMessages}
                    selectedVideo={selectedVideo}
                    setSelectedVideo={setSelectedVideo}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Original vertical timeline layout */}
      {viewMode === 'vertical' && (
        <div className={cn('relative', className)}>
          {treatmentSlots.map((slot) => (
            <TreatmentSlotCard
              key={slot.id}
              slot={slot}
              user={adaptedUser}
              uploadToken={uploadToken}
              treatmentVideos={treatmentVideos}
              setTreatmentVideos={setTreatmentVideos}
              handleFinalizedChange={handleFinalizedChange}
              handleCompleteTreatment={handleCompleteTreatment}
              openTreatments={openTreatments} // Pass openTreatments to control Collapsible state
              toggleSlot={toggleSlot} // Pass toggleSlot to allow it to manage its own collapsible
              viewMode={viewMode}
              caseId={String(caseId)}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              setMessages={setMessages}
              selectedVideo={selectedVideo}
              setSelectedVideo={setSelectedVideo}
            />
          ))}
        </div>
      )}
    </>
  );
}