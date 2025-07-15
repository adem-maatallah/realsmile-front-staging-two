import React, { useState } from 'react';
import { CartItem } from '@/types';
import { EmptyProductBoxIcon, Button, Title, Text } from 'rizzui';
import toast from 'react-hot-toast';
import { PriceCalculation } from '@/app/shared/point-of-sale/pos-drawer-view';
import POSOrderProductsTwo from '@/app/shared/point-of-sale/pos-order-products-two';
import { useCart } from '@/store/quick-cart/cart.context';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '@/components/custom-realsmile-components/order-confirmation-modal';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';

type PosSidebarProps = {
  simpleBarClassName?: string;
  orderedItems: CartItem[]; // Ensure orderedItems have the image field
};

function PostSidebar({ simpleBarClassName, orderedItems }: PosSidebarProps) {
  const [loading, setLoading] = useState(false);
  const { resetCart, clearItemFromCart, removeItemFromCart, items } = useCart();
  const {user} = useAuth()
  const router = useRouter();

  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const [isProcessing, setProcessing] = useState(false); // Processing state

  const getCurrency = () => {
    return user?.country === 'TN'
      ? 'TND'
      : user?.country === 'MA'
        ? 'MAD'
        : 'EUR';
  };

  const currency = getCurrency();

  // Handle order creation after confirmation
  const handleConfirmOrder = async () => {
    setProcessing(true);

    try {
      const response = await axiosInstance.post(
        `/orders`,
        JSON.stringify({
            customerId: user?.id,
            currency,
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              image: item.image, // Make sure the image is passed correctly
              currency,
            })),
          }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.data;

      if (!response) {
        throw new Error(result.message || 'Failed to create order');
      }

      toast.success('Order successfully created!');
      router.push(`/checkout/${result.order.reference}`);
      resetCart(); // Clear the cart after order creation
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setProcessing(false);
      setModalOpen(false); // Close modal after order processing
    }
  };

  // Handle the modal confirmation
  const handleOrder = () => {
    setModalOpen(true); // Open the confirmation modal
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 py-3 lg:px-7">
        <Title as="h5" className="font-semibold">
          Customer Order
        </Title>
        {orderedItems?.length > 0 && (
          <Button variant="text" onClick={resetCart} className="pe-0">
            Clear All
          </Button>
        )}
      </div>
      <div className="ps-5 lg:ps-7">
        {!!orderedItems?.length && (
          <POSOrderProductsTwo
            orderedItems={orderedItems} // Ensure orderedItems includes image field
            removeItemFromCart={removeItemFromCart}
            clearItemFromCart={clearItemFromCart}
            simpleBarClassName={simpleBarClassName}
            showControls
          />
        )}
      </div>
      {!orderedItems?.length && (
        <div className="flex h-full flex-col justify-center">
          <span />
          <div>
            <EmptyProductBoxIcon className="mx-auto h-auto w-52 text-gray-400" />
            <Title as="h5" className="mt-6 text-center">
              You have no order
            </Title>
            <Text className="mt-1 text-center">Start Ordering!!</Text>
          </div>
        </div>
      )}
      {!!orderedItems?.length && (
        <div className="border-t border-gray-300 p-5 pb-0 lg:p-7">
          <PriceCalculation currency={currency} />
          <div className="flex flex-col gap-4">
            <Button
              className="h-11 w-full"
              isLoading={loading}
              onClick={handleOrder} // Trigger confirmation modal
            >
              Order Now
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)} // Close modal on cancel
        onConfirm={handleConfirmOrder} // Trigger order creation on confirm
        isProcessing={isProcessing} // Show loading state during order creation
      />
    </>
  );
}

export default PostSidebar;
