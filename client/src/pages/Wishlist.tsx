import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlistedProducts, loading } = useWishlist();

  if (!user || user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Saved Products</h1>

      {loading && <Spinner />}

      {!loading && wishlistedProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No saved products yet. Browse the catalog and save products you like.
          </p>
          <Link
            to="/"
            className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400"
          >
            Browse catalog
          </Link>
        </div>
      )}

      {!loading && wishlistedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
