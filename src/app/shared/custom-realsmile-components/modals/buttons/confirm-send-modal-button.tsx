'use client';

import { PiCurrencyDollar } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button, type ButtonProps } from 'rizzui';
import cn from '@/utils/class-names';
import { BiSend } from 'react-icons/bi';

interface ModalButtonProps extends ButtonProps {
  className?: string;
  customSize?: string;
  icon?: React.ReactNode;
  view: React.ReactNode;
  isClickable?: boolean;
}

export default function ConfirmSendButton({
  className,
  customSize = '500px',
  view,
  icon = <BiSend className="h-4 w-4" />,
  isClickable = true,
  ...rest
}: ModalButtonProps) {
  const { openModal } = useModal();
  const defaultLabel = 'Default Label';

  return (
    <div
      className={cn(
        'mt-5 w-full text-xs capitalize @lg:w-auto sm:text-sm lg:mt-0',
        className
      )}
    >
      <Button
        onClick={() =>
          openModal({
            view,
            customSize,
          })
        }
        disabled={!isClickable}
        className="hover:!border-gray-900 hover:text-gray-700"
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
          border: '0.5px solid lightgray',
          borderRadius: '5px',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
        }}
        {...rest}
      >
        {icon}
      </Button>
    </div>
  );
}
