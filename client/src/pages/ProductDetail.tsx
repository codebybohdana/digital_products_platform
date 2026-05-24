import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api, { getCoverUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: string;
  category: string;
  cover_path: string | null;
  author_id: number;
  author_name: string;
  file_name: string;
  file_size: number | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (!cancelled) setProduct(data.product);
      } catch (err) {
        if (!cancelled) {
          setError(
            isAxiosError(err) && err.response?.status === 404
              ? 'Product not found.'
              : 'Failed to load product.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <p className="text-gray-500 text-center py-16">Loading...</p>;
  }
  if (error || !product) {
    return (
      <p className="text-red-600 text-center py-16">{error ?? 'Product not found.'}</p>
    );
  }

  const price = parseFloat(product.price).toFixed(2);
  const canBuy = user?.role === 'user';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {product.cover_path ? (
          <img
            src={getCoverUrl(product.cover_path)}
            alt={product.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
            No cover
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.title}</h1>
              <p className="text-gray-500 mt-1">by {product.author_name}</p>
            </div>
            <span className="text-3xl font-bold text-gray-900 shrink-0">${price}</span>
          </div>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          )}

          <p className="mt-6 text-sm text-gray-400">
            {product.file_name}
            {product.file_size ? ` · ${formatFileSize(product.file_size)}` : ''}
          </p>

          <div className="mt-8">
            {canBuy && (
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Buy Now
              </button>
            )}
            {!user && (
              <p className="text-center text-sm text-gray-500">
                <a href="/login" className="underline hover:text-gray-900">
                  Log in
                </a>{' '}
                to purchase this product.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}