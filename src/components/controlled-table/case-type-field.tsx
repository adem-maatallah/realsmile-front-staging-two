import { Select, type SelectProps, type SelectOption } from 'rizzui';
import cn from '@/utils/class-names';

type CaseTypeFieldProps = SelectProps<SelectOption>;

export default function CaseTypeField({
  placeholder = 'Sélectionnez le type de cas',
  dropdownClassName,
  ...props
}: CaseTypeFieldProps) {
  return (
    <Select
      inPortal={false}
      placeholder={placeholder}
      selectClassName="h-9 min-w-[220px]"
      dropdownClassName={cn('p-1.5 !z-0', dropdownClassName)}
      optionClassName="h-9"
      {...props}
    />
  );
}
