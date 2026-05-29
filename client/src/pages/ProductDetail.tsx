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

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const price = parseFloat(product.price).toFixed(2);
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        {product.cover_path ? (
          <img
            src={getCoverUrl(product.cover_path)}
            alt={product.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400 dark:bg-gray-700">
            No cover
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide dark:text-gray-400">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1 dark:text-gray-100">{product.title}</h1>
              <p className="text-gray-500 mt-1 dark:text-gray-400">by {product.author_name}</p>
            </div>
            <span className="text-3xl font-bold text-gray-900 shrink-0 dark:text-gray-100">${price}</span>
          </div>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed dark:text-gray-300">{product.description}</p>
          )}

          <p className="mt-6 text-sm text-gray-400">
            {product.file_name}
            {product.file_size ? ` · ${formatFileSize(product.file_size)}` : ''}
          </p>

          <div className="mt-8">{renderAction()}</div>
        </div>
      </div>
    </div>
  );
}
