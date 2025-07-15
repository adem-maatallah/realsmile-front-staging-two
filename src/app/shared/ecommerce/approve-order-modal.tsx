import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from 'rizzui';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

export default function ApproveOrderModal({
  isOpen,
  onClose,
  orderReference,
  mutate,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user} = useAuth()

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/orders/${orderReference}/approve`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response) {
        throw new Error('Failed to approve order');
      }

      toast.success('Order approved successfully.');
      mutate(); // Refresh order data
      onClose();
    } catch (error) {
      console.log(error)
      toast.error('Error approving order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Approve Order
                </Dialog.Title>
                <div className="mt-4">
                  <p>Are you sure you want to approve this order?</p>
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
                    {isSubmitting ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
