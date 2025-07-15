import { useState } from 'react';
import { Popover, ActionIcon, Button, Title, Text } from 'rizzui';
import { PiPhonePlus, PiPlusCircle } from 'react-icons/pi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

type CreateMobileUserPopoverProps = {
  title: string;
  doctorName: string;
  caseID?: string | null;
};

export default function CreateMobileUserPopover({
  title,
  doctorName,
  caseID = null,
}: CreateMobileUserPopoverProps) {
  const {user} = useAuth()
  const [loading, setLoading] = useState(false); // Manage loading state

  const handleCreateMobileUser = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = '/users/createMobileUser';
    const url = `${apiUrl}${endpoint}`;

    if (!caseID) {
      toast.error('User ID is missing.');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      // Sending a POST request to create a mobile user
      const response = await toast.promise(
        axios.post(
          url,
          {
            id: caseID,
            role: 'customer',
          },
          {
            withCredentials: true, // Ensure cookies are sent with the request
          }
        ),
        {
          loading: 'Création du compte mobile en cours...', // Message affiché pendant le chargement
          success: 'Compte mobile créé avec succès.', // Message affiché en cas de succès
          error: 'Erreur lors de la création du compte mobile.', // Message affiché en cas d'erreur
        }
      );

      // Handling the response status
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte mobile.', error);
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
          aria-label={'Create Mobile User'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          <PiPhonePlus className="h-4 w-4" />
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-0">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiPhonePlus className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              Êtes-vous certain(e) de vouloir créer un compte mobile pour{' '}
              <span className="font-bold underline">{doctorName}</span> ?
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={handleCreateMobileUser}
                disabled={loading} // Disable the button when loading
              >
                Créer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
                disabled={loading} // Disable the button when loading
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
