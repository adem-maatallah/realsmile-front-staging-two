'use client';

import React from 'react';
import InboxTabs from '@/app/shared/support/inbox/inbox-tabs';
import MessageList from './message-list';
import TicketFilters from './ticket-filters';
import { useAuth } from '@/context/AuthContext';

export default function SupportInbox() {
  const { user } = useAuth();
  return (
    <>
      {user?.role === 'admin' && <TicketFilters />}
      <div className="@container">
        <div className="mt-5 items-start @container @2xl:mt-9 @4xl:grid @4xl:grid-cols-12 @4xl:gap-7 @[1550px]:grid-cols-11">
          <MessageList className="@xs:col-span-12 @4xl:col-span-4 @[1550px]:col-span-3" />
          <InboxTabs className="@xs:col-span-12 @4xl:col-span-8 @[1550px]:col-span-8" />
        </div>
      </div>
    </>
  );
}
