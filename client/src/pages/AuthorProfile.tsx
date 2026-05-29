import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

interface Author {
  id: number;
  name: string;
  created_at: string;
  product_count: number;
  total_sales: number;
}

interface Product {
  id: number;
  title: string;
  price: string;
  category: string;
  cover_path: string | null;
  author_id: number;
  author_name: string;
}

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAuthor() {
      try {
        const { data } = await api.get(`/authors/${id}`);
        if (!cancelled) {
          setAuthor(data.author);
          setProducts(data.products);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            isAxiosError(err) && err.response?.status === 404
              ? 'Author not found.'
              : 'Failed to load author profile.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAuthor();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !author) return <ErrorMessage message={error ?? 'Author not found.'} />;

  const memberSince = new Date(author.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto">

      {/* Author card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white text-3xl font-black shrink-0">
            {author.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">{author.name}</h1>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              Author
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Member since {memberSince}
            </p>
          </div>

          <div className="ml-auto flex gap-10">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{author.product_count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{author.total_sales}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Products by {author.name}
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-16">
          No products yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

    </div>
  );
}
