import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

interface Product {
  id: number;
  title: string;
  price: string;
  category: string;
  author_name: string;
  cover_path: string | null;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const delay = search ? 400 : 0;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = search ? { search } : {};
        const { data } = await api.get('/products', { params });
        if (!cancelled) setProducts(data.products);
      } catch {
        if (!cancelled) setError('Failed to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500 text-center py-16">No products found.</p>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}