// /pages/api/secure-cookies.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import CryptoJS from 'crypto-js';
import { cookies } from 'next/headers'; // Importing the cookies from next/headers
import { NextResponse } from 'next/server';

const secretKey = process.env.COOKIES_CRYPTO_KEY || 'default_secret_key';

export async function POST(req: Request) {
  const data = await req.json();
  const { operation, value } = data;
  const cookieStore = cookies();
  const phoneCookies = cookieStore.get('otpPhone');

  switch (operation) {
    case 'encrypt':
      const encryptedData = CryptoJS.AES.encrypt(value, secretKey).toString();
      phoneCookies?.set('userPhone', encryptedData, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // secure in production
        sameSite: 'Strict',
        path: '/',
        maxAge: 300, // 5 minutes
      });
      NextResponse.json({ message: 'Data encrypted' });
      break;
    case 'decrypt':
      const encryptedValue = phoneCookies?.get('userPhone')?.value;
      if (!encryptedValue) {
        NextResponse.json({ error: 'No data found' });
      }
      const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) {
        NextResponse.json({ error: 'Decryption failed' });
      }
      NextResponse.json({ decryptedData });
      break;
    default:
      return NextResponse.json({ error: 'Invalid operation' });
  }
}
