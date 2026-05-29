import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: string;
  category: string;
  author_name: string;
  cover_path: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  cartCount: number;
  cartTotal: number;
  isInCart: (productId: number) => boolean;
  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      setCartItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api.get('/cart')
      .then(({ data }) => { if (!cancelled) setCartItems(data.items); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  function isInCart(productId: number) {
    return cartItems.some(item => item.product_id === productId);
  }

  async function addToCart(productId: number) {
    try {
      await api.post(`/cart/${productId}`);
      const { data } = await api.get('/cart');
      setCartItems(data.items);
    } catch {
      // silent — item stays out of cart
    }
  }

  async function removeFromCart(productId: number) {
    // Optimistic remove
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
    try {
      await api.delete(`/cart/${productId}`);
    } catch {
      // Revert on error
      const { data } = await api.get('/cart').catch(() => ({ data: { items: cartItems } }));
      setCartItems(data.items);
    }
  }

  async function clearCart() {
    setCartItems([]);
    try {
      await api.delete('/cart');
    } catch {
      // silent
    }
  }

  return (
    <CartContext.Provider value={{ cartItems, loading, cartCount, cartTotal, isInCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
