import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  quantity: number;
  vendorName?: string;
  vendorCity?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'yarid-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Clear cart when user logs out or logs in as different user
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // User logged out - clear cart
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        // User logged in - load their cart from DB or keep anonymous cart
        loadUserCart(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserCart = async (userId: string) => {
    try {
      // Load user's cart from database
      const { data: dbCart, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (
            id,
            name,
            price,
            original_price,
            images,
            vendor:vendors (shop_name)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (dbCart && dbCart.length > 0) {
        // Convert DB cart items to CartItem format
        const cartItems: CartItem[] = dbCart.map((item: any) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.original_price,
          image: item.product.images?.[0] || '',
          quantity: item.quantity,
          vendorName: item.product.vendor?.shop_name || 'Vendeur',
          vendorCity: 'Cameroun'
        }));
        
        setItems(cartItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } else {
        // Keep existing anonymous cart or initialize empty
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        const anonymousCart = stored ? JSON.parse(stored) : [];
        setItems(anonymousCart);
      }
    } catch (error) {
      console.error('Error loading user cart:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const fallbackCart = stored ? JSON.parse(stored) : [];
      setItems(fallbackCart);
    }
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const savings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      total,
      savings,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
