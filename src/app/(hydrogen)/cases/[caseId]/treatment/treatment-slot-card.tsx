// components/treatment-slot-card.tsx
import React from 'react';
import { Button, Input, Loader, Textarea } from 'rizzui';
import { ChevronDown, ChevronUp, Check, Circle, RotateCcw, X, Play, Maximize2, Minimize2, Upload } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import VideoUploadDisplay from './video-upload-display';
import MessageDetails from '@/app/shared/support/inbox/message-details-comments';
import { CommentSkeleton } from './skeletonComment';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

// Import constants and types from shared files
import { statusColors, statusTranslation, videoStatusColors } from '@/utils/treatment-constants';
import { Video, TreatmentSlot, VideoData, UserAdapted as User } from '@/types/index';


const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

interface TreatmentSlotCardProps {
  slot: TreatmentSlot;
  user: User;
  uploadToken: string;
  treatmentVideos: { [key: number]: VideoData };
  setTreatmentVideos: React.Dispatch<React.SetStateAction<{ [key: number]: VideoData }>>;
  handleFinalizedChange: (slotId: number, finalized: boolean) => void;
  handleCompleteTreatment: (slotId: number) => void;
  openTreatments: number[];
  toggleSlot: (id: number) => void;
  viewMode: 'vertical' | 'horizontal';
  caseId: string;
  messages: { [key: number]: any[] };
  isLoadingMessages: boolean;
  setMessages: React.Dispatch<React.SetStateAction<{ [key: number]: any[] }>>;
  selectedVideo: string | null;
  setSelectedVideo: React.Dispatch<React.SetStateAction<string | null>>;
}

const AdminActionSection = ({ onComplete, id }: { onComplete: (id: number) => void; id: number }) => (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h4 className="font-medium mb-3 text-blue-800">Actions administrateur/médecin</h4>
    <Button variant="solid" className="bg-green-500 hover:bg-green-600 text-white w-full" size="md" onClick={() => onComplete(id)}>
      <Check className="mr-2 h-5 w-5" />
      Marquer comme terminé
    </Button>
  </div>
);

export function TreatmentSlotCard({
  slot,
  user,
  uploadToken,
  treatmentVideos,
  setTreatmentVideos,
  handleFinalizedChange,
  handleCompleteTreatment,
  openTreatments,
  toggleSlot,
  viewMode,
  caseId,
  messages,
  isLoadingMessages,
  setMessages,
  selectedVideo,
  setSelectedVideo,
}: TreatmentSlotCardProps) {
  const handleVideoUpload = (slotId: number, videoId: string, thumbnail: string, type: 'with_aligners' | 'without_aligners') => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        [type]: { id: videoId, thumbnail },
        finalized: prev[slotId]?.finalized ?? false,
      },
    }));
  };

  const handleVideoRemove = (slotId: number, type: 'with_aligners' | 'without_aligners') => {
    setTreatmentVideos((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], [type]: null },
    }));
  };

  const allSlotsFilled = (slotId: number) => {
    const slotVideos = treatmentVideos[slotId];
    return slotVideos?.with_aligners && slotVideos?.without_aligners;
  };

  const handleFinalize = async (slotId: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${slotId}/finalize`,
        { finalized: true },
        { withCredentials: true }
      );
      setTreatmentVideos((prev) => ({
        ...prev,
        [slotId]: { ...prev[slotId], finalized: true },
      }));
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`);
      toast.success(<span className="font-semibold">Votre traitement est finalisé.</span>);
    } catch (error) {
      console.error('Error finalizing treatment:', error);
      toast.error(<span className="font-semibold">Une erreur s'est produite lors de la finalisation du traitement.</span>);
    }
  };

  const handleQrCodeVerification = async (qrCode: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/verifyTreatmentSlot/${slot.id}`,
        { qr_code: qrCode },
        { withCredentials: true }
      );
      toast.success(<span className="font-semibold">Code QR vérifié.</span>);
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/treatments/cases/${caseId}`);
    } catch (error: any) {
      toast.error(<span className="font-semibold">QR code est incorrect</span>);
      console.error('QR code verification failed:', error);
    }
  };

  const getUserForVideoDisplay = (userData: { id: number; email: string; role: string | number }) => {
    let roleId;
    if (typeof userData.role === 'string') {
      switch (userData.role) {
        case 'admin': roleId = 1; break;
        case 'coordinator': roleId = 2; break;
        case 'doctor': roleId = 3; break;
        case 'patient': roleId = 4; break;
        default: roleId = typeof userData.role === 'number' ? userData.role : 0;
      }
    } else {
      roleId = userData.role;
    }
    return {
      id: userData.id,
      email: userData.email,
      roleId: roleId,
      firstName: '',
      lastName: '',
      role: roleId,
    };
  };

  const commentsSection = (
    <div className="space-y-4">
      <h4 className="font-semibold">Commentaires :</h4>
      {isLoadingMessages ? (
        <CommentSkeleton length={3} />
      ) : (
        <MessageDetails
          user={getUserForVideoDisplay(user)}
          treatmentId={slot.id}
          caseId={slot.case_id}
          messages={messages[slot.id] || []}
          compact={String(viewMode) === 'horizontal'}
          setMessages={(newMessages) => {
            setMessages((prevMessages) => ({
              ...prevMessages,
              [slot.id]: newMessages,
            }));
          }}
          treatmentStatus={slot.status}
        />
      )}
    </div>
  );

  const renderContent = () => {
    switch (slot.status) {
      case 'pending':
        return <p className="text-gray-500">Ce traitement est en attente. Aucune vidéo disponible pour le moment.</p>;
      case 'in_progress':
      case 'overdue':
        return (
          <>
            {user?.role === ROLES.PATIENT && !slot.verified && (
              <div className="space-y-4">
                <h4 className="font-semibold">Verification du QR Code</h4>
                <p className="text-gray-500">Veuillez vérifier l'emplacement de traitement en entrant le code QR.</p>
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const qrCode = formData.get('qr_code') as string;
                    if (!qrCode) {
                      alert('Please enter the QR code.');
                      return;
                    }
                    handleQrCodeVerification(qrCode);
                  }}
                >
                  <Input type="text" name="qr_code" placeholder="Enter QR code" className="block w-full px-4 py-2" />
                  <Button type="submit" className="px-4 py-2 text-white">
                    Vérifier le code QR.
                  </Button>
                </form>
              </div>
            )}
            {(user?.role === ROLES.ADMIN || user?.role === ROLES.COORDINATOR || user?.role === ROLES.DOCTOR) && !slot.verified && (
              <div className="space-y-4">
                <h4 className="font-medium">Verification du QR Code</h4>
                <p className="text-gray-500">En attente du scan du QR code par le patient.</p>
              </div>
            )}

            {slot.verified && (
              <div className="space-y-4">
                <h4 className="font-semibold">Ajouter des vidéos :</h4>
                <VideoUploadDisplay
                  uploadToken={uploadToken}
                  initialVideos={treatmentVideos[slot.id] || { with_aligners: null, without_aligners: null }}
                  onVideoUpload={(videoId, thumbnail, type) => handleVideoUpload(slot.id, videoId, thumbnail, type)}
                  onVideoRemove={(type) => handleVideoRemove(slot.id, type)}
                  finalized={treatmentVideos[slot.id]?.finalized || false}
                  treatmentSlotId={slot.id}
                  caseId={slot.case_id}
                  treatmentNumber={slot.treatment_number}
                  onFinalizedChange={handleFinalizedChange}
                  compact={String(viewMode) === 'horizontal'}
                  user={getUserForVideoDisplay(user)}
                />

                {(user?.role === ROLES.ADMIN || user?.role === ROLES.COORDINATOR || user?.role === ROLES.DOCTOR) && (
                  <AdminActionSection onComplete={handleCompleteTreatment} id={slot.id} />
                )}

                {user?.role === ROLES.PATIENT && (
                  <div className="flex justify-between space-x-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFinalize(slot.id)}
                      disabled={!allSlotsFilled(slot.id) || treatmentVideos[slot.id]?.finalized}
                      className={treatmentVideos[slot.id]?.finalized ? 'opacity-50' : ''}
                    >
                      {treatmentVideos[slot.id]?.finalized ? 'Déjà finalisé' : 'Finaliser'}
                    </Button>
                  </div>
                )}
                {commentsSection}
              </div>
            )}
          </>
        );
      case 'completed':
        return (
          <div className="space-y-4">
            <p className="text-green-500 font-semibold mt-2">Traitement terminé.</p>
            {treatmentVideos[slot.id] && (
              <>
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  {/* MAIN VIDEO PLAYER */}
                  {selectedVideo ? (
                    <iframe src={selectedVideo} style={{ width: '100%', height: '100%' }} frameBorder="0" allowFullScreen />
                  ) : (
                    treatmentVideos[slot.id]?.with_aligners?.iframe ? (
                      <iframe
                        src={
                          treatmentVideos[slot.id].with_aligners.iframe.match(/src="([^"]+)"/)?.[1] ||
                          treatmentVideos[slot.id].with_aligners.iframe
                        }
                        style={{ width: '100%', height: '100%' }}
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : treatmentVideos[slot.id]?.without_aligners?.iframe ? (
                      <iframe
                        src={
                          treatmentVideos[slot.id]?.without_aligners?.iframe.match(/src="([^"]+)"/)?.[1] ||
                          treatmentVideos[slot.id]?.without_aligners?.iframe
                        }
                        style={{ width: '100%', height: '100%' }}
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                        Aucune vidéo sélectionnée.
                      </div>
                    )
                  )}
                </div>

                {/* Refined Video Thumbnail Display */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {(['with_aligners', 'without_aligners'] as const).map((type) => {
                    const currentVideoData = treatmentVideos[slot.id]?.[type];
                    if (currentVideoData) {
                      const thumbVideoUrl = currentVideoData.iframe.match(/src="([^"]+)"/)?.[1] || currentVideoData.iframe;
                      const isSelected = selectedVideo === thumbVideoUrl;

                      return (
                        <div
                          key={type}
                          className={cn(
                            "relative aspect-video cursor-pointer rounded-lg overflow-hidden transition-all duration-200",
                            "group", // Enable group-hover effects
                            "border-2", // Add a border for selection
                            isSelected
                              ? "border-blue-500 shadow-lg" // Blue border for selected
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md" // Subtle border for unselected, blue on hover
                          )}
                          onClick={() => setSelectedVideo(thumbVideoUrl)}
                        >
                          <Image
                            src={currentVideoData.thumbnail}
                            alt={`${type} video thumbnail`}
                            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                            width={300}
                            height={200}
                          />
                          {/* Overlay to indicate playability/selection */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Play className="h-8 w-8 text-white" />
                          </div>

                          <span className="absolute bottom-2 left-2 text-white font-semibold bg-black bg-opacity-60 rounded px-2 py-1 text-sm">
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                          </span>

                          {/* REMOVED VIDEO STATUS BADGE WHEN TREATMENT IS COMPLETED */}
                          {slot.status !== 'completed' && slot[`video_${type}_status`] && (
                              <div className={cn(
                                  'absolute top-2 right-2 px-2 py-1 text-white text-xs font-semibold rounded-md',
                                  slot[`video_${type}_status`] === 'approved' && 'bg-green-600',
                                  slot[`video_${type}_status`] === 'pending' && 'bg-yellow-600',
                                  slot[`video_${type}_status`] === 'rejected' && 'bg-red-600'
                              )}>
                                  {slot[`video_${type}_status`].charAt(0).toUpperCase() + slot[`video_${type}_status`].slice(1)}
                              </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </>
            )}
            {commentsSection}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Collapsible key={slot.id} open={openTreatments.includes(slot.id)} onOpenChange={() => toggleSlot(slot.id)}>
      <div className="relative mb-8 pl-10">
        {String(viewMode) === 'vertical' && openTreatments.includes(slot.id) && (
          <div className="absolute left-4 top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
          <div className="relative h-5 w-5">
            <div
              className={cn(
                'absolute inset-0 rounded-full',
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
                <Check className="h-4 w-4 text-white translate-x-0.5 translate-y-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-white translate-x-0.5 translate-y-0.5" />
              )}
            </div>
          </div>
        </div>

        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between">
            <h3 className={cn('text-lg font-semibold', statusColors[slot.status])}>
              Traitement {slot.treatment_number}
            </h3>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              {openTreatments.includes(slot.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>

        <div className="mt-1 text-sm text-gray-500">
          {new Date(slot.start_date).toLocaleDateString()} - {new Date(new Date(slot.end_date).getTime() - 1).toLocaleDateString()}
        </div>
        <CollapsibleContent className="mt-4 space-y-4">{renderContent()}</CollapsibleContent>
      </div>
    </Collapsible>
  );
}