// multistep-atom.tsx
import { atomWithStorage } from 'jotai/utils';

type ErrorLoadingType = {
  isLoading: boolean;
  error: string;
  isValid: boolean; // Added to track form validity
};

export const initialErrorLoadingData = {
  isLoading: false,
  error: '',
  isValid: true, // Assume form is valid initially
};

export const errorLoadingAtom = atomWithStorage<ErrorLoadingType>(
  'errorLoading',
  initialErrorLoadingData
);
