import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from 'rizzui';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function ConfirmShipmentModal({
  isOpen,
  onClose,
  orderReference,
  mutate, // SWR mutate function to trigger revalidation
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user} = useAuth()

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/orders/${orderReference}/confirm-shipment`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response) {
        throw new Error('Failed to confirm shipment');
      }

      toast.success('Shipment confirmed successfully.');
      mutate(); // Trigger SWR revalidation
      onClose();
    } catch (error) {
      toast.error('Error confirming shipment.');
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
                Confirm Shipment
              </Dialog.Title>
              <div className="mt-4">
                <p>Are you sure you received the shipment for this order?</p>
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
                  {isSubmitting ? 'Confirming...' : 'Confirm'}
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
