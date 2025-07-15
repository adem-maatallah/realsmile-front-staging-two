import Image from 'next/image';
import { toCurrency } from '@/utils/to-currency';
import Link from 'next/link';
import { routes } from '@/config/routes';
import SimpleBar from '@/components/ui/simplebar';
import { Empty, Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import { format } from 'date-fns';

export default function OrderProducts({
  items,
  className,
  showControls,
  itemClassName,
  currency, // Add currency as a prop to OrderProducts
}: {
  items: any[]; // Adjusted to handle order items from the fetched API response
  className?: string;
  itemClassName?: string;
  showControls?: boolean;
  currency: string; // Currency prop
}) {
  if (!items?.length) {
    return (
      <div className="pb-3">
        <Empty />
      </div>
    );
  }

  return (
    <SimpleBar className={cn('h-[calc(50vh_-_170px)] pb-3', className)}>
      <div className={cn('grid gap-3.5', className)}>
        {items.map((item) => (
          <div
            key={item?.id}
            className={cn(
              'group relative flex items-center justify-between',
              itemClassName
            )}
          >
            <div className="flex items-center pe-3">
              <figure className="relative aspect-[4/4.5] w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {/* Use the first image from imageUrls array */}
                <Image
                  src={
                    item?.product?.imageUrls?.[0] ||
                    '/path/to/default-image.jpg'
                  } // Fallback to a default image
                  alt={item?.product?.name} // Product name from the product object
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw"
                  className="h-full w-full object-cover"
                />
              </figure>
              <div className="ps-3">
                <Title
                  as="h3"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  <Link
                    href={
                      /* routes.eCommerce.productDetails(item?.product?.slug) */ '#'
                    }
                  >
                    {item?.product?.name}{' '}
                    {/* Product name from the API response */}
                  </Link>
                </Title>
                <div className="text-gray-500">
                  {item?.price + ' ' + currency} x {item?.quantity}
                </div>
                {/* Conditionally display availableDate and endDate */}
                {item?.product?.isLimitDate && (
                  <div className="text-xs text-gray-500">
                    {item?.product?.availableDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          Available from:
                        </span>
                        <span>
                          {format(
                            new Date(item?.product?.availableDate),
                            'MMMM dd, yyyy'
                          )}
                        </span>
                      </div>
                    )}
                    {item?.product?.endDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          Ends At:
                        </span>
                        <span>
                          {format(
                            new Date(item?.product?.endDate),
                            'MMMM dd, yyyy'
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 font-medium text-gray-700">
              {item?.price * item?.quantity + ' ' + currency}
            </div>
          </div>
        ))}
      </div>
    </SimpleBar>
  );
}
