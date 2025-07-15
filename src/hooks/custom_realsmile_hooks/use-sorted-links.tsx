import { useState, useEffect, useRef } from 'react';

export const useSortedLinks = (links) => {
  const [onyxcephUrl, setOnyxcephUrl] = useState(null);
  const previousUrlRef = useRef();

  useEffect(() => {
    const sortedLinks = links
      ? Object.entries(links).map(([key, value]) => ({
          id: key,
          url: value.url,
          created_at: value.created_at,
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      : [];

    const newUrl = sortedLinks.length > 0 ? sortedLinks[0].url : null;
    if (newUrl !== previousUrlRef.current) {
      setOnyxcephUrl(newUrl);
      previousUrlRef.current = newUrl;
    }
  }, [links]);

  return { onyxcephUrl, setOnyxcephUrl };
};
