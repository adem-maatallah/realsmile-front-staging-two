import { metaObject } from '@/config/site.config';
import NotificationSettingsView from '@/app/shared/account-settings/security-settings';

export const metadata = {
  ...metaObject('Notification'),
};

export default function IntegrationSettingsFormPage() {
  return <NotificationSettingsView />;
}
