import TrashIcon from '@/components/icons/trash';
import axiosInstance from '@/utils/axiosInstance';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiTrashFill } from 'react-icons/pi';
import { ActionIcon, Button, Popover, Text, Title } from 'rizzui';

export default function DeleteUserPopover({
  title,
  description,
  onDelete,
  userId,
  token,
}: {
  title: string;
  description: string;
  onDelete: (id: string) => void;
  userId: string;
  token: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/users/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {
        onDelete(userId);
        toast.success('Utilisateur supprimé avec succès');
        setIsOpen(false);
      } else {
        toast.success("Erreur Lors de la suppression de l'utilisateur");
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover placement="left">
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Delete Item'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          <TrashIcon className="h-4 w-4" />
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-0">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiTrashFill className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {description}
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                Oui
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Non
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
