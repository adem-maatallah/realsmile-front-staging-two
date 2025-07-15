import cn from '@/utils/class-names';
import { formatDate } from '@/utils/format-date';

interface DateCellProps {
  date: Date;
  className?: string;
  dateFormat?: string;
  dateClassName?: string;
  timeFormat?: string;
  timeClassName?: string;
}

export default function DateAgeCell({
  date,
  className,
  timeClassName,
  dateClassName,
  dateFormat = 'MMMM D, YYYY',
  timeFormat = 'h:mm A',
}: DateCellProps) {
  return (
    <div className={cn('grid gap-1', className)}>
      <time
        dateTime={formatDate(date, 'YYYY-MM-DD')}
        className={cn('flex items-center ml-4 font-medium text-gray-700 dark:text-gray-600', dateClassName)}
      >
        {formatDate(date, dateFormat)}
      </time>
      <time
        dateTime={formatDate(date, 'HH:mm:ss')}
        className={cn('text-[13px] text-gray-500 ml-4', timeClassName)}
      >
        {formatDate(date, timeFormat)}
      </time>
    </div>
  );
}
