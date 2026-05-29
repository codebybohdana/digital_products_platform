import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

interface Product {
  id: number;
  title: string;
  price: string;
  category: string;
  author_name: string;
  cover_path: string | null;
}

const FILTER_CATEGORIES = [
  "All",
  "Education",
  "Design",
  "Business",
  "Programming",
  "Marketing",
  "Finance",
  "Photography",
  "Music",
  "Writing",
  "Health & Fitness",
  "Personal Development",
  "Templates",
  "Other",
];

const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Secure payments",
    desc: "Safe and encrypted",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Support creators",
    desc: "Every purchase helps",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Instant access",
    desc: "Download right away",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: "Quality products",
    desc: "Curated with care",
  },
];

export default function Catalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cols, setCols] = useState(4);
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/products")
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== "All")
      result = result.filter((p) => p.category === selectedCategory);
    if (search)
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    switch (selectedSort) {
      case "Oldest":
        result.sort((a, b) => a.id - b.id);
        break;
      case "Price: Low to High":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "Price: High to Low":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default:
        result.sort((a, b) => b.id - a.id);
    }
    return result;
  }, [products, selectedCategory, search, selectedSort]);

  const gridClass = {
    3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    4: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
    5: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
  }[cols];

  const secondaryBtnClass =
    "border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <div>
      {/* Hero */}
      <section className="py-16 mb-8 px-8 lg:px-16">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-8 dark:border-gray-700 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Digital Marketplace
            </div>

            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4 animate-fadeInUp dark:text-gray-100">
              Buy and sell
              <br />
              digital products
            </h1>

            <p className="text-gray-500 text-lg mb-8 dark:text-gray-400">
              Templates, guides, and digital files from independent creators
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Browse products
              </button>

              {!user && (
                <Link to="/register" className={secondaryBtnClass}>
                  Start selling
                </Link>
              )}
              {user?.role === "author" && (
                <Link to="/products/add" className={secondaryBtnClass}>
                  Add product
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <img
              src="/hero.svg"
              alt=""
              className="max-w-md w-full animate-float"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <div id="products">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">
          Products
        </h2>

        {/* Toolbar */}
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() =>
                  pillsRef.current?.scrollBy({ left: -200, behavior: "smooth" })
                }
                className="shrink-0 p-1.5 rounded-full border border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div
                ref={pillsRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
              >
                {FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "border border-gray-300 text-gray-600 hover:border-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  pillsRef.current?.scrollBy({ left: 200, behavior: "smooth" })
                }
                className="shrink-0 p-1.5 rounded-full border border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <div className="flex items-center gap-1">
              {[3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    cols === n
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "border border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && <Spinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && filteredProducts.length === 0 && (
          <p className="text-gray-500 text-center py-16 dark:text-gray-400">
            No products found.
          </p>
        )}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className={gridClass}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="text-gray-400 shrink-0 mt-0.5 dark:text-gray-500">
              {icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* About */}
      <section id="about" className="mt-24 mb-16">
        {/* Top divider with label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">
            About Folio
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-16 items-center mb-16">
          {/* Left - main text */}
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Built for independent
              <br />
              creators
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-4">
              Folio is a marketplace where creators sell digital products
              directly to their audience - templates, guides, courses, and files
              - without middlemen.
            </p>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Every purchase gives instant access. Every sale goes directly to
              the creator. Simple, fair, and built on trust.
            </p>
          </div>

          {/* Right - stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "10+", label: "Categories" },
              { number: "100%", label: "Instant access" },
              { number: "$0", label: "Hidden fees" },
              { number: "∞", label: "Downloads" },
            ].map(({ number, label }) => (
              <div
                key={label}
                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                  {number}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
