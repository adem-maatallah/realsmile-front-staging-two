// hooks/useCategories.ts
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useCategories = () => {
  const { data, error } = useSWR('/api/categories', fetcher);

  return {
    categories: data || [],
    loading: !error && !data,
    error,
  };
};
