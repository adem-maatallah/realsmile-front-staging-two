'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Play, X, RotateCcw, Loader, Maximize2, Minimize2 } from 'lucide-react'
import ApiVideoPlayer from '@api.video/react-player'
import { Button, Tooltip } from 'rizzui'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Video {
  id: string
  thumbnail: string
  iframe?: string
}

interface VideoUploadDisplayProps {
  uploadToken: string
  initialVideos: { with_aligners: Video | null; without_aligners: Video | null } // Changed
  onVideoUpload: (videoId: string, thumbnail: string, type: 'with_aligners' | 'without_aligners') => void // Changed
  onVideoRemove: (type: 'with_aligners' | 'without_aligners') => void // Changed
  finalized: boolean
  treatmentSlotId: number
  caseId: number
  treatmentNumber: number
  onFinalizedChange: (slotId: number, finalized: boolean) => void
  user: {
    roleId: number,
    id: number,
    email: string,
    role: number
  }
  compact?: boolean
}
const videoTypeMap: Record<string, string> = {
  with_aligners: "Vidéo avec aligners", // Changed
  without_aligners: "Vidéo sans aligners", // Changed
};
const videoTypeShowMap: Record<string, string> = {
  with_aligners: "Avec aligners", // Changed
  without_aligners: "Sans aligners", // Changed
};
const videoUploadMap: Record<string, string> = {
  with_aligners: "Télécharger vidéo avec aligners", // Changed
  without_aligners: "Télécharger vidéo sans aligners", // Changed
};
export default function VideoUploadDisplay({
  uploadToken,
  initialVideos,
  onVideoUpload,
  onVideoRemove,
  finalized,
  treatmentSlotId,
  caseId,
  treatmentNumber,
  onFinalizedChange,
  user,
  compact = false
}: VideoUploadDisplayProps) {
  const [videos, setVideos] = useState<{ with_aligners: Video | null; without_aligners: Video | null }>(initialVideos) // Changed
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<'with_aligners' | 'without_aligners' | null>(null) // Changed
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({
    with_aligners: false, // Changed
    without_aligners: false, // Changed
  })
  const videoGridRef = useRef<HTMLDivElement>(null)
  const [expandedView, setExpandedView] = useState(false);
  console.log("user in videoUploadDisplay: ", user);
  useEffect(() => {
    setVideos(initialVideos)
  }, [initialVideos])

  // Unselect video when clicking anywhere inside the video grid, except on the specific thumbnail
  const handleGridClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    const isThumbnail = target.closest('.video-thumbnail')
    if (!isThumbnail) {
      setSelectedVideo(null)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedType) {
      alert("Please select a video slot (with aligners or without aligners) to upload.") // Changed
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && uploadToken) {
        try {
          const formData = new FormData()
          formData.append('video', file)
          formData.append('title', `case ${caseId} ${selectedType} Video`)
          formData.append('description', `Upload for treatment ${treatmentSlotId} ${selectedType} slot treatment number ${treatmentNumber}`)
          formData.append('type', `${selectedType}`)
          formData.append('treatment_slot',`${treatmentSlotId}`)
          console.log("this is type inside handleFileUpload: ",selectedType)
          console.log("this is slot number inside handleFileUpload: ",treatmentSlotId)
          setLoadingStates((prev) => ({ ...prev, [selectedType]: true }))

          // Upload the video
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/treatments/VideoObj`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true, // Ensures cookies are sent with the request
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total || 0; // Add fallback for total
              const progress = Math.round((progressEvent.loaded * 100) / total);
              setUploadProgress(progress);
            },
          });

          const videoData = response.data.video
          const thumbnailUrl = videoData.assets.thumbnail

          // Set initial placeholder thumbnail
          setVideos((prevVideos) => ({
            ...prevVideos,
            [selectedType]: { id: videoData.videoId, thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj4-lvnjGuSs_h0heSbc9VQhRLSNpwmFlE6w&s' },
          }))

          setUploadProgress(null)
          onVideoUpload(videoData.videoId, thumbnailUrl, selectedType)

          // Poll the video status until it becomes playable
          await pollVideoStatus(videoData.videoId, selectedType, thumbnailUrl)

        } catch (error) {
          console.error('Error uploading video:', error)
          setUploadProgress(null)
          setLoadingStates((prev) => ({ ...prev, [selectedType]: false }))
        }
      }
    }
    input.click()
  }

  // Polling function to check video encoding status
  const pollVideoStatus = async (videoId: string, type: 'with_aligners' | 'without_aligners', initialThumbnailUrl: string) => { // Changed
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/treatments/videoStatus/${videoId}`, {withCredentials:true})
        const videoStatus = response.data

        console.log("videoStatus:", videoStatus)
        // Check if the video is playable and all qualities are fully encoded
        const allEncoded = videoStatus.encoding.qualities.every((quality: any) => quality.status === 'encoded')
        if (videoStatus.encoding.playable && allEncoded) {
          // Use the initial thumbnail from the upload response
          const thumbnailUrl = initialThumbnailUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj4-lvnjGuSs_h0heSbc9VQhRLSNpwmFlE6w&s'

          setVideos((prevVideos) => ({
            ...prevVideos,
            [type]: { id: videoId, thumbnail: thumbnailUrl },
          }))
          setLoadingStates((prev) => ({ ...prev, [type]: false }))
        } else {
          // Retry after a delay if the video is not fully encoded yet
          setTimeout(checkStatus, 2000) // Poll every 3 seconds
        }
      } catch (error) {
        console.error('Error checking video status:', error)
      }
    }

    checkStatus() // Initial check
  }

  const handleRemoveOrRetakeVideo = async (type: 'with_aligners' | 'without_aligners', resetFinalized: boolean = false) => { // Changed
    try {
      // Set loading state for the current type
      setLoadingStates((prev) => ({ ...prev, [type]: true }));

      // Prepare the data to send, including the type of video being removed
      const updateData = {
        id: treatmentSlotId,
        type,
        finalized: resetFinalized, // If resetting finalized, set to false; otherwise, keep the current status
      };

      // Send patch request to update the server-side data
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/treatments/updateFinalizedStatus`, updateData, { withCredentials: true });
      if (videos[type]) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/treatments/deleteVideoObj/${videos[type]!.id}`, { withCredentials: true });
        console.log("videos before delete:", videos[type]!.id);
      }
      // Update the local state
      setVideos((prevVideos) => ({
        ...prevVideos,
        [type]: null, // Remove the video for the specified type
      }));
      console.log("videos after delete:", videos)
      onVideoRemove(type);
      setLoadingStates((prev) => ({ ...prev, [type]: false }));

      if (selectedVideo === videos[type]?.id) {
        setSelectedVideo(null);
      }

      // If resetting finalized, update the finalized state and provide a specific toast message
      if (resetFinalized) {
        onFinalizedChange(treatmentSlotId, false);
        toast.success('Video retake initiated, finalized status reset.');
      } else {
        toast.success(`La ${videoTypeMap[type]} a été supprimée avec succès`);
      }
    } catch (error) {
      console.error('Error removing or retaking video:', error);
      toast.error('Échec de la suppression de la vidéo.');
    }finally {
      // Reset loading state
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Toggle between expanded and compact views
  const toggleExpandView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedView(!expandedView);
  };

  return (
    <div 
      className={`space-y-4 bg-white p-4 rounded-lg shadow-lg ${compact && !expandedView ? 'max-h-[600px] overflow-y-auto' : ''}`} 
      ref={videoGridRef} 
      onClick={handleGridClick}
    >
      {/* Expand/Collapse button for compact mode */}
      {compact && (
        <div className="flex justify-end mb-2">
          <Button 
            variant="text" 
            size="sm" 
            onClick={toggleExpandView}
            className="h-8 w-8 p-1"
          >
            {expandedView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Always show upload buttons for patient (role 4) */}
      {user.roleId === 4 && !finalized && (
        <>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {(['with_aligners', 'without_aligners'] as const).map((type) => ( // Changed
              <Tooltip key={type} content={`Select ${type.replace(/_/g, ' ')} video slot`}> {/* Updated tooltip */}
                <Button
                  variant={selectedType === type ? 'solid' : 'outline'}
                  onClick={() => setSelectedType(type)}
                  disabled={Boolean(videos[type]) || loadingStates[type as keyof typeof loadingStates]}
                  className="hover:scale-105 transition-transform border-yellow-500 bg-white"
                  size="md"
                >
                  {videoTypeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')} {/* Updated button text */}
                </Button>
              </Tooltip>
            ))}
          </div>
          
          <Button
            onClick={handleFileUpload}
            disabled={uploadProgress !== null || !selectedType || Boolean(selectedType && loadingStates[selectedType])}
            className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            size="md"
          >
            {uploadProgress !== null ? (
              <>Téléchargement... {uploadProgress}%</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {selectedType ? 
                  videoUploadMap[selectedType] || `Télécharger une vidéo ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1).replace(/_/g, ' ')}` 
                  : 'Sélectionnez une plage vidéo'}
              </>
            )}
          </Button>
        </>
      )}
      
      {user.roleId === 4 && finalized && (
        <div className="bg-gray-100 p-3 mb-4 rounded-lg text-center">
          <h5 className="text-gray-500 font-normal">
            En attente de l'évaluation du médecin
          </h5>
        </div>
      )}

      <div className={`w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md mt-4 transition-all duration-500 ${
        finalized ? '-translate-y-6' : ''
      } ${compact && !expandedView ? 'max-h-[200px]' : ''}`}>
        {selectedVideo ? (
          <ApiVideoPlayer video={{ id: selectedVideo }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
            Aucune vidéo sélectionnée.
          </div>
        )}
      </div>
  
      <div className={`grid grid-cols-2 gap-2 mt-4 transition-all duration-500 ${finalized ? '-translate-y-6' : ''}`}> {/* Changed to 2 columns */}
        {(['with_aligners', 'without_aligners'] as const).map((type) => ( // Changed
          <div
            key={type}
            className="aspect-video cursor-pointer relative bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow video-thumbnail"
            onClick={(e) => {
              e.stopPropagation(); // Prevent deselect on thumbnail click
              setSelectedVideo(videos[type]?.id ?? null);
            }}
          >
            {videos[type] ? (
              <>
                {loadingStates[type] ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} animate-spin text-gray-400`} />
                  </div>
                ) : (
                  <Image
                    src={videos[type]!.thumbnail}
                    alt={`${type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')} video thumbnail`} // Updated alt text
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity rounded-lg border border-gray-200 shadow-md"
                    width={300}
                    height={200}
                  />
                )}
                <span className={`absolute bottom-2 left-2 text-white font-semibold bg-black bg-opacity-50 rounded px-2 py-1 ${compact ? 'text-xs' : ''}`}>
                  {videoTypeShowMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')} {/* Updated display text */}
                </span>
                {user.roleId === 3 ? ( // Doctor (role 3) always sees the "Retake" button
                  <Button
                    variant="solid"
                    size={compact ? "sm" : "sm"}
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent deselect on retake click
                      handleRemoveOrRetakeVideo(type);
                    }}
                    disabled={loadingStates[type]} // Disable button while loading
                  >
                    {loadingStates[type] ? (
                      <Loader className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin text-gray-400`} />
                    ) : (
                      compact ? <RotateCcw className="h-3 w-3" /> : 'Retake'
                    )}
                  </Button>
                ) : user.roleId === 4 && !finalized ? ( // Patient (role 4) sees "Remove Video" only if !finalized
                  <Button
                    variant="solid"
                    size={compact ? "sm" : "sm"}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-3px transition-opacity duration-500"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent deselect on remove click
                      handleRemoveOrRetakeVideo(type);
                    }}
                    disabled={loadingStates[type]} // Disable button while loading
                  >
                    {loadingStates[type] ? (
                      <Loader className={`${compact ? 'h-3 w-3' : 'h-5 w-5'} animate-spin text-gray-400`} />
                    ) : (
                      <X className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    )}
                  </Button>
                ) : null}

                {selectedVideo === videos[type]?.id && (
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg" />
                )}
              </>
            ) : loadingStates[type] ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} animate-spin text-gray-400`} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Play className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}