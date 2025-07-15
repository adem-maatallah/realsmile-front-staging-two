import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button, Input } from 'rizzui';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function ShippingModal({
  isOpen,
  onClose,
  orderReference,
  mutate,
}: any) {
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user} = useAuth()

  const handleConfirm = async () => {
    if (!trackingUrl) {
      toast.error('Please enter a tracking URL.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/orders/${orderReference}/shipping`,
        JSON.stringify({ trackingUrl }),
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response) {
        throw new Error('Failed to update shipping status');
      }

      toast.success('Order updated to shipping status.');
      mutate(); // Trigger SWR revalidation
      onClose();
    } catch (error) {
      toast.error('Error updating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* Transition settings here */}
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Enter Shipping Tracking URL
              </Dialog.Title>
              <div className="mt-4">
                <Input
                  placeholder="https://tracking-url.com"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm'}
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
