import Image from 'next/image';
import { Text, Title } from 'rizzui';

export default function ExpandedOrderRow({ record }: any) {
  if (record?.orderItems?.length === 0) {
    return <Text>No items available for this order.</Text>;
  }

  return (
    <div className="grid grid-cols-1 divide-y bg-gray-0 px-3.5 dark:bg-gray-50">
      {record.orderItems.map((item: any) => (
        <article
          key={item.id}
          className="flex items-center justify-between py-6 first-of-type:pt-2.5 last-of-type:pb-2.5"
        >
          <div className="flex items-start">
            <div className="relative me-4 aspect-[80/60] w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <Image
                fill
                className="object-cover"
                src={item.product.imageUrls[0]}
                alt={item.product.name}
              />
            </div>
            <header>
              <Title as="h4" className="mb-0.5 text-sm font-medium">
                {item.product.name}
              </Title>
              <Text className="mb-1 text-gray-500">
                {item.product.reference}
              </Text>
              <Text className="text-xs text-gray-500">
                Unit Price: {item.price} {item.currency}
              </Text>
            </header>
          </div>
          <div className="flex w-full max-w-xs items-center justify-between gap-4">
            <Text
              as="span"
              className="font-medium text-gray-900 dark:text-gray-700"
            >
              Quantity: {item.quantity}
            </Text>
            <Text className="font-medium text-gray-900 dark:text-gray-700">
              Total: {(item.quantity * item.price).toFixed(2)} {item.currency}
            </Text>
          </div>
        </article>
      ))}
    </div>
  );
}
