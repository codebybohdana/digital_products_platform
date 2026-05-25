import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getCoverUrl, triggerDownload } from '../api/client';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: number;
  price_paid: string;
  purchased_at: string;
  product_id: number;
  title: string;
  category: string;
  cover_path: string | null;
  file_name: string;
  author_name: string;
}

export default function MyPurchases() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  if (!user || user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        const { data } = await api.get('/orders/my');
        if (!cancelled) setOrders(data.orders);
      } catch {
        if (!cancelled) setError('Failed to load purchases.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  async function handleDownload(productId: number, fileName: string) {
    setDownloading(productId);
    try {
      await triggerDownload(productId, fileName);
    } catch {
      // silent
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Purchases</h1>

      {loading && (
        <p className="text-gray-500 text-center py-16">Loading...</p>
      )}
      {error && (
        <p className="text-red-600 text-center py-16">{error}</p>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No purchases yet.</p>
          <Link to="/" className="text-gray-900 underline hover:text-gray-600">
            Browse products
          </Link>
        </div>
      )}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
            >
              {order.cover_path ? (
                <img
                  src={getCoverUrl(order.cover_path)}
                  alt={order.title}
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">
                  No cover
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{order.title}</p>
                <p className="text-sm text-gray-500">{order.author_name} · {order.category}</p>
                <p className="text-sm text-gray-400 mt-1">
                  ${parseFloat(order.price_paid).toFixed(2)} ·{' '}
                  {new Date(order.purchased_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleDownload(order.product_id, order.file_name)}
                disabled={downloading === order.product_id}
                className="shrink-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {downloading === order.product_id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
