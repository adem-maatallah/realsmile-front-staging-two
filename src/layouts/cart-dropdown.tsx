import { useState } from 'react';
import { useCart } from '@/store/quick-cart/cart.context';
import { Button, Title, Text } from 'rizzui';
import SimpleBar from '@/components/ui/simplebar';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import cn from '@/utils/class-names';
import { useRouter } from 'next/navigation';
import { PiMinusBold, PiPlusBold, PiTrash } from 'react-icons/pi';
import ConfirmationModal from '@/components/custom-realsmile-components/order-confirmation-modal';
import { format } from 'date-fns';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosInstance';

export default function CartDropdown() {
  const { items, resetCart, clearItemFromCart, modifyProductQuantity } =
    useCart();
  const {user} = useAuth()
  const router = useRouter();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isProcessing, setProcessing] = useState(false);

  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle confirmation modal trigger
  const handleOrderNowClick = () => {
    setModalOpen(true);
  };

  // Handle the confirmed order creation
  const handleConfirmOrder = async () => {
    setProcessing(true);

    try {  
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
         JSON.stringify({
            customerId: user?.id,
            totalAmount,
            currency:
              user?.country === 'TN'
                ? 'TND'
                : user?.country === 'MA'
                  ? 'MAD'
                  : 'EUR',
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              image: item.image, // Ensure image is passed
              currency:
                user?.country === 'TN'
                  ? 'TND'
                  : user?.country === 'MA'
                    ? 'MAD'
                    : 'EUR',
            })),
          }),

      );

      const result = await response.data;

      if (!response) {
        throw new Error(result.message || 'Failed to create order');
      }

      toast.success('Order successfully created!');
      router.push(`/checkout/${result.order.reference}`);
      resetCart();
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setProcessing(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="w-[320px] sm:w-[360px] 2xl:w-[420px]">
      <div className="mb-2 flex items-center justify-between px-5 py-3 lg:px-7">
        <Title as="h5" className="font-semibold">
          Your Cart
        </Title>
        {items.length > 0 && (
          <Button
            variant="text"
            onClick={() => {
              resetCart();
              toast.success('Cart cleared');
            }}
            className="text-sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col justify-center py-4 text-center text-gray-500">
          <Text>Your cart is empty</Text>
        </div>
      ) : (
        <SimpleBar className="max-h-[300px] px-4">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 py-4">
                <figure className="relative h-full w-40 flex-grow-0 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.image} // Use image from the API
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </figure>

                <div className="flex flex-1 flex-col justify-between truncate">
                  <div>
                    <Title
                      as="h3"
                      className="mb-2 text-sm font-semibold text-gray-900"
                    >
                      {item.name}
                    </Title>

                    <div className="text-xs text-gray-500">
                      {item.availableDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-600">
                            Available from:
                          </span>
                          <span>
                            {format(
                              new Date(item.availableDate),
                              'MMMM dd, yyyy'
                            )}
                          </span>
                        </div>
                      )}
                      {item.endDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-600">
                            Ends At:
                          </span>
                          <span>
                            {format(new Date(item.endDate), 'MMMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      {item.quantity} x {Number(item.price).toFixed(2)}{' '}
                      {user?.country === 'TN'
                        ? 'TND'
                        : user?.country === 'MA'
                          ? 'MAD'
                          : 'EUR'}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <QuantityControl
                      item={item}
                      modifyProductQuantity={modifyProductQuantity}
                      clearItemFromCart={clearItemFromCart}
                    />
                  </div>
                </div>
                <RemoveItem
                  product={item}
                  clearItemFromCart={clearItemFromCart}
                />
              </div>
            ))}
          </div>
        </SimpleBar>
      )}

      {items.length > 0 && (
        <>
          <button
            onClick={handleOrderNowClick}
            className={cn(
              'mx-4 mb-2 mt-3 flex w-full items-center justify-between rounded-md bg-primary px-5 py-2 font-medium text-white hover:bg-primary-dark'
            )}
          >
            <span>Order Now</span>
            <span className="ml-auto rounded-md bg-primary-lighter p-2 px-4 text-primary-dark">
              {Number(totalAmount).toFixed(2)}{' '}
              {user?.country === 'TN'
                ? 'TND'
                : user?.country === 'MA'
                  ? 'MAD'
                  : 'EUR'}
            </span>
          </button>

          <Link
            href="/shop"
            className={cn(
              'mx-4 mb-2 mt-3 flex w-full items-center justify-center rounded-md bg-gray-200 px-5 py-2 font-medium text-gray-800 hover:bg-gray-300'
            )}
          >
            Continue Shopping
          </Link>
        </>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmOrder}
        isProcessing={isProcessing}
      />
    </div>
  );
}

function QuantityControl({ item, modifyProductQuantity, clearItemFromCart }) {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      modifyProductQuantity(item.id, item.quantity - 1);
    } else {
      clearItemFromCart(item.id);
      toast.success('Item removed from cart');
    }
  };

  const handleIncrement = () => {
    modifyProductQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        title="Decrement"
        className="grid h-7 w-7 place-content-center rounded-full bg-gray-50"
        onClick={handleDecrement}
      >
        <PiMinusBold className="h-4 w-4 text-gray-600" />
      </button>
      <span className="font-medium text-gray-900">{item.quantity}</span>
      <button
        title="Increment"
        className="grid h-7 w-7 place-content-center rounded-full bg-gray-50"
        onClick={handleIncrement}
      >
        <PiPlusBold className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}

function RemoveItem({ product, clearItemFromCart }) {
  const handleRemove = () => {
    clearItemFromCart(product.id);
    toast.success('Item removed from cart');
  };

  return (
    <button
      className="ml-4 text-red-600 hover:text-red-800"
      onClick={handleRemove}
    >
      <PiTrash className="h-5 w-5" />
    </button>
  );
}
