import {useModal} from "@/app/shared/modal-views/use-modal";
import {ActionIcon, Title} from "rizzui";
import {PiXBold} from "react-icons/pi";
import React from "react";
import EditUser from "@/app/shared/custom-realsmile-components/liste/users-list/edit-user";

export function EditUserModalView({ user }: { user: any }) {
    const {closeModal} = useModal();
    return (
        <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
            <div className="mb-7 flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                    Modifer l'utilisateur
                </Title>
                <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
                    <PiXBold className="h-auto w-5"/>
                </ActionIcon>
            </div>
            <EditUser isModalView={false} user={user} />
        </div>
    );
}
