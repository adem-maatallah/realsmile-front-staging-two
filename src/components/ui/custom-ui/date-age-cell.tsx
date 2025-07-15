import cn from '@/utils/class-names';
import { formatDate } from '@/utils/format-date';

interface DateAgeCellProps {
  date: Date | string; // Allow both Date object and string
  className?: string;
  dateFormat?: string;
  dateClassName?: string;
}

export default function DateAgeCell({
  date,
  className,
  dateClassName,
  dateFormat = 'D MMMM YYYY', // Corrected default value assignment
}: DateAgeCellProps) {
  const calculateAge = (birthdate: Date) => {
    const currentYear = new Date().getFullYear();
    const birthYear = birthdate.getFullYear();
    return currentYear - birthYear;
  };

  // Parse date if it's a string
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return (
    <div className={cn('grid gap-1', className)}>
      <time
        dateTime={formatDate(parsedDate, 'YYYY-MM-DD')}
        className={cn('font-medium text-gray-700', dateClassName)}
      >
        {formatDate(parsedDate, dateFormat)}
      </time>
      <span className={cn('text-[13px] text-gray-500', dateClassName)}>
        {parsedDate instanceof Date && !isNaN(parsedDate.getTime())
          ? `${calculateAge(parsedDate)} ans`
          : 'Invalid Date'}
      </span>
    </div>
  );
}
