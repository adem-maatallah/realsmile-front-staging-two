import { Title, Text, ActionIcon, Button, Popover } from 'rizzui';
import { PiMessengerLogo, PiNoteBold, PiTrashFill } from 'react-icons/pi';
import React from 'react';
import ModifiableNoteModal from '../modals/modifiable-note-modal';
import ModalButton from '../../modal-button';

type DeletePopoverProps = {
  title: string;
  description: string;
  onDelete: () => void;
  caseId: string;
  setCasesData?: any;
  caseData?: any;
  isLabo?: boolean;
  isLaboAdmin?: boolean;
  updateUrl?: string;
};

export default function CustomModifiableNotePopover({
  title,
  description,
  onDelete,
  caseId,
  setCasesData,
  caseData,
  isLabo = false,
  isLaboAdmin = false,
  updateUrl,
}: DeletePopoverProps) {
  return (
    <Popover placement="left">
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'View Note'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          {isLaboAdmin ? (
            <PiNoteBold className="h-4 w-4" />
          ) : (
            <PiMessengerLogo className="h-4 w-4" />
          )}
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-0">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiMessengerLogo className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {description && description.trim().length > 0
                ? description
                : 'Est que vous voulez ajouter une note ?'}
            </Text>
            <div className="flex items-center justify-end">
              {description && description.trim().length > 0 ? (
                <ModalButton
                  label="Modifier"
                  view={
                    <ModifiableNoteModal
                      caseId={caseId}
                      note={description}
                      setCasesData={setCasesData}
                      caseData={caseData}
                      isLabo={isLabo}
                      isLaboAdmin={isLaboAdmin}
                      updateUrl={updateUrl}
                    />
                  }
                  size="sm"
                  className="me-1.5 h-7"
                  icon={
                    isLaboAdmin ? (
                      <PiNoteBold className="me-1.5 h-4 w-4" />
                    ) : (
                      <PiMessengerLogo className="me-1.5 h-4 w-4" />
                    )
                  }
                ></ModalButton>
              ) : (
                <>
                  <ModalButton
                    label="Oui"
                    view={
                      <ModifiableNoteModal
                        caseId={caseId}
                        note={description}
                        setCasesData={setCasesData}
                        caseData={caseData}
                        isLabo={isLabo}
                        isLaboAdmin={isLaboAdmin}
                        updateUrl={updateUrl}
                      />
                    }
                    size="sm"
                    className="me-1.5 h-7"
                    icon={
                      isLaboAdmin ? (
                        <PiNoteBold className="me-1.5 h-4 w-4" />
                      ) : (
                        <PiMessengerLogo className="me-1.5 h-4 w-4" />
                      )
                    }
                  ></ModalButton>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => setOpen(false)}
                  >
                    Non
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
