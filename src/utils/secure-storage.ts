import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const secretKey = process.env.NEXT_PUBLIC_COOKIES_CRYPTO_KEY;

export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (ciphertext: any) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const setEncryptedCookie = (name: any, value: any) => {
  /* const encryptedData = encryptData(value); */
  Cookies.set(name, value, {
    expires: 1,
    secure: true,
    sameSite: 'Strict',
  });
};

export const getDecryptedCookie = (name: any) => {
  const encryptedData = Cookies.get(name);
  if (!encryptedData) return null;
  return /* decryptData( */encryptedData/* ) */;
};
