import { useContext } from 'react';
import { NotificationsContext } from './use-notifications-provider'; // Corrected import

export function useNotifications() {
  const context = useContext(NotificationsContext); // Use the context, not the provider

  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }

  return context;
}
