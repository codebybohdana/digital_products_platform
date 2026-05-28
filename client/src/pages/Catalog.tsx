import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
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

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Secure payments',
    desc: 'Safe and encrypted',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Support creators',
    desc: 'Every purchase helps',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Instant access',
    desc: 'Download right away',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    title: 'Quality products',
    desc: 'Curated with care',
  },
];

export default function Catalog() {
  const { user } = useAuth();
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

  const secondaryBtnClass =
    'border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800';

  return (
    <div>
      {/* Hero */}
      <section className="py-16 mb-8 px-8 lg:px-16">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-8 dark:border-gray-700 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Digital Marketplace
            </div>

            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4 animate-fadeInUp dark:text-gray-100">
              Buy and sell<br />digital products
            </h1>

            <p className="text-gray-500 text-lg mb-8 dark:text-gray-400">
              Templates, guides, and digital files from independent creators
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Browse products
              </button>

              {!user && (
                <Link to="/register" className={secondaryBtnClass}>
                  Start selling
                </Link>
              )}
              {user?.role === 'author' && (
                <Link to="/products/add" className={secondaryBtnClass}>
                  Add product
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <img src="/hero.svg" alt="" className="max-w-md w-full animate-float" />
          </div>
        </div>
      </section>

      {/* Products */}
      <div id="products">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h2>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
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

      {/* Features */}
      <div className="grid grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="text-gray-400 shrink-0 mt-0.5 dark:text-gray-500">{icon}</div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
