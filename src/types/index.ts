// YARID Types

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  shop_name: string;
  description: string | null;
  logo_url: string | null;
  phone: string;
  whatsapp: string;
  city: string;
  is_verified: boolean;
  commission_rate: number;
  max_products_per_month: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  images: string[];
  stock: number;
  is_active: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  // Relations
  vendor?: Vendor;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'admin' | 'client' | 'vendor';
