'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Select, Title, ActionIcon, Textarea } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Form } from '@/components/ui/form';
import {
  createUserSchema,
  CreateUserInput,
} from '@/utils/validators/create-user.schema';
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

export default function CreateUser() {
  const { closeModal } = useModal();
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      user_name: '',
      phone: '',
      profile_pic: '',
      grade: 'bronze',
      admin_verified: 0,
      status: '0',
      speciality: '',
      office_phone: '',
      address: '',
      address_2: '',
      city: '',
      state: '',
      country: '',
      date_of_birth: '',
      gender: '',
      doctor_id: undefined,
      lab_name: '',
    },
  });

  const selectedRole = watch('role'); // This watches the role field for changes

  const onSubmit = async (data:any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/users`, 
        JSON.stringify(data),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (response) {
        toast.success('User created successfully');
        reset();
        closeModal();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error : any) {
      toast.error(
        `Error creating user: ${error.response?.data?.message || error.message}`
      );
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
      <div className="col-span-full flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Add a New User
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <Input
        label="First Name"
        placeholder="Enter user's first name"
        {...register('first_name')}
        error={errors.first_name?.message}
      />
      <Input
        label="Last Name"
        placeholder="Enter user's last name"
        {...register('last_name')}
        error={errors.last_name?.message}
      />
      <Input
        label="Email"
        placeholder="Enter user's Email Address"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Username"
        placeholder="Enter user's username"
        {...register('user_name')}
        error={errors.user_name?.message}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter user's password"
        {...register('password')}
        error={errors.password?.message}
      />
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Role"
            options={roles}
            className="col-span-full"
            error={errors.role?.message}
            getOptionValue={(option) => option.value}
            displayValue={(selected: any) =>
              roles.find((option) => option.value === selected)?.label ??
              selected
            }
            dropdownClassName="!z-[1]"
            inPortal={false}
          />
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Status"
            options={statuses}
            className="col-span-full"
            error={errors.status?.message}
            getOptionValue={(option) => option.value}
            displayValue={(selected) =>
              statuses.find((option) => option.value === selected)?.label ?? ''
            }
            dropdownClassName="!z-[1]"
            inPortal={false}
          />
        )}
      />
      {selectedRole === 'doctor' && renderDoctorFields(register, errors)}
      {selectedRole === 'patient' && renderPatientFields(register, errors)}
      {selectedRole === 'labo' && renderLabFields(register, errors)}
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

function renderDoctorFields(register : any, errors : any) {
  return (
    <>
      <Input
        label="Speciality"
        placeholder="Enter speciality"
        {...register('speciality')}
        error={errors.speciality?.message}
      />
      <Input
        label="Office Phone"
        placeholder="Enter office phone number"
        {...register('office_phone')}
        error={errors.office_phone?.message}
      />
      <Textarea
        label="Address"
        placeholder="Enter address"
        {...register('address')}
        error={errors.address?.message}
      />
    </>
  );
}

function renderPatientFields(register : any, errors : any) {
  return (
    <>
      <Input
        label="Date of Birth"
        type="date"
        placeholder="YYYY-MM-DD"
        {...register('date_of_birth')}
        error={errors.date_of_birth?.message}
      />
      <Input
        label="Gender"
        placeholder="Enter gender"
        {...register('gender')}
        error={errors.gender?.message}
      />
    </>
  );
}

function renderLabFields(register : any, errors : any) {
  return (
    <>
      <Input
        label="Lab Name"
        placeholder="Enter lab name"
        {...register('lab_name')}
        error={errors.lab_name?.message}
      />
      <Textarea
        label="Address"
        placeholder="Enter address"
        {...register('address')}
        error={errors.address?.message}
      />
    </>
  );
}
