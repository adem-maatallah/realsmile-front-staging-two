import { useCallback, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import UploadIcon from '@/components/shape/upload';
import { FieldError, Loader, Text } from 'rizzui';
import { PiPencilSimple } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { signIn, useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

interface UpdateUserAvatarUploadProps {
  name: string;
  setValue: any;
  getValues?: () => any;
  className?: string;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
  userId: string;
}

export default function UpdateUserAvatarUpload({
  name,
  setValue,
  getValues,
  className,
  error,
  defaultValue,
  disabled = false,
  userId,
}: UpdateUserAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

// Inside UpdateUserAvatarUpload's onDrop method:

const onDrop = useCallback(
  (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('profile_pic', file);
    formData.append('user_id', userId);

    setIsUploading(true);

    axiosInstance.put(`/updateProfilePic`, formData)
      .then((response) => {
        // Log the full response object for meticulous inspection
        console.log('Upload successful: Full response object:', response);

        const apiResponseData = response.data; // Get the data part

        // Deep dive into logs for clarity
        console.log('API Response Data:', apiResponseData);
        console.log('API Response Data User:', apiResponseData?.data?.user); // It's apiResponse.data.user based on the console log!
        console.log('API Response Data User Profile Pic:', apiResponseData?.data?.user?.profile_pic);

        // Corrected access path based on your provided log structure:
        // The console log showed `data: { user: { ... }, token: "..." }` directly under `response.data`
        // So, it should be `response.data.data.user.profile_pic`
        if (apiResponseData?.data?.user?.profile_pic && typeof apiResponseData.data.user.profile_pic === 'string') {
            const newProfilePic = apiResponseData.data.user.profile_pic;
            setValue(newProfilePic);
            toast.success('Avatar updated successfully!');
        } else {
            // Provide more detail in the error message
            throw new Error(
                `Profile picture URL not provided in response data or is not a string. ` +
                `Received: ${JSON.stringify(apiResponseData?.data?.user?.profile_pic)} ` +
                `Full response data: ${JSON.stringify(apiResponseData, null, 2)}`
            );
        }
      })
      .catch((error) => {
        console.error('Upload error:', error);
        let errorMessage = 'Failed to upload avatar';
        if (error.response) {
          errorMessage = error.response.data?.message || error.message;
        } else if (error.request) {
          errorMessage = 'No response from server. Check your internet connection.';
        } else {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsUploading(false);
      });
  },
  [userId, setValue] // Removed `user` and `setIsUploading` as they are not used directly inside `onDrop`'s data/request
);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: 'image/*', // Accept images only
  });

  const formValue = getValues?.(name);

  return (
    <div className={cn('grid gap-5', className)}>
      <div
        {...getRootProps()}
        className="relative grid h-40 w-40 cursor-pointer place-content-center rounded-full border-[1.8px]"
      >
        {formValue || defaultValue ? (
          <>
            <Image
              src={formValue?.url || defaultValue}
              alt="User avatar"
              layout="fill"
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
