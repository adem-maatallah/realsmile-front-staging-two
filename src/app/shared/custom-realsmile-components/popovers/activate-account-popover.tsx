import { useState } from 'react';
import { Popover, ActionIcon, Button, Title, Text } from 'rizzui';
import { PiArrowClockwise, PiCheck, PiUser, PiUserBold } from 'react-icons/pi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

type DeletePopoverProps = {
  title: string;
  doctorName: string;
  caseID?: string | null;
};

export default function ActivateAccountPopover({
  title,
  doctorName,
  caseID = null,
}: DeletePopoverProps) {
  const {user} = useAuth()
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Manage loading state

  const handleActivation = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/users/updateUserActivationStatus';
    const url = `${apiUrl}${endpoint}`;

    if (!caseID) {
      toast.error('User ID is missing.');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      // Sending a POST request to update the activation status of a user
      const response = await toast.promise(
        axios.post(
          url,
          { id: caseID },
          {
            withCredentials: true, // Ensure cookies are sent with the request
          }
        ),
        {
          loading: 'Activation du compte en cours...', // Message affiché pendant le chargement
          success: 'Utilisateur activé avec succès.', // Message affiché en cas de succès
          error: "Erreur lors de l'activation de l'utilisateur.", // Message affiché en cas d'erreur
        }
      );

      // Handling the response status
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de l'utilisateur.", error);
    } finally {
      setLoading(false); // Set loading state to false after the process
    }
  };

  return (
    <Popover placement="left">
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Activate Account'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          <PiCheck className="h-4 w-4" />
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-0">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiUserBold className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              Êtes-vous certain(e) de vouloir procéder à l'activation du compte
              du <span className="font-bold underline">{doctorName}</span> ?
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={handleActivation}
                disabled={loading} // Disable the button when loading
              >
                Activer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
                disabled={loading} // Disable the button when loading
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
