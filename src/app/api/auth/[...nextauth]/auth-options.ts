import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';

const tokenExpiryInSeconds = 604800; // 1 week in seconds

export const authOptions = {
  debug: true,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: tokenExpiryInSeconds, // Set expiration in seconds
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials, req) {
        let userObject = {
          id: credentials.id,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          user_name:
            credentials.user_name == null || credentials.user_name == 'null'
              ? credentials.first_name + '_' + credentials.last_name
              : credentials.user_name,
          email: credentials.email,
          phone: credentials.phone,
          phone_verified: credentials.phone_verified === 'true',
          email_verified: credentials.email_verified === 'true',
          status: credentials.status === 'true',
          firebase_uuid: parseInt(credentials.firebase_uuid),
          profile_pic: credentials.profile_pic,
          two_factor_enabled: credentials.two_factor_enabled === 'true',
          token: credentials.token,
          tokenExpires: parseInt(credentials.tokenExpires, 10), // Ensure this is an integer timestamp
          role: credentials.role,
          role_id: credentials.role_id,
          country: credentials.country,
          has_mobile_account: credentials.has_mobile_account === 'true',
        };

        if (credentials.role === 'doctor') {
          userObject = {
            ...userObject,
            speciality:
              credentials.speciality == 'null' ? '' : credentials.speciality,
            office_phone:
              credentials.office_phone == 'null'
                ? ''
                : credentials.office_phone,
            address: credentials.address ? credentials.address : '',
            address_2:
              credentials.address_2 == 'null' ? '' : credentials.address_2,
            city: credentials.city == 'null' ? '' : credentials.city,
            zip: credentials.zip == 'null' ? '' : credentials.zip,
          };
        }
        return userObject;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account, profile, trigger }) => {
      if (user) {
        token.user = { ...user };
        token.accessToken = user.token;
        token.tokenExpires = user.tokenExpires; // Pass the expiration time to the token
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.tokenExpires = token.tokenExpires; // Pass the expiration time to the session
      return session;
    },
    async signIn({ user }) {
      return user.status;
    },
  },
};
