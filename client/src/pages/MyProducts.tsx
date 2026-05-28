import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');

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

  const totalSales = products.reduce((sum, p) => sum + (parseInt(p.sales_count) || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + parseFloat(p.total_revenue || '0'), 0);

  const filteredProducts = products
    .filter(p => statusFilter === 'all' ? true : statusFilter === 'active' ? p.is_active : !p.is_active)
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'price_high') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'price_low') return parseFloat(a.price) - parseFloat(b.price);
      return 0;
    });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Products</h1>
        <Link
          to="/products/add"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4 dark:text-gray-400">No products yet.</p>
          <Link to="/products/add" className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400">
            Add your first product
          </Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Products</p>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{products.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">total</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Sales</p>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalSales}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">all time</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Revenue</p>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">earned</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {(['all', 'active', 'hidden'] as const).map(tab => {
                const count = tab === 'all' ? products.length
                  : tab === 'active' ? products.filter(p => p.is_active).length
                  : products.filter(p => !p.is_active).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      statusFilter === tab
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'border border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-100'
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
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
                {filteredProducts.map((product, i) => (
                  <tr
                    key={product.id}
                    className={i < filteredProducts.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate dark:text-gray-100">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{product.category}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {product.is_active ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-400">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {parseInt(product.sales_count)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      ${parseFloat(product.total_revenue).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggle(product.id)}
                          disabled={toggling === product.id}
                          className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                          className="px-3 py-1 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
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
        </>
      )}
    </div>
  );
}
