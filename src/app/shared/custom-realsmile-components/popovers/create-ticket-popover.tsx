'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Input, ActionIcon, Title } from 'rizzui';
import { z } from 'zod';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { db } from '@/utils/firestore/db';
import {
  doc,
  setDoc,
  collection,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { PiXBold } from 'react-icons/pi';

const ticketFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  department: z.string().min(1, 'Le département est requis'),
});

type TicketFormInput = z.infer<typeof ticketFormSchema>;

export default function CreateTicketModal({
  departments,
}: {
  departments: { value: string; label: string }[];
}) {
  const [isLoading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const {user} = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormInput>({
    resolver: zodResolver(ticketFormSchema),
  });

  const sendAgentNotification = async (agentId, notificationData) => {
    const agentNotificationsDocRef = doc(
      db,
      'agents',
      agentId,
      'agentnotifications',
      'agentnotifications'
    );

    const docSnap = await getDoc(agentNotificationsDocRef);
    if (docSnap.exists()) {
      // Append the new notification to the list field
      await updateDoc(agentNotificationsDocRef, {
        list: arrayUnion(notificationData),
        xa2: notificationData?.xa2 || '',
        xa3: notificationData?.xa3 || '',
        xa4: 'PUSH',
        xa5: notificationData?.xa5 || '',
        xd1: Date.now(),
      });
      return true;
    } else {
      console.error(`Document for agent ID ${agentId} not found.`);
      return false;
    }
  };

  const onSubmit: SubmitHandler<TicketFormInput> = async (data) => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const ticketId = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      const userId = user?.id || 'unknown';

      // Fetch the agents assigned to the department
      const appSettingsDoc = await getDoc(doc(db, 'userapp', 'appsettings'));
      const appSettingsData = appSettingsDoc.data();

      const department = appSettingsData?.u52?.find(
        (dept) => dept.tct === data.department
      );
      const agentIds = department?.tcLi || [];

      const ticketData = {
        csid: ticketId,
        tid: ticketId,
        cuid: userId,
        ib: user?.role || 'user',
        s: 1,
        tt: data.title,
        tpu: '',
        ctid: data.department,
        tcn: data.department,
        td: data.description,
        tcb: userId,
        tidf: ticketId,
        tit: '',
        cLb: '',
        cdb: '',
        cm: {},
        tco: timestamp,
        tLt: timestamp,
        mdt: 0,
        tmL: agentIds,
        taL: [userId, ...agentIds],
        tg: [],
        rtg: 0,
        irr: true,
        tss: '',
        i1: timestamp,
        i2: 0,
        i3: 0,
        i4: 0,
        i5: 0,
        i6: 0,
        i7: 0,
        i8: 0,
        i9: 0,
        i10: 0,
        s1: userId,
        s2: '',
        s3: '',
        s4: '',
        s5: '',
        s6: '',
        s7: '',
        s8: '',
        s9: '',
        s10: '',
        s11: '',
        s12: '',
        s13: '',
        s14: '',
        s15: '',
        s16: '',
        s17: '',
        s18: '',
        L1: agentIds,
        L2: [data.department],
        L3: [],
        L4: [],
        L5: [],
        L6: [],
        L7: [],
        L8: [],
        L9: [],
        L10: [],
        b1: false,
        b2: false,
        b3: false,
        b4: false,
        b5: false,
        b6: false,
        b7: true,
        b8: true,
        b9: true,
        b10: true,
        b11: true,
        b12: true,
        b13: true,
        b14: true,
        b15: true,
        m1: {},
        m2: {},
        m3: {},
        m4: {},
        m5: {},
        m6: {},
        m7: {},
        m8: {},
      };

      await setDoc(doc(db, 'tickets', ticketId), ticketData);

      const messageData = {
        tmc: `Le ticket ${ticketId} a été créé.`,
        isD: false,
        ti: timestamp,
        tsb: userId,
        ty: 0, // MessageType.rROBOTticketcreated
        sn: `${user?.first_name} ${user?.last_name}`,
        tn: data.title,
        idf: ticketId,
        sf: [1, 0],
        mp: userId,
        ti1: 0, // Usertype.customer
        tL1: [userId],
        ir: false,
        if: false,
        md: {},
        ts1: '',
        ts2: '',
        ts3: '',
        ts4: '',
        ts5: '',
        tLi: [],
        tL2: [],
        tL3: [],
        tb1: true,
        tb2: true,
        tm1: {},
        tm2: {},
      };

      await setDoc(
        doc(
          collection(db, `tickets/${ticketId}/ticketChats`),
          `${timestamp}--${userId}`
        ),
        messageData
      );

      // Send notifications to all agentIds
      const notificationData = {
        docid: timestamp.toString(),
        xa1: user?.id || 'unknown',
        xa2: 'Nouveau Ticket assigné',
        xa3: `Vous êtes assigné à un nouveau ID du ticket : ${ticketId}`,
        xa5: '',
        xa9: `TICKET--${ticketId}`,
        xd1: timestamp,
      };

      for (const agentId of agentIds) {
        await sendAgentNotification(agentId, notificationData);
      }

      toast.success('Ticket créé avec succès');
      reset();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      toast.error('Une erreur est survenue lors de la création du ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="container p-6"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Créer un ticket
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <div className="flex-grow pb-10">
        <div className="grid grid-cols-1 gap-8">
          <Input
            className="pt-8"
            label="Titre du ticket"
            placeholder="Titre du ticket"
            {...register('title')}
            error={errors.title?.message}
          />
          <Input
            label="Description du ticket"
            placeholder="Description du ticket"
            {...register('description')}
            error={errors.description?.message}
          />
          <label className="block">
            <span className="rizzui-input-label mb-1.5 block text-sm font-medium">
              Département du ticket
            </span>
            <select
              {...register('department')}
              className="form-select block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
              aria-label="Département du ticket"
              disabled={isLoading}
            >
              {departments
                .filter((department) => department.value !== 'Tous')
                .map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={closeModal} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'En cours de traitement...' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
