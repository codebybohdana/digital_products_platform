import { Link } from 'react-router-dom';
import { getCoverUrl } from '../api/client';

interface Product {
  id: number;
  title: string;
  price: string;
  category: string;
  author_name: string;
  cover_path: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = parseFloat(product.price).toFixed(2);

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        {product.cover_path ? (
          <img
            src={getCoverUrl(product.cover_path)}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm dark:bg-gray-700">
            No cover
          </div>
        )}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 dark:text-gray-400">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-900 truncate dark:text-gray-100">{product.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{product.author_name}</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">${price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}