import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Education', 'Design', 'Business', 'Programming', 'Marketing',
  'Finance', 'Photography', 'Music', 'Writing', 'Health & Fitness',
  'Personal Development', 'Templates', 'Other',
];

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!user || user.role !== 'author') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) {
      setError('Category is required.');
      return;
    }
    if (!file) {
      setError('Product file is required.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('file', file);
    if (cover) formData.append('cover', cover);

    setError(null);
    setSubmitting(true);
    try {
      await api.post('/products', formData);
      navigate('/my-products');
    } catch (err) {
      setError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? 'Something went wrong.')
          : 'Something went wrong.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = CATEGORIES.filter(c =>
    c.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 dark:text-gray-100">Add Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-8 space-y-6 dark:bg-gray-800 dark:border-gray-700"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Price ($) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Category *
            </label>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => { setIsOpen(o => !o); setDropdownSearch(''); }}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-400"
              >
                <span className={category ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                  {category || 'Select category'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16" height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  className={`shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-600">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search categories..."
                    value={dropdownSearch}
                    onChange={e => setDropdownSearch(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-b border-gray-200 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.map(cat => (
                      <div
                        key={cat}
                        onClick={() => { setCategory(cat); setIsOpen(false); setDropdownSearch(''); }}
                        className={`px-4 py-2 cursor-pointer text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 ${cat === category ? 'bg-gray-100 font-medium dark:bg-gray-700' : ''}`}
                      >
                        {cat}
                      </div>
                    ))}
                    {filteredCategories.length === 0 && (
                      <p className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">No categories found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Product File * <span className="font-normal text-gray-400 dark:text-gray-500">(PDF, ZIP, DOCX — max 50 MB)</span>
          </label>
          <input
            type="file"
            required
            accept=".pdf,.zip,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:cursor-pointer dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Cover Image <span className="font-normal text-gray-400 dark:text-gray-500">(JPG, PNG — optional)</span>
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:cursor-pointer dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Publishing...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}
