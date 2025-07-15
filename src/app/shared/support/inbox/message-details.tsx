'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { z } from 'zod';
import { BiSend } from 'react-icons/bi';
import { useState, useEffect, useRef } from 'react';
import {
  Title,
  Badge,
  Button,
  Avatar,
  Empty,
  Loader,
  Textarea,
  FileInput,
  Text,
} from 'rizzui';
import cn from '@/utils/class-names';
import {
  dataAtom,
  messageIdAtom,
} from '@/app/shared/support/inbox/message-list';
import MessageBody from '@/app/shared/support/inbox/message-body';
import SimpleBar from '@/components/ui/simplebar';
import { useElementSize } from '@/hooks/use-element-size';
import { useMedia } from '@/hooks/use-media';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firestore/db';
import {
  doc,
  setDoc,
  collection,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { PiCheckCircle, PiStarFill } from 'react-icons/pi';
import axiosInstance from '@/utils/axiosInstance';

const FormSchema = z.object({
  message: z.string().optional(),
  file: z.instanceof(File).optional(),
});

export default function MessageDetails({ className }: { className?: string }) {
  const data = useAtomValue(dataAtom);
  const setMessageId = useSetAtom(messageIdAtom);
  const setData = useSetAtom(dataAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const messageId = useAtomValue(messageIdAtom);
  const {user} = useAuth()
  const simpleBarRef = useRef<any>(null);
  const [ref, { width }] = useElementSize();
  const isWide = useMedia('(min-width: 1280px) and (max-width: 1440px)', false);
  const [messages, setMessages] = useState<any[]>([]);
  const router = useRouter();

  const [messageInput, setMessageInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);

  const updateTicketTimestamp = async (ticketId) => {
    const finalTimestamp = Date.now();

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        tLt: finalTimestamp,
        i1: finalTimestamp,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'horodatage du ticket:",
        error
      );
    }
  };

  const message = data.find((m) => m.id === messageId) ?? data[0];
  const isTicketClosed = message?.s === 6 || message?.s === 5;

  useEffect(() => {
    if (simpleBarRef.current) {
      const scrollElement = simpleBarRef.current.getScrollElement();
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messageId) {
      const messagesQuery = collection(db, `tickets/${messageId}/ticketChats`);
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const messagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [messageId]);

  function formWidth() {
    if (isWide) return width - 64;
    return width - 44;
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `/chat/uploadChatFiles`;

    try {
      const response = await axiosInstance.post(uploadUrl, 
        formData,
        {
        withCredentials: true, // Assurez-vous que les cookies sont envoyés avec la requête
      });

      if (!response) {
        throw new Error('Échec du téléchargement du fichier');
      }

      const data = response.data;
      return data.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      throw error;
    }
  };

  const onSendMessage = async (
    content: string,
    type: number,
    timestamp: number,
    isForward: boolean = false
  ) => {
    if (content.trim() === '') return;

    const userId = user?.id || 'unknown';
    const isShowNamePhoto = true; // Ajouter votre logique pour afficher le nom et la photo

    try {
      content = content.trim();
      await setDoc(
        doc(db, `tickets/${messageId}/ticketChats`, `${timestamp}--${userId}`),
        {
          tmc: content,
          isD: false,
          ti: timestamp,
          ty: type,
          mp: userId,
          tLi: [],
          tsb: userId,
          sf: [1, 0], // Exemple de valeurs, à mettre à jour en conséquence
          ir: false,
          md: {},
          if: isForward,
          tn: message?.tt,
          idf: messageId,
          sn: isShowNamePhoto
            ? `${user?.first_name} ${user?.last_name}`
            : `ID Agent ${userId}`,
          ts1: '',
          ts2: '',
          ts3: '',
          ts4: '',
          ts5: '',
          tL1: [1], // Exemple de valeur, à mettre à jour en conséquence
          tL2: [],
          tL3: [],
          ti1: 0, // Exemple de valeur, à mettre à jour en conséquence
          ti2: 0, // Exemple de valeur, à mettre à jour en conséquence
          tb1: true,
          tb2: true,
          tm1: {},
          tm2: {},
        },
        { merge: true }
      );

      await updateTicketTimestamp(messageId);

      if (simpleBarRef.current) {
        const scrollElement = simpleBarRef.current.getScrollElement();
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }

      // Mettre à jour l'URL avec le messageId
      router.push(`?ticket=${messageId}`, undefined, { shallow: true });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const timestamp = Date.now();
    if (inputMode === 'text' && messageInput) {
      await onSendMessage(messageInput, 0, timestamp);
    } else if (inputMode === 'file' && fileInput) {
      const fileUrl = await uploadFile(fileInput);
      await onSendMessage(fileUrl, 1, timestamp);
    }
    setMessageInput('');
    setFileInput(null);
  };

  const closeTicket = async () => {
    const timestamp = Date.now();
    const userId = user?.id || 'unknown';
    const messageContent = `Le ticket ${message?.tt} (ID: ${messageId}) a été fermé.`;

    try {
      await updateDoc(doc(db, 'tickets', messageId), {
        i3: timestamp,
        i1: timestamp,
        tLt: timestamp,
        cLb: userId,
        s: user?.role == 'admin' ? 6 : 5, // Définir le statut en fonction du rôle
        i2: 2, // Supposons que 2 = TicketStatusShort.close
      });

      await setDoc(
        doc(
          collection(db, `tickets/${messageId}/ticketChats`),
          `${timestamp}--${userId}`
        ),
        {
          tmc: messageContent,
          isD: false,
          ti: timestamp,
          ty: 10, // rROBOTticketclosed
          mp: userId,
          tLi: [],
          tsb: userId,
          sf: [1, 0], // Exemple de valeurs, à mettre à jour en conséquence
          ir: false,
          md: {},
          if: false,
          tn: message?.tt,
          idf: messageId,
          sn: `${user?.first_name} ${user?.last_name}`,
          ts1: '',
          ts2: '',
          ts3: '',
          ts4: '',
          ts5: '',
          tL1: [1], // Exemple de valeur, à mettre à jour en conséquence
          tL2: [],
          tL3: [],
          ti1: 0, // Exemple de valeur, à mettre à jour en conséquence
          ti2: 0, // Exemple de valeur, à mettre à jour en conséquence
          tb1: true,
          tb2: true,
          tm1: {},
          tm2: {},
        }
      );

      // Rediriger ou afficher un message de succès
      router.push(`?ticket=${messageId}`, undefined, { shallow: true });
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket:', error);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
          className
        )}
      >
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!message) {
    return (
      <div
        className={cn(
          '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
          className
        )}
      >
        <Empty
          text="Aucune conversation sélectionnée"
          textClassName="mt-4 text-base text-gray-500"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative pt-6 lg:rounded-lg lg:border lg:border-muted lg:px-4 lg:py-7 xl:px-5 xl:py-5 2xl:pb-7 2xl:pt-6',
        className
      )}
    >
      <div>
        <header className="flex flex-col justify-between gap-4 border-b border-muted pb-5 3xl:flex-row 3xl:items-center">
          <div className="flex flex-col items-start justify-between gap-3 xs:flex-row xs:items-center xs:gap-6 lg:justify-normal">
            <Title as="h4" className="font-semibold">
              {message?.tt}
            </Title>
            <Badge variant="outline" color="info" size="sm">
              #{message?.id}
            </Badge>
          </div>
          <div className="jus flex flex-wrap items-center gap-2.5 sm:justify-end">
            {!isTicketClosed ? (
              <Button
                onClick={closeTicket}
                className="ml-auto gap-2 text-xs sm:ml-[unset] sm:text-sm"
                color="danger"
              >
                <span>Fermer le ticket</span> <PiCheckCircle strokeWidth="2" />
              </Button>
            ) : (
              <Badge variant="solid" color="danger" size="sm">
                Ticket Fermé
              </Badge>
            )}
          </div>
        </header>

        <div className="[&_.simplebar-content]:grid [&_.simplebar-content]:gap-8 [&_.simplebar-content]:py-5">
          <SimpleBar
            ref={simpleBarRef}
            className="@3xl:max-h-[calc(100dvh-34rem)] @4xl:max-h-[calc(100dvh-32rem)] @7xl:max-h-[calc(100dvh-31rem)]"
          >
            {messages.map((message, index) => (
              <MessageBody key={index} message={message} />
            ))}
          </SimpleBar>
        </div>

        {!isTicketClosed && (
          <div
            ref={ref}
            className="grid grid-cols-[32px_1fr] items-start gap-3 rounded-b-lg bg-white @3xl:pt-4 dark:bg-transparent lg:gap-4 lg:pl-0 dark:lg:pt-0 xl:grid-cols-[48px_1fr]"
          >
            <figure className="dark:mt-4">
              <Avatar
                name={
                  user?.first_name + ' ' + user?.last_name
                }
                initials={user?.user_name?.charAt(0)}
                src={user?.profile_pic}
                className="!h-8 !w-8 bg-[#70C5E0] font-medium text-white xl:!h-12 xl:!w-12"
              />
            </figure>
            <div
              className="relative rounded-lg border border-muted bg-gray-50 p-4 2xl:p-5"
              style={{ maxWidth: formWidth() }}
            >
              <form onSubmit={onSubmit}>
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={cn(
                      'rounded-md px-4 py-2',
                      inputMode === 'text'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200'
                    )}
                  >
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('file')}
                    className={cn(
                      'ml-2 rounded-md px-4 py-2',
                      inputMode === 'file'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200'
                    )}
                  >
                    Fichier
                  </button>
                </div>
                {inputMode === 'text' && (
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Entrez votre message..."
                    className="rounded-md bg-gray-0 dark:bg-gray-50 [&>.ql-container_.ql-editor]:min-h-[100px]"
                  />
                )}
                {inputMode === 'file' && (
                  <FileInput
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setFileInput(files[0]); // Passer l'objet du fichier
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="rounded-md bg-gray-0 dark:bg-gray-50"
                    label="Télécharger un fichier (image ou PDF)"
                  />
                )}
                <div className="mt-2.5 flex justify-end">
                  <Button
                    type="submit"
                    className="!h-11 text-sm font-medium xs:!h-12 xs:text-base"
                    size="md"
                  >
                    Envoyer
                    <BiSend className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isTicketClosed && message?.rtg && message?.s3 && (
          <div className="mt-6 border-t border-muted pt-4">
            <div className="flex items-center gap-2">
              <Text className="text-lg font-semibold">Évaluation:</Text>
              <Badge variant="solid" color="primary" className="text-base">
                {message.rtg}
                <PiStarFill className="ml-1 inline-block h-4 w-4 text-yellow-500" />
              </Badge>
            </div>
            <div className="mt-4">
              <Text className="text-lg font-semibold">
                Note:
              </Text>
              <Text className="mt-1 text-base text-gray-700">{message.s3}</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
