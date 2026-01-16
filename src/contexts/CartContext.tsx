import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const [user, setUser] = useState<any>(null);

  // Initialize session and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncCartWithDB(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        migrateGuestCart(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // We keep the items in state/localStorage for guest mode
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncCartWithDB = async (userId: string) => {
    try {
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

        // Merge strategy: DB items take priority, but we can combine if needed
        // For now, let's just let DB state be the source of truth if it exists
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error syncing cart with DB:', error);
    }
  };

  const migrateGuestCart = async (userId: string) => {
    try {
      // Get current local items
      const localItems = [...items];
      if (localItems.length === 0) {
        syncCartWithDB(userId);
        return;
      }

      // 1. Get existing DB items
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', userId);

      // 2. Prepare migration
      for (const item of localItems) {
        const existing = existingItems?.find(ei => ei.product_id === item.id);

        if (existing) {
          // Update quantity if exists
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('user_id', userId)
            .eq('product_id', item.id);
        } else {
          // Insert new
          await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: item.id,
              quantity: item.quantity
            });
        }
      }

      // 3. Final sync to get full product details back
      await syncCartWithDB(userId);
      toast.success("Votre panier a été synchronisé !");
    } catch (error) {
      console.error('Error migrating guest cart:', error);
    }
  };

  const syncItemToDB = async (productId: string, quantity: number, action: 'add' | 'update' | 'delete') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: action === 'add' ? existing.quantity + quantity : quantity })
            .eq('id', existing.id);
        } else if (action !== 'delete') {
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: quantity
            });
        }
      }
    } catch (error) {
      console.error('Error syncing item to DB:', error);
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

    syncItemToDB(item.id, quantity, 'add');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    syncItemToDB(id, 0, 'delete');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
    syncItemToDB(id, quantity, 'update');
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }
  };

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
