import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api, { getCoverUrl, triggerDownload } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isInCart, addToCart, removeFromCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [productRes, ordersRes] = await Promise.all([
          api.get(`/products/${id}`),
          user?.role === 'user' ? api.get('/orders/my') : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setProduct(productRes.data.product);

        if (ordersRes) {
          const alreadyOwned = ordersRes.data.orders.some(
            (o: { product_id: number }) => o.product_id === Number(id)
          );
          setOwned(alreadyOwned);
        }
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

    fetchData();
    return () => { cancelled = true; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBuy() {
    setBuying(true);
    setBuyError(null);
    try {
      await api.post('/orders', { productId: Number(id) });
      setOwned(true);
    } catch (err) {
      setBuyError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? 'Purchase failed.')
          : 'Purchase failed.'
      );
    } finally {
      setBuying(false);
    }
  }

  async function handleDownload() {
    if (!product) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await triggerDownload(Number(id), product.file_name);
    } catch {
      setDownloadError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }
  if (error || !product) {
    return <ErrorMessage message={error ?? 'Product not found.'} />;
  }

  const isOwnProduct = user?.id === product.author_id;

  function renderAction() {
    if (!user) {
      return (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="underline hover:text-gray-900 dark:hover:text-gray-100">Log in</Link>
          {' '}to purchase this product.
        </p>
      );
    }
    if (isOwnProduct) {
      return <p className="text-sm text-gray-400 text-center dark:text-gray-500">Your product</p>;
    }
    if (user.role === 'author') {
      return <p className="text-sm text-gray-400 text-center dark:text-gray-500">Authors cannot purchase products.</p>;
    }
    if (owned) {
      return (
        <div>
          {downloadError && (
            <p className="text-red-600 text-sm mb-3 text-center dark:text-red-400">{downloadError}</p>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      );
    }
    const inCart = product ? isInCart(product.id) : false;
    return (
      <div>
        {buyError && (
          <p className="text-red-600 text-sm mb-3 text-center">{buyError}</p>
        )}
        <button
          onClick={handleBuy}
          disabled={buying}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {buying ? 'Processing...' : 'Buy Now'}
        </button>
        <button
          onClick={() => product && (inCart ? removeFromCart(product.id) : addToCart(product.id))}
          className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {inCart ? 'Remove from Cart' : 'Add to Cart'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* LEFT — Cover Image */}
        <div>
          {product.cover_path ? (
            <img
              src={getCoverUrl(product.cover_path)}
              alt={product.title}
              className="w-full aspect-square object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300 dark:text-gray-600">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* RIGHT — Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            {product.category}
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {product.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">by {product.author_name}</p>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-6">
            ${parseFloat(product.price).toFixed(2)}
          </p>
          {product.description && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{product.file_name}</span>
            {product.file_size && (
              <span>· {product.file_size < 1024 * 1024
                ? `${(product.file_size / 1024).toFixed(1)} KB`
                : `${(product.file_size / (1024 * 1024)).toFixed(1)} MB`}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            {renderAction()}
          </div>
        </div>

      </div>
    </div>
  );
}
