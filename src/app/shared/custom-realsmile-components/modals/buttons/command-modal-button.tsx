'use client';

import { PiPlusBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button, type ButtonProps } from 'rizzui';
import cn from '@/utils/class-names';

interface ModalButtonProps extends ButtonProps {
  label?: string;
  className?: string;
  customSize?: string;
  icon?: React.ReactNode;
  view: React.ReactNode;
  isClickable?: boolean;
  totalMonthsDifference?: number;
  remainingDays?: number; // Add remainingDays prop
}

export default function CommandModalButton({
  label = 'Add New',
  className,
  customSize = '500px',
  view,
  icon = <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />,
  isClickable = true,
  totalMonthsDifference, // Accept monthsDifference as prop
  remainingDays, // Accept remainingDays as prop
  ...rest
}: ModalButtonProps) {
  const { openModal } = useModal();

  const remainingMonths = 5 - (totalMonthsDifference || 0);
  const remainingDaysModif = 30 - (remainingDays || 0);
  const buttonLabel = isClickable
    ? label
    : remainingMonths <= 1
      ? `${label} (Disponible dans: ${remainingDaysModif} jours)`
      : `${label} (Disponible dans: ${remainingMonths} mois)`;

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
        {...rest}
      >
        {icon}
        {buttonLabel}
      </Button>
    </div>
  );
}
