import React, { useState } from 'react';
import { Popover, Textarea, Button, ActionIcon, Text, Title } from 'rizzui';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/20/solid';
import { PiTrashFill } from 'react-icons/pi';
import toast from 'react-hot-toast';

interface RefuseCasePopoverProps {
  caseId: string;
  title: string;
  description: string;
  onRefuse: (caseId: string, reason: string) => void;
}

const RefuseCasePopover: React.FC<RefuseCasePopoverProps> = ({
  caseId,
  title,
  description,
  onRefuse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const {user} = useAuth()

  const handleConfirm = async () => {
    if (reason.trim()) {
      setIsLoading(true);
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/cases/refuse-case/${caseId}`,
          { reason },
          {withCredentials: true}
        );

        if (response.status === 200) {
          onRefuse(caseId, reason);
          toast.success('Case refused successfully!', {
            position: 'top-right',
            duration: 2000,
          });
          setIsOpen(false);
          setReason(''); // Reset the input after submission
          setTimeout(() => {
            window.location.reload(); // Reload the page after a short delay
          }, 3000);
        } else {
          toast.error('Failed to refuse the case', {
            position: 'top-right',
            duration: 3000,
          });
        }
      } catch (error) {
        toast.error('Error refusing case', {
          position: 'top-right',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Popover placement="top" isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Refuser le cas'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ArchiveBoxXMarkIcon className="h-4 w-4" />
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
            <Textarea
              placeholder="Raison de refus"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={handleConfirm}
                isLoading={isLoading}
                disabled={!reason.trim()}
              >
                Soumettre
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};

export default RefuseCasePopover;
