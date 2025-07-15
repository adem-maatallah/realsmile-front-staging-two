'use client';

import { Button, Modal } from 'rizzui';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Order">
      <div className="p-6 text-center">
        <p className="text-lg font-medium text-gray-700">
          Are you sure you want to place the order?
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary px-6 py-2 text-white hover:bg-primary-dark"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
