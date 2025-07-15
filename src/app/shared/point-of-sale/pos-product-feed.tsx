'use client';

import { useState } from 'react';
import { Empty, Button } from 'rizzui';
import ProductClassicCard from '@/components/cards/product-classic-card';
import useSWR from 'swr';
import shuffle from 'lodash/shuffle';
import { useAtomValue } from 'jotai';
import { posFilterValue } from './pos-search';
import hasSearchedParams from '@/utils/has-searched-params';
import { useFilterControls } from '@/hooks/use-filter-control';
import axiosInstance from '@/utils/axiosInstance';

const PER_PAGE = 12;

// API fetcher function
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export default function POSProductsFeed({
  userCountry,
}: {
  userCountry: string;
}) {
  const [isLoading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(PER_PAGE);
  const searchText = useAtomValue(posFilterValue);

  // Fetch products from API
  const { data: productItemsFiltered, error } = useSWR(
    `/products`,
    fetcher
  );

  const { state } = useFilterControls(); // Get the state to apply filters

  if (error) return <div>Error loading products.</div>;

  // Initial product list
  let filteredProducts = productItemsFiltered || [];

  // Search logic (by name)
  if (searchText.length > 0) {
    filteredProducts = filteredProducts.filter((item: any) => {
      const label = item.name;
      return (
        label.match(searchText.toLowerCase()) ||
        (label.toLowerCase().match(searchText.toLowerCase()) && label)
      );
    });
  }

  // Category filter logic (check if the product has the selected category)
  if (state['filter']) {
    filteredProducts = filteredProducts.filter((item: any) => {
      return item.categories.some(
        (category: any) => category.name === state['filter']
      );
    });
  }

  // Shuffle products if search params are present
  filteredProducts = hasSearchedParams()
    ? shuffle(filteredProducts)
    : filteredProducts;

  function handleLoadMore() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNextPage(nextPage + PER_PAGE);
    }, 600);
  }

  return (
    <>
      {filteredProducts?.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 @md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] @xl:gap-x-6 @xl:gap-y-12 @4xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))] ">
          {filteredProducts
            ?.slice(0, nextPage)
            ?.map((product) => (
              <ProductClassicCard
                key={product.id}
                product={product}
                userCountry={userCountry}
              />
            ))}
        </div>
      ) : (
        <Empty text="No Result Found" className="h-full justify-center" />
      )}

      {nextPage < filteredProducts?.length ? (
        <div className="mb-4 mt-5 flex flex-col items-center xs:pt-6 sm:pt-8">
          <Button isLoading={isLoading} onClick={() => handleLoadMore()}>
            Load More
          </Button>
        </div>
      ) : null}
    </>
  );
}
