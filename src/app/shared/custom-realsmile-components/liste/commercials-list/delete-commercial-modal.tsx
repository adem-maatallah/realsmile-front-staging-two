import { Modal, Button, Text, ActionIcon } from "rizzui";
import { XMarkIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  commercialId,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  commercialId: number | null;
  onConfirm: () => void;
}) {
  const {user} = useAuth()

  const handleDelete = async () => {
    if (!commercialId) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/commercials/${commercialId}`, {
        withCredentials: true
      });
      toast.success("Commercial deleted successfully");
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting commercial:", error);
      toast.error("Failed to delete commercial");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-auto px-7 pb-8 pt-6">
        <div className="mb-7 flex items-center justify-between">
          <Text as="strong">Delete Commercial</Text>
          <ActionIcon size="sm" variant="text" onClick={onClose}>
            <XMarkIcon className="h-auto w-6" strokeWidth={1.8} />
          </ActionIcon>
        </div>
        <Text className="mb-6 text-md">
          Are you sure you want to delete this commercial? This action cannot be undone.
        </Text>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
