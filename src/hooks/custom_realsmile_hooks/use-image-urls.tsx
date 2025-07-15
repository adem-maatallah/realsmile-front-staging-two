import { useMemo } from 'react';

export const useImageUrls = (images) => {
  return useMemo(() => {
    return images ? Object.keys(images).map(key => images[key]) : [];
  }, [images]);
};
