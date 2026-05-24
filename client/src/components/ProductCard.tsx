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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {product.cover_path ? (
          <img
            src={getCoverUrl(product.cover_path)}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No cover
          </div>
        )}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{product.author_name}</span>
            <span className="font-bold text-gray-900">${price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}