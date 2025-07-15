import { CartItem, Product, ProductColor } from '@/types';
import { generateSlug } from '@/utils/generate-slug';

interface CartProduct extends Omit<Product, 'colors' | 'sizes'> {
  color: ProductColor;
  size: number;
}

export function generateCartProduct(product: CartProduct): CartItem {
  return {
    id: product?.id,
    name: product?.title,
    slug: product?.slug,
    description: product?.description,
    image: product?.thumbnail,
    price: product?.price,
    quantity: 1,
    size: product.size,
    color: product.color,
  };
}
