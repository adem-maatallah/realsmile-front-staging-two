'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Select, Title, ActionIcon } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { createUserSchema } from '@/utils/validators/create-user.schema';
import axiosInstance from '@/utils/axiosInstance';

const roles = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'labo', label: 'Labo' },
];

const statuses = [
  { value: '0', label: 'Inactive' },
  { value: '1', label: 'Active' },
];

export default function TwoFactorAuthActivation() {
  const { closeModal } = useModal();
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/users`, 
         JSON.stringify(data),
         {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response) {
        toast.success('User created successfully');
        reset();
        closeModal();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      toast.error(`Error creating user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="container grid grid-cols-1 gap-6 p-6 md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {/* Additional form fields and controls as required */}
      <div className="col-span-full flex items-center justify-end gap-4">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Create User
        </Button>
      </div>
    </form>
  );
}
