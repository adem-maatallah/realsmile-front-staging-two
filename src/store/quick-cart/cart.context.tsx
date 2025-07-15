'use client';

import {
  useReducer,
  useContext,
  createContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cartReducer, initialState } from './cart.reducer';
import useSWR, { mutate } from 'swr';
import toast from 'react-hot-toast'; // Import toast from react-hot-toast
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url:string) =>
  axiosInstance(url).then((res) => res.data);

const CART_KEY = 'cart';
export const cartContext = createContext(null);

export const useCart = () => {
  const context = useContext(cartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [savedCart, saveCart] = useLocalStorage(
    CART_KEY,
    JSON.stringify(initialState)
  );
  const [state, dispatch] = useReducer(
    cartReducer,
    savedCart ? JSON.parse(savedCart) : initialState
  );

  const shouldFetchCart =
    user?.id &&
    user&&
    (user.role === 'admin' || user.role === 'doctor');

  const { data: cartData, mutate: mutateCart } = useSWR(
    shouldFetchCart
      ? `/carts/${user.id}`
      : null,
    (url) => fetcher(url)
  );

  // Sync SWR cart data to the cart state
  useEffect(() => {
    if (cartData && cartData.cartItems && Array.isArray(cartData.cartItems)) {
      const transformedItems = cartData.cartItems.map((item) => ({
        id: item.productId,
        name: item.product.name,
        description: item.product.description,
        image: item.product.imageUrls[0],
        price: item.product.price, // Use the correct price for the country
        quantity: item.quantity,
        stock: item.product.stock, // Ensure stock is included
        availableDate: item.product.availableDate
          ? new Date(item.product.availableDate).toISOString()
          : null, // Include available date, format as ISO string if exists
        endDate: item.product.endDate
          ? new Date(item.product.endDate).toISOString()
          : null, // Include end date, format as ISO string if exists
        isLimitDate: item.product.isLimitDate, // Include the limit date flag
      }));

      dispatch({ type: 'SET_CART', items: transformedItems });
    }
  }, [cartData]);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    saveCart(JSON.stringify(state));
  }, [state, saveCart]);

  // Add item to cart with stock validation and toast.promise
  const addItemToCart = useCallback(
    async (product, quantity) => {
      if (!user?.id ) return;

      if (quantity > product.stock) {
        toast.error(`Insufficient stock. Only ${product.stock} available.`);
        return;
      }

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_API_URL}/carts`,
            JSON.stringify({
              customerId: user.id,
              productId: product.id,
              quantity,
              userCountry: user.country, // Send user's country
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response) {
            const { message } = await response.data;
            throw new Error(message || 'Failed to add product to cart');
          }

          const updatedCart = await response.data;

          // Optimistically update the UI
          mutateCart();
          resolve(updatedCart);
        } catch (error) {
          console.error('Error adding product to cart', error);
          reject(error.message || 'Failed to add product to cart');
        }
      });

      toast.promise(promise, {
        loading: 'Adding product...',
        success: 'Product added to cart!',
        error: 'Failed to add product.',
      });
    },
    [user, mutateCart]
  );

  // Modify product quantity with toast.promise
  const modifyProductQuantity = useCallback(
    async (productId, quantity) => {
      const cartItem = state.items.find((item) => item.id === productId);
      if (!cartItem) return;

      if (quantity > cartItem.stock) {
        toast.error(`Insufficient stock. Only ${cartItem.stock} available.`);
        return;
      }

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.put(
            `/carts/${user.id}/${productId}`,
            JSON.stringify({ quantity }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response) {
            const { message } = await response.data;
            throw new Error(message || 'Failed to modify product quantity');
          }

          // Optimistically update the UI
          mutateCart();
          resolve();
        } catch (error) {
          console.error('Error modifying product quantity', error);
          reject(error.message || 'Failed to update quantity');
        }
      });

      toast.promise(promise, {
        loading: 'Updating quantity...',
        success: 'Product quantity updated!',
        error: 'Failed to update quantity.',
      });
    },
    [user, state.items, mutateCart]
  );

  // Clear individual cart item with toast.promise
  const clearItemFromCart = useCallback(
    async (productId) => {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.delete(
            `/carts/${user.id}/${productId}`,

          );

          if (!response) {
            const { message } = await response.data;
            throw new Error(message || 'Failed to remove product from cart');
          }

          // Optimistically update the UI
          mutateCart();
          resolve();
        } catch (error) {
          console.error('Error removing cart item', error);
          reject(error.message || 'Failed to remove product from cart');
        }
      });

      toast.promise(promise, {
        loading: 'Removing item...',
        success: 'Product removed from cart',
        error: 'Failed to remove item from cart',
      });
    },
    [user, mutateCart]
  );

  // Clear the entire cart with toast.promise
  const resetCart = useCallback(async () => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await axiosInstance.delete(
          `/carts/${user.id}`,

        );

        mutateCart();
        resolve();
      } catch (error) {
        console.error('Error clearing cart', error);
        reject('Failed to clear cart');
      }
    });

    toast.promise(promise, {
      loading: 'Clearing cart...',
      success: 'All items cleared from cart!',
      error: 'Failed to clear cart.',
    });
  }, [user, mutateCart]);

  const getItemFromCart = useCallback(
    (id) => state.items.find((item) => item.id === id),
    [state.items]
  );

  const isInCart = useCallback(
    (id) => state.items.some((item) => item.id === id),
    [state.items]
  );

  const isInStock = useCallback(
    (id) => !!state.items.find((item) => item.id === id && item.quantity > 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      ...state,
      addItemToCart,
      modifyProductQuantity,
      clearItemFromCart,
      resetCart,
      getItemFromCart,
      isInCart,
      isInStock,
    }),
    [
      state,
      addItemToCart,
      modifyProductQuantity,
      clearItemFromCart,
      resetCart,
      isInCart,
      isInStock,
    ]
  );

  return <cartContext.Provider value={value}>{children}</cartContext.Provider>;
}
