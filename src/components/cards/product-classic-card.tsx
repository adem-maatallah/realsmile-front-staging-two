'use client';

import { Title, Text, Button, Badge } from 'rizzui'; // Import Badge component
import cn from '@/utils/class-names';
import { PosProduct } from '@/types';
import { PiMinus, PiPlus, PiCalendar } from 'react-icons/pi'; // Added PiCalendar for the calendar icon
import { useCart } from '@/store/quick-cart/cart.context';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns'; // Date formatting

interface ProductProps {
  product: PosProduct;
  className?: string;
  userCountry: string;
}

export default function ProductClassicCard({
  product,
  className,
  userCountry,
}: ProductProps) {
  const { addItemToCart, isInCart, modifyProductQuantity } = useCart();
  const {user} = useAuth()

  const {
    name,
    priceTnd,
    priceMar,
    priceEur,
    imageUrls,
    discount,
    categories,
    availableDate,
    endDate,
    isLimitDate,
  } = product;

  // Determine the price based on user's country
  const price =
    userCountry === 'TN'
      ? priceTnd
      : userCountry === 'MA'
        ? priceMar
        : priceEur;

  const discountedPrice = discount
    ? (price - (price * discount) / 100).toFixed(2)
    : price.toFixed(2);

  // Get currency symbol based on the user's country
  const currency =
    userCountry === 'TN' ? 'TND' : userCountry === 'MA' ? 'MAD' : 'EUR';

  return (
    <div className={cn('pb-0.5', className)}>
      <div className="relative">
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {imageUrls?.length > 0 ? (
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Navigation]}
              className="swiper-container"
            >
              {imageUrls.map((imageUrl: string, index: number) => (
                <SwiperSlide key={index}>
                  <div className="relative h-[300px] w-full">
                    <img
                      alt={name}
                      src={imageUrl}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <Text>No Image</Text>
            </div>
          )}
        </div>

        {discount ? (
          <Text
            as="span"
            className="absolute left-2 top-2 z-10 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white"
          >
            {discount}% OFF
          </Text>
        ) : null}
      </div>

      <div className="pt-3">
        <Title as="h6" className="mb-1 truncate font-inter font-semibold">
          {name}
        </Title>

        <div className="mt-1 flex flex-wrap gap-1">
          {categories?.map((category) => (
            <Badge key={category.id} variant="flat">
              {category.name}
            </Badge>
          ))}
        </div>

        <div className="mt-2 flex items-center font-semibold text-gray-900">
          {Number(discountedPrice)} {currency}
          {discount ? (
            <del className="ps-1.5 text-[13px] font-normal text-gray-500">
              {Number(price).toFixed(2)} {currency}
            </del>
          ) : null}
        </div>

        {/* Display availableDate and endDate with icons and updated design */}
        {isLimitDate && (availableDate || endDate) && (
          <div className="mt-3 space-y-1">
            {availableDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PiCalendar className="h-4 w-4 text-gray-500" />
                <span>Available from:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(availableDate), 'MMMM dd, yyyy')}
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PiCalendar className="h-4 w-4 text-gray-500" />
                <span>Ends At:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(endDate), 'MMMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-3">
          {isInCart(product.id) ? (
            <QuantityControl item={product} />
          ) : (
            <Button
              onClick={() => addItemToCart(product, 1)}
              className="w-full"
              variant="outline"
            >
              Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuantityControl({ item }: { item: PosProduct }) {
  const { modifyProductQuantity, getItemFromCart, clearItemFromCart } =
    useCart();
  const cartItem = getItemFromCart(item.id);

  const handleDecrement = () => {
    if (cartItem.quantity > 1) {
      modifyProductQuantity(item.id, cartItem.quantity - 1);
    } else {
      clearItemFromCart(item.id); // Remove item if quantity is 1
    }
  };

  const handleIncrement = () => {
    modifyProductQuantity(item.id, cartItem.quantity + 1);
  };

  return (
    <div className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 px-1 duration-200 hover:border-gray-900">
      <button
        title="Decrement"
        className="flex items-center justify-center rounded p-2 duration-200 hover:bg-gray-100 hover:text-gray-900"
        onClick={handleDecrement}
      >
        <PiMinus className="h-3.5 w-3.5" />
      </button>
      <span className="grid w-8 place-content-center font-medium">
        {cartItem?.quantity}
      </span>
      <button
        title="Increment"
        className="flex items-center justify-center rounded p-2 duration-200 hover:bg-gray-100 hover:text-gray-900"
        onClick={handleIncrement}
      >
        <PiPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
