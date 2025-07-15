'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';
import { PiEye, PiDownloadSimpleBold, PiCheck } from 'react-icons/pi';
import { Avatar, Title, Text, Tooltip } from 'rizzui';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import pdfIcon from '@public/pdf-icon.svg';
import { useAuth } from '@/context/AuthContext';
import { LuSeparatorHorizontal } from 'react-icons/lu';

export default function MessageBody({ message }) {
  const {user} = useAuth()
  const initials = message?.sn.charAt(0);

  const isCurrentUser = user?.id == message?.tsb;

  const renderMessageContent = () => {
    switch (message.ty) {
      case 0: // Text
        return <Text>{message.tmc}</Text>;
      case 1: // Image
        return (
          <figure className="relative h-60 w-60 overflow-hidden rounded">
            <Image
              fill
              alt="Image content"
              src={message.tmc}
              className="object-contain"
            />
          </figure>
        );
      case 2: // Video
        return (
          <video controls className="h-80 w-auto rounded">
            <source src={message.tmc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 3: // Document
        return (
          <div className="flex items-center gap-2 text-xs">
            <Image src={pdfIcon} alt="pdf icon" className="h-6 w-6" />
            <div>
              <span className="font-medium text-gray-700">{message.tmc}</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-2 text-gray-500 transition duration-300 hover:text-gray-900">
                  <PiEye className="h-3.5 w-3.5" /> <button>Preview</button>
                </span>
                <LuSeparatorHorizontal />
                <div className="flex items-center gap-2 text-gray-500 transition duration-300 hover:text-gray-900">
                  <PiDownloadSimpleBold className="h-3.5 w-3.5" />{' '}
                  <button>Download</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 4: // Google Maps location link
        return (
          <a
            href={message.tmc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Location on Google Maps
          </a>
        );
      case 5: // Contact
        return <Text>Contact: {message.tmc}</Text>;
      case 6: // Audio
        return (
          <audio controls>
            <source src={message.tmc} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      case 7: // rROBOTticketcreated
        return <Text>{message.tmc}</Text>;
      case 8: // rROBOTticketdescriptionupdated
        return (
          <Text>
            The description of Ticket #{message.idf} has been updated.
          </Text>
        );
      case 9: // rROBOTgeneralmessage
        return <Text>General message for Ticket #{message.idf}.</Text>;
      case 10: // rROBOTticketclosed
        return <Text>Ticket #{message.idf} has been closed.</Text>;
      case 11: // rROBOTagentsassigned
        return <Text>Agents have been assigned to Ticket #{message.idf}.</Text>;
      case 12: // rROBOTrequestedtoclose
        return <Text>Ticket #{message.idf} has been requested to close.</Text>;
      case 13: // rROBOTrequireattention
        return <Text>Ticket #{message.idf} requires attention.</Text>;
      case 14: // rROBOTticketreopened
        return <Text>Ticket #{message.idf} has been reopened.</Text>;
      case 15: // rROBOTclosingDeniedByCustomer
        return <Text>Customer denied closing Ticket #{message.idf}.</Text>;
      case 16: // rROBOTclosingDeniedByAgent
        return <Text>Agent denied closing Ticket #{message.idf}.</Text>;
      case 17: // rROBOTremovettention
        return <Text>Attention removed from Ticket #{message.idf}.</Text>;
      case 18: // rROBOTassignAgentForACustomerCall
        return (
          <Text>
            Agent assigned for a customer call on Ticket #{message.idf}.
          </Text>
        );
      case 19: // rROBOTremoveAssignAgentForACustomerCall
        return (
          <Text>
            Agent removed from customer call on Ticket #{message.idf}.
          </Text>
        );
      case 20: // rROBOTcallHistory
        return <Text>Call history for Ticket #{message.idf}.</Text>;
      case 21: // rROBOTdepartmentChanged
        return <Text>Department changed for Ticket #{message.idf}.</Text>;
      default:
        return <Text>Unknown message type.</Text>;
    }
  };

  return (
    <div className={`grid ${isCurrentUser ? 'justify-end' : ''}`}>
      <div
        className={`grid grid-cols-[32px_1fr] items-start gap-3 lg:gap-4 xl:grid-cols-[48px_1fr] ${isCurrentUser ? 'text-right' : ''}`}
      >
        <Avatar
          name={message?.sn}
          src={message?.avatar}
          initials={initials}
          className="!h-8 !w-8 bg-[#70C5E0] font-medium text-white xl:!h-11 xl:!w-11"
        />
        <div className="-mt-1.5 lg:mt-0">
          <div className="flex items-center justify-between">
            <Title as="h3" className="text-sm font-medium">
              {message?.sn}
            </Title>
          </div>
          <div className="mt-1.5 items-center gap-2 text-xs text-gray-500 lg:flex">
            <span className="mt-1.5 flex items-center lg:mt-0">
              {new Date(message?.ti).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`ml-10 mt-3 grid gap-2 leading-relaxed xl:ml-16 2xl:mt-4 ${isCurrentUser ? 'text-right' : ''}`}
      >
        {renderMessageContent()}
      </div>
    </div>
  );
}
