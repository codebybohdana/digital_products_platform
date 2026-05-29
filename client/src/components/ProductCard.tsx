import { Link } from 'react-router-dom';
import { getCoverUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

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
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product.id);

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        {user?.role === 'user' && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm hover:scale-110 transition-transform"
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {saved ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            )}
          </button>
        )}
        <div className="w-full aspect-square overflow-hidden">
          {product.cover_path ? (
            <img
              src={getCoverUrl(product.cover_path)}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm dark:bg-gray-700">
              No cover
            </div>
          )}
        </div>
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