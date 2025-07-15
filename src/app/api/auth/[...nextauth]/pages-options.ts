import { routes } from '@/config/routes';
import { PagesOptions } from 'next-auth';

export const pagesOptions: Partial<PagesOptions> = {
  signIn: routes.signIn,
  signUp: routes.auth.signUp,
  error: routes.signIn,
};
