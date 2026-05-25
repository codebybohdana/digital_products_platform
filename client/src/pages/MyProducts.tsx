import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface MyProduct {
  id: number;
  title: string;
  category: string;
  price: string;
  is_active: boolean;
  sales_count: string;
  total_revenue: string;
}

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'author') return;
    let cancelled = false;

    async function fetchProducts() {
      try {
        const { data } = await api.get('/products/my');
        if (!cancelled) setProducts(data.products);
      } catch {
        if (!cancelled) setError('Failed to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || user.role !== 'author') {
    return <Navigate to="/" replace />;
  }

  async function handleToggle(id: number) {
    setToggling(id);
    try {
      await api.patch(`/products/${id}/toggle`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch {
      // keep existing state on failure
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(
        isAxiosError(err)
          ? (err.response?.data?.error ?? 'Delete failed.')
          : 'Delete failed.'
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          to="/products/add"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading && <p className="text-gray-500 text-center py-16">Loading...</p>}
      {error && <p className="text-red-600 text-center py-16">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No products yet.</p>
          <Link to="/products/add" className="text-gray-900 underline hover:text-gray-600">
            Add your first product
          </Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className={i < products.length - 1 ? 'border-b border-gray-100' : ''}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category}</td>
                  <td className="px-4 py-3 text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {product.is_active ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {parseInt(product.sales_count)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    ${parseFloat(product.total_revenue).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggle(product.id)}
                        disabled={toggling === product.id}
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {toggling === product.id
                          ? '...'
                          : product.is_active
                          ? 'Hide'
                          : 'Show'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deleting === product.id}
                        className="px-3 py-1 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {deleting === product.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
