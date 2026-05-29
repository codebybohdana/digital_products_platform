import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

interface WishlistProduct {
  id: number;
  title: string;
  price: string;
  category: string;
  author_name: string;
  cover_path: string | null;
}

interface WishlistContextType {
  wishlistedProducts: WishlistProduct[];
  loading: boolean;
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (id: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistedProducts, setWishlistedProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      setWishlistedProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api.get('/wishlist')
      .then(({ data }) => { if (!cancelled) setWishlistedProducts(data.products); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  function isWishlisted(id: number) {
    return wishlistedProducts.some(p => p.id === id);
  }

  async function toggleWishlist(id: number) {
    const alreadySaved = isWishlisted(id);

    // Optimistic update
    if (alreadySaved) {
      setWishlistedProducts(prev => prev.filter(p => p.id !== id));
    }

    try {
      if (alreadySaved) {
        await api.delete(`/wishlist/${id}`);
      } else {
        await api.post(`/wishlist/${id}`);
        // Fetch full product data to add to local list
        const { data } = await api.get('/wishlist');
        setWishlistedProducts(data.products);
      }
    } catch {
      // Revert on error
      const { data } = await api.get('/wishlist').catch(() => ({ data: { products: wishlistedProducts } }));
      setWishlistedProducts(data.products);
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlistedProducts, loading, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
