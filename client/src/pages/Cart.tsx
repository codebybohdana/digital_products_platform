import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCoverUrl } from '../api/client';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function Cart() {
  const { user } = useAuth();
  const { cartItems, loading, cartCount, cartTotal, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);

  if (!user || user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  async function handlePurchaseAll() {
    if (cartItems.length === 0) return;
    setPurchasing(true);
    try {
      for (const item of cartItems) {
        try {
          await api.post('/orders', { productId: item.product_id });
        } catch {
          // Skip already-purchased (409) or other per-item errors
        }
      }
      await clearCart();
      navigate('/purchases');
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Your Cart</h1>

      {loading && <Spinner />}

      {!loading && cartItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your cart is empty. Browse the catalog to find products you like.
          </p>
          <Link
            to="/"
            className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400"
          >
            Browse catalog
          </Link>
        </div>
      )}

      {!loading && cartItems.length > 0 && (
        <div className="flex items-start gap-6">
          {/* Item list */}
          <div className="flex-1 space-y-3">
            {cartItems.map(item => (
              <div
                key={item.product_id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 dark:bg-gray-800 dark:border-gray-700"
              >
                {item.cover_path ? (
                  <img
                    src={getCoverUrl(item.cover_path)}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0 dark:bg-gray-700">
                    No cover
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="font-semibold text-gray-900 truncate block hover:underline dark:text-gray-100"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.author_name} · {item.category}
                  </p>
                </div>

                <p className="font-bold text-gray-900 dark:text-gray-100 shrink-0">
                  ${parseFloat(item.price).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="shrink-0 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 dark:text-gray-400">
                Order Summary
              </p>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 text-lg mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePurchaseAll}
                disabled={purchasing}
                className="mt-4 w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {purchasing ? 'Processing...' : 'Purchase All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
