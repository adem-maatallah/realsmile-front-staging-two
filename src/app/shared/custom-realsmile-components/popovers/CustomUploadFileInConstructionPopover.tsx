import {Title, Text, ActionIcon, Button, Popover} from 'rizzui';
import TrashIcon from '@/components/icons/trash';
import {PiDownload, PiMessengerLogo, PiNoteBold, PiTrashFill, PiUpload} from 'react-icons/pi';
import CreateUser from "@/app/shared/roles-permissions/create-user";
import ModalButton from "@/app/shared/modal-button";
import React from "react";
import NoteModal from "@/app/shared/custom-realsmile-components/modals/NoteModal";
import InConstructionModal from "@/app/shared/custom-realsmile-components/modals/in-construction-modal";

type DeletePopoverProps = {
    title: string;
    description: string;
    onDelete: () => void;
    caseId: string;
    setCasesData?: any
    caseData?: any
    isLabo?: boolean
    isLaboAdmin?: boolean
};

export default function CustomUploadFileInConstructionPopover({
                                                                  title,
                                                                  description,
                                                                  onDelete,
                                                                  caseId,
                                                                  setCasesData,
                                                                  caseData,
                                                                  isLabo = false,
                                                                  isLaboAdmin = false
                                                              }: DeletePopoverProps) {
    return (
        <Popover placement="left">
            <Popover.Trigger>
                <ActionIcon
                    size="sm"
                    variant="outline"
                    aria-label={'Delete Item'}
                    className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
                >
                    {isLabo ? <PiUpload className="h-4 w-4"/> : <PiDownload className="h-4 w-4"/>}
                </ActionIcon>
            </Popover.Trigger>
            <Popover.Content className="z-0">
                {({setOpen}) => (
                    <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
                        <Title
                            as="h6"
                            className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
                        >
                            <PiMessengerLogo className="me-1 h-[17px] w-[17px]"/> {title}
                        </Title>
                        <Text className="mb-2 leading-relaxed text-gray-500">
                            example 2 files || no files
                        </Text>
                        <div className="flex items-center justify-end">
                            <ModalButton
                                label="Upload"
                                view={<InConstructionModal caseId={caseId}
                                />}
                                size="sm"
                                className="me-1.5 h-7"
                                icon={isLabo ? <PiUpload className="me-1.5 h-4 w-4"/> :
                                    <PiDownload className="me-1.5 h-4 w-4"/>}

                            >
                            </ModalButton>
                        </div>

                    </div>
                )}
            </Popover.Content>
        </Popover>
    );
}
