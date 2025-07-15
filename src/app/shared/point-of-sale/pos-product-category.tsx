'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import { useFilterControls } from '@/hooks/use-filter-control';
import { useElementRePosition } from '@/hooks/use-element-reposition';
import useSWR from 'swr';
import axiosInstance from '@/utils/axiosInstance';

function getIndexByValue(arr: any[], value: string) {
  return arr.findIndex((item) => item.value === value);
}

export default function POSProductCategory() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch categories from API
  const { data: categories, error } = useSWR(
    `/categories`,
    (url: string) => axiosInstance.get(url).then((res) => res.data)
  );

  const { state, applyFilter, reset } = useFilterControls<any, any>(null); // Adjust initial state based on your logic
  const { isScrollableToLeft, isScrollableToRight } = useElementRePosition({
    ref,
    activeTab: activeIndex,
  });

  function handleReset(i: number) {
    reset();
    setActiveIndex(i);
  }

  function handleFilter(value: string, i: number) {
    applyFilter('filter', value);
    setActiveIndex(i);
  }

  useEffect(() => {
    if (!state) {
      setActiveIndex(0);
    } else {
      setActiveIndex(getIndexByValue(categories || [], state['filter']) + 1);
    }
  }, [state, categories]);

  if (error) return <div>Error loading categories</div>;
  if (!categories) return <div>Loading categories...</div>;

  return (
    <>
      <div
        ref={ref}
        className="flex w-full items-center gap-2.5 overflow-x-auto pb-[2px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Button
          onClick={() => handleReset(0)}
          variant={state['filter'] ? 'outline' : 'solid'}
          className={cn('z-1 relative flex shrink-0 gap-1.5')}
        >
          All Items
        </Button>

        {categories.map((category: any, idx: number) => {
          return (
            <Button
              key={category.id}
              variant={state['filter'] === category.name ? 'solid' : 'outline'}
              className={cn(
                'inline-flex shrink-0 gap-1.5 scroll-smooth focus-visible:border-0 focus-visible:ring-0 active:ring-0 focus-visible:enabled:border-0',
                state['filter'] === category.name && 'relative z-10'
              )}
              onClick={() => handleFilter(category.name, idx + 1)}
            >
              <span className="flex items-center">
                <img
                  src={category.thumbnail} // Display category image
                  alt={category.name}
                  className="mr-2 h-5 w-5"
                />
                {category.name}
              </span>
            </Button>
          );
        })}
      </div>

      <span
        className={cn(
          'invisible absolute start-0 top-0 z-[2] h-full w-10 bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent opacity-0 duration-200 dark:from-gray-50 dark:via-gray-50/70 rtl:bg-gradient-to-l',
          isScrollableToLeft && 'visible opacity-100'
        )}
      />
      <span
        className={cn(
          'invisible absolute end-0 top-0 z-[2] h-full w-10 bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent opacity-0 duration-200 dark:from-gray-50 dark:via-gray-50/70 rtl:bg-gradient-to-r',
          isScrollableToRight && 'visible opacity-100'
        )}
      />
    </>
  );
}
