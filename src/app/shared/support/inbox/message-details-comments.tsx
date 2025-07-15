'use client';

import { z } from 'zod';
import { useState, useEffect } from 'react';
import {
  Text,
  Badge,
  Button,
  Avatar,
} from 'rizzui';

import { Controller, useForm } from 'react-hook-form';

import dynamic from 'next/dynamic';
import axios from 'axios';
import { CommentSkeleton } from '@/app/(hydrogen)/cases/[caseId]/treatment/skeletonComment';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
const QuillEditor = dynamic(() => import('../../../../components/ui/quill-editor'), {
  ssr: false,
});

const FormSchema = z.object({
  message: z.string({ required_error: 'Invalid email address' }),
});

type FormValues = {
  message: string;
};

type Message = {
  id: number;
  case_id: number;
  treatment_id: number;
  user_id: number;
  comment: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};
const priorityOptions = [
  {
    value: 'Low',
    label: 'Low',
  },
  {
    value: 'Medium',
    label: 'Medium',
  },
  {
    value: 'High',
    label: 'High',
  },
];


export default function MessageDetails({
  user,
  treatmentId,
  treatmentStatus,
  caseId,
  messages,
  setMessages,
  className,
  compact = false,
}: {
  user: {
    id: number;
    email: string;
    role: number;
    firstName: string;
    lastName: string;
};
  treatmentId: number;
  treatmentStatus?:string;
  caseId: number;
  messages: Message[];
  setMessages: (newMessages: Message[]) => void;
  className?: string;
  compact?: boolean;
}) {
  const { control, handleSubmit, reset } = useForm<FormValues>();
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [messagesLength, setMessagesLength] = useState(3)
  const [parsedUsers, setParsedUsers] = useState([]);

  // Fetch messages from API
  // const fetchNames = async () = > {

  // }
  const fetchMessages = async () => {
    setIsLoadingMessage(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/comment/${caseId}/${treatmentId}`,
        { withCredentials: true }
      );
      const fetchedMessages = Object.values(res.data).map((msg: any) => ({
        ...msg,
        id: Number(msg.id),
        case_id: Number(msg.case_id),
        treatment_id: Number(msg.treatment_id),
        user_id: Number(msg.user_id),
      }));
      setMessages(fetchedMessages); // Update the parent state safely
      setMessagesLength(fetchedMessages.length)
      // console.log("Fetched messages:", messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Add a new message
  const onSubmit = async (formData: FormValues) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/comments`,
        {
          case_id: caseId,
          treatment_id: treatmentId,
          comment: formData.message,
        },
        { withCredentials: true }
      );

      const addedMessage = {
        ...res.data.data, // Assuming the added message is in `data`
        id: Number(res.data.data.id),
        case_id: Number(res.data.data.case_id),
        treatment_id: Number(res.data.data.treatment_id),
        user_id: Number(res.data.data.user_id),
      };

      setMessages((prevMessages) => [...prevMessages, addedMessage]); // Update locally
      reset(); // Clear the form
      fetchMessages(); // Refetch messages after submission
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  // Fetch messages only once when the component mounts
  useEffect(() => {
    // console.log('messagesnumber', messagesLength)
    // console.log("Fetched last messages:", messages[messagesLength-1]);
    const fetchParsedUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user-names/${caseId}`, {withCredentials: true});
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
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesLength]); // Dependency array ensures fetchMessages runs only once on mount
  // Function to get the display name for a user
  const getUserDisplayName = (userId) => {
    console.log("parsedUsers getUserDisplayName: ", parsedUsers)

    const user = parsedUsers.find((u) => u.id === userId);
    // console.log("user getUserDisplayName: ", user)
    if (user) {
      const prefix = user.role_id === 3 ? "Dr. " : ""; // Add Dr. for role_id === 3
      return `${prefix}${user.first_name} ${user.last_name}`;
    }
    return `User ${userId}`; // Fallback if user is not found
  };
  return (
    <div className={`space-y-4 ${className} ${compact ? 'text-sm' : ''}`}>
      {/* Messages List */}
      <div className={`messages ${compact ? 'space-y-2 max-h-[200px] overflow-y-auto pr-2' : 'space-y-4'}`}>
        {Array.isArray(messages) ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start ${compact ? 'space-x-2 p-2' : 'space-x-4 p-4'} rounded-md shadow-sm ${
                msg.user_id === user.id ? 'bg-yellow-500 bg-opacity-20' : 'bg-gray-100'
              }`}
            >
              {/* Avatar */}
              <figure>
                <Avatar
                  name={`User ${msg.user_id}`}
                  initials={msg.user_id.toString().slice(-2)}
                  src="https://via.placeholder.com/32" // Placeholder or dynamic URL
                  className={`${compact ? '!h-6 !w-6' : '!h-8 !w-8'} bg-blue-500 text-white ${compact ? '' : 'xl:!h-10 xl:!w-10'}`}
                />
              </figure>
          
              {/* Message Content */}
              <div className="flex flex-col space-y-2">
                <strong className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}>
                    {msg.user_id === user.id
                    ? `${getUserDisplayName(msg.user_id)} (Vous)`
                    : getUserDisplayName(msg.user_id)}
                </strong>
          
                {/* Safely render HTML content */}
                <div
                  className={`prose ${compact ? 'prose-xs' : 'prose-sm'} text-gray-700 leading-relaxed list-disc list-inside`}
                  dangerouslySetInnerHTML={{ __html: msg.comment }}
                />
          
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <CommentSkeleton length={messagesLength || 3}/>
        )}
      </div>
      {/* Add Message Form */}
      {treatmentStatus !== 'completed' && (
      <div className={`grid ${compact ? 'grid-cols-[24px_1fr] gap-2' : 'grid-cols-[32px_1fr] gap-3 lg:gap-4'} items-start rounded-b-lg bg-white lg:pl-0`}>
        <figure className="dark:mt-4">
          <Avatar
            name="You"
            initials="Y"
            className={`${compact ? '!h-6 !w-6' : '!h-8 !w-8'} bg-[#70C5E0] font-medium text-white ${compact ? '' : 'xl:!h-9 xl:!w-9'}`}
          />
        </figure>
        <div className={`relative rounded-lg border border-muted bg-gray-50 ${compact ? 'p-2' : 'p-4 2xl:p-5'}`}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, value } }) => (
                <QuillEditor
                  value={value}
                  onChange={onChange}
                  className={`rounded-md bg-gray-0 dark:bg-gray-50 [&>.ql-container_.ql-editor]:${compact ? 'min-h-[60px]' : 'min-h-[100px]'}`}
                />
              )}
            />
            <Button
             type="submit" 
             className={`${compact ? 'mt-2 text-xs py-1 px-2' : 'mt-4'}`}
             size={compact ? "sm" : "md"}
             disabled={user.id == messages[messages.length-1]?.user_id}
             >
              {compact ? `Envoyer ${treatmentStatus !== 'completed' ? '' : '(Terminé)'}` : 'Ajouter un commentaire'}
            </Button>
          </form>
        </div>
      </div>)}
    </div>
  );
}



export function DotSeparator({ ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="4"
      height="4"
      viewBox="0 0 4 4"
      fill="none"
      {...props}
    >
      <circle cx="2" cy="2" r="2" fill="#D9D9D9" />
    </svg>
  );
}

type AvatarOptionTypes = {
  avatar: string;
  label: string;
  [key: string]: any;
};

function renderAvatarOptionDisplayValue(option: AvatarOptionTypes) {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        src={option.avatar}
        name={option.label}
        className="!h-6 !w-6 rounded-full"
      />
      <span className="whitespace-nowrap text-xs sm:text-sm">
        {option.label}
      </span>
    </div>
  );
}

function renderPriorityOptionDisplayValue(value: string) {
  switch (value) {
    case 'Medium':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-orange-dark">
            {value}
          </Text>
        </div>
      );
    case 'Low':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            {value}
          </Text>
        </div>
      );
    case 'High':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
            {value}
          </Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium capitalize text-gray-600">
            {value}
          </Text>
        </div>
      );
  }
}
