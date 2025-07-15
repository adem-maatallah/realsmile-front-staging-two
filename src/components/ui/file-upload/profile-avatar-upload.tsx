'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import UploadIcon from '@/components/shape/upload';
import { FieldError, Loader, Text } from 'rizzui';
import { PiPencilSimple } from 'react-icons/pi';
import cn from '@/utils/class-names';
// REMOVE useSession from next-auth/react if you're not using it elsewhere
// REMOVE signIn from next-auth/react
import { useAuth } from '@/context/AuthContext'; // Make sure this path is correct
import axiosInstance from '@/utils/axiosInstance';

interface ProfileAvatarUploadProps {
  name: string;
  setValue: any; // Assuming this is from react-hook-form
  getValues?: () => any; // Assuming this is from react-hook-form
  className?: string;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
}

export default function ProfileAvatarUpload({
  name,
  setValue,
  getValues,
  className,
  error,
  defaultValue,
  disabled = false,
}: ProfileAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user, mutate: swrMutate } = useAuth(); // Get user and the SWR mutate function from useAuth

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]; // Assuming only one file is uploaded
      const formData = new FormData();
      formData.append('profile_pic', file);

      // Determine the user ID to send: if admin, use explicit userId, otherwise current user's ID
      // This logic should ideally match your backend's `userIdToUpdate` determination
      const userIdToSend = user?.role === 'admin' ? user?.id : user?.id; // Assuming admin can update others, but UI only allows self update for now. Adjust if admin can pick a user.
      if (userIdToSend) {
        formData.append('user_id', String(userIdToSend)); // Ensure it's a string
      } else {
        toast.error('User ID not available for upload.');
        return;
      }


      setIsUploading(true);
      axiosInstance.put(`/updateProfilePic`, formData)
      .then((response) => {
          setIsUploading(false); // Make sure this is still here for successful path
          const apiResponse = response.data; // This is the full object you console-logged: { status, data: { user, token } }

          console.log('API Raw Response Data:', apiResponse); // Debugging log for the full object

          // *** THIS IS THE CRITICAL CORRECTION ***
          // Access the nested 'data' property
          const { user: backendUser, token: backendToken } = apiResponse.data;

          console.log('Extracted Backend User:', backendUser); // Debugging log
          console.log('Extracted Backend Token:', backendToken); // Debugging log


          if (backendUser && backendToken) { // Now check the extracted variables
            const newProfilePic = backendUser.profile_pic; // Access from backendUser
            setValue(newProfilePic); // Update the form field or local state

            toast.success('Avatar updated successfully!');

            const updatedUser = {
                ...user, // Spread existing user data from AuthContext
                ...backendUser, // Override/add properties with the updated user data from backend
            };
            swrMutate(updatedUser, { revalidate: true });

          } else {
            // Server responded successfully, but data structure is unexpected
            throw new Error('User data or token not provided in response or incorrect structure.');
          }
        })
        .catch((error) => {
          console.error('Upload error:', error);
          let displayMessage = 'Failed to upload avatar'; // Default message
          if (error.response && error.response.data && error.response.data.message) {
            displayMessage = error.response.data.message; // Use backend message if available
          } else if (error.message) {
            displayMessage = error.message; // Use generic JS error message
          }
          toast.error(displayMessage);
        })
        .finally(() => {
          setIsUploading(false); // Ensure loading is always reset
        });
    },
    // Add swrMutate to dependencies because it's used inside useCallback
    [setValue, user, swrMutate]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept:  {
        'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'], // More specific accept types
    }, // More specific accept types
  });

  // Ensure formValue correctly accesses the image URL for display
  // If setValue updates a field that stores a File object, you might need URL.createObjectURL
  // If setValue directly stores the string URL, this is fine.
  const currentProfilePic = typeof getValues?.(name) === 'string' ? getValues?.(name) : defaultValue;


  return (
    <div className={cn('grid gap-5', className)}>
      <div
        {...getRootProps()}
        className="relative grid h-40 w-40 cursor-pointer place-content-center rounded-full border-[1.8px]"
      >
        {currentProfilePic ? ( // Check for currentProfilePic (updated URL or defaultValue)
          <>
            <Image
              src={currentProfilePic} // Use the current profile picture URL
              alt="User avatar"
              layout="fill"
              objectFit="cover" // Added for better image scaling
              className="rounded-full"
            />
            <div className="absolute inset-0 grid place-content-center rounded-full bg-black/70">
              {isUploading ? (
                <Loader variant="spinner" />
              ) : (
                <PiPencilSimple className="h-5 w-5 text-white" />
              )}
            </div>
          </>
        ) : (
          <>
            {isUploading ? (
              <Loader variant="spinner" />
            ) : (
              <UploadIcon className="mx-auto h-12 w-12" />
            )}
            <Text className="font-medium">Drop or select file</Text>
          </>
        )}
        <input {...getInputProps()} disabled={disabled} />
      </div>
      {error && <FieldError error={error} />}
    </div>
  );
}