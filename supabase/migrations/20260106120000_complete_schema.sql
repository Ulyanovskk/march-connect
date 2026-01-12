-- =====================================================
-- SCHÉMA COMPLET DE BASE DE DONNÉES - YARID MARKETPLACE
-- =====================================================
-- Ce fichier contient toutes les tables nécessaires pour 
-- une marketplace e-commerce complète et évolutive
-- =====================================================

-- =====================================================
-- 1. UTILISATEURS ET AUTHENTIFICATION
-- =====================================================

-- Table: profiles (Utilisateurs)
-- Extension du système d'authentification Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Types d'utilisateurs
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: user_roles (Rôles des utilisateurs)
-- Permet à un utilisateur d'avoir plusieurs rôles (ex: client + vendor)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- =====================================================
-- 2. VENDEURS ET BOUTIQUES
-- =====================================================

-- Table: vendors (Vendeurs/Boutiques)
-- Informations spécifiques aux vendeurs
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shop_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Douala',
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  max_products_per_month INTEGER DEFAULT 3,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: vendor_verification_documents (Documents de vérification)
-- Pour la vérification des vendeurs
CREATE TABLE IF NOT EXISTS public.vendor_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'cni', 'business_license', 'tax_id', etc.
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. CATÉGORIES ET PRODUITS
-- =====================================================

-- Table: categories (Catégories de produits)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: products (Produits)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(12,2) CHECK (original_price >= 0),
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  weight_kg DECIMAL(8,2),
  dimensions_cm TEXT, -- Format: "LxWxH" ex: "30x20x15"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, slug)
);

-- Table: product_variants (Variantes de produits)
-- Ex: Taille, couleur, etc.
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Ex: "Rouge", "XL", etc.
  sku TEXT UNIQUE,
  price DECIMAL(12,2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: product_attributes (Attributs de produits)
-- Ex: Marque, Modèle, Garantie, etc.
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  attribute_name TEXT NOT NULL, -- Ex: "Marque", "Garantie", "Couleur"
  attribute_value TEXT NOT NULL, -- Ex: "Samsung", "1 an", "Noir"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. COMMANDES ET PAIEMENTS
-- =====================================================

-- Statuts de commande
DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
      'pending',        -- En attente
      'confirmed',      -- Confirmée
      'processing',     -- En préparation
      'ready',          -- Prête à être livrée
      'shipped',        -- Expédiée
      'delivered',      -- Livrée
      'cancelled',      -- Annulée
      'refunded'        -- Remboursée
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Méthodes de paiement
-- Mise à jour pour correspondre aux méthodes disponibles dans l'application
DO $$ BEGIN
    CREATE TYPE public.payment_method AS ENUM (
      'card',              -- Carte bancaire (Visa, Mastercard, American Express)
      'paypal',            -- PayPal
      'orange_money',      -- Orange Money
      'mtn_momo',          -- MTN Mobile Money
      'binance',           -- Binance Pay (crypto-monnaie)
      'cash_on_delivery',  -- Paiement à la livraison
      'bank_transfer'      -- Virement bancaire
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statuts de paiement
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM (
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: addresses (Adresses de livraison)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL, -- Ex: "Domicile", "Bureau", "Maison"
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: orders (Commandes)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- Ex: "YAR-2026-001234"
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  commission_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  notes TEXT,
  vendor_notes TEXT, -- Notes internes pour le vendeur
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: order_items (Articles de commande)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE RESTRICT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: payments (Paiements)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL,
  transaction_id TEXT, -- ID de transaction Orange Money, MTN MoMo, etc.
  transaction_reference TEXT,
  payment_proof_url TEXT, -- Capture d'écran du paiement
  -- Informations spécifiques selon la méthode de paiement
  card_last_four TEXT, -- 4 derniers chiffres de la carte (pour 'card')
  card_holder_name TEXT, -- Nom sur la carte (pour 'card')
  paypal_email TEXT, -- Email PayPal (pour 'paypal')
  phone_number TEXT, -- Numéro de téléphone (pour 'orange_money', 'mtn_momo')
  binance_email TEXT, -- Email Binance (pour 'binance')
  binance_wallet TEXT, -- Adresse wallet Binance (pour 'binance')
  metadata JSONB, -- Données supplémentaires selon la méthode (ex: CVV masqué, date expiration)
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: order_status_history (Historique des statuts de commande)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. PANIER ET FAVORIS
-- =====================================================

-- Table: cart_items (Articles du panier)
-- Panier persistant (alternative au localStorage)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Table: wishlist (Liste de souhaits/Favoris)
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- 6. AVIS ET NOTATIONS
-- =====================================================

-- Table: product_reviews (Avis sur les produits)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id, product_id) -- Un avis par commande par produit
);

-- Table: vendor_reviews (Avis sur les vendeurs)
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 7. NOTIFICATIONS ET MESSAGES
-- =====================================================

-- Types de notifications
DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM (
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_received',
      'review_received',
      'product_approved',
      'vendor_verified',
      'system_announcement'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: notifications (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL vers la page concernée
  is_read BOOLEAN DEFAULT false,
  metadata JSONB, -- Données supplémentaires (ex: order_id, product_id)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: messages (Messages entre utilisateurs et support)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 8. PROMOTIONS ET COUPONS
-- =====================================================

-- Table: coupons (Coupons de réduction)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase_amount DECIMAL(12,2) DEFAULT 0,
  max_discount_amount DECIMAL(12,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: coupon_usage (Utilisation des coupons)
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE RESTRICT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id) -- Un coupon par commande
);

-- Table: promotions (Promotions spéciales)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase_amount DECIMAL(12,2) DEFAULT 0,
  applicable_to TEXT CHECK (applicable_to IN ('all', 'category', 'product', 'vendor')),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 9. LIVRAISON
-- =====================================================

-- Table: shipping_methods (Méthodes de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Ex: "Livraison standard", "Express", "Point relais"
  description TEXT,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  free_shipping_threshold DECIMAL(12,2), -- Livraison gratuite au-delà de ce montant
  estimated_days INTEGER, -- Délai estimé en jours
  is_active BOOLEAN DEFAULT true,
  city TEXT, -- Si spécifique à une ville
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: shipments (Expéditions)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  shipping_method_id UUID REFERENCES public.shipping_methods(id) ON DELETE SET NULL,
  tracking_number TEXT,
  carrier TEXT, -- Ex: "DHL", "FedEx", "Express Delivery"
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 10. STATISTIQUES ET ANALYTICS
-- =====================================================

-- Table: product_views (Vues de produits - Analytics)
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: search_history (Historique de recherche)
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 11. CONTENU ET FAQ
-- =====================================================

-- Table: faq_categories (Catégories de FAQ)
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT, -- Nom de l'icône Lucide React
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: faq_items (Questions/Réponses FAQ)
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: content_pages (Pages de contenu statique)
-- Pour gérer les pages Terms, Privacy, Legal Notice de manière dynamique
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- 'terms-of-service', 'privacy-policy', 'legal-notice'
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Contenu HTML ou Markdown
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 12. CONFIGURATION ET PARAMÈTRES
-- =====================================================

-- Table: site_settings (Paramètres du site)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 13. INDEX POUR PERFORMANCE
-- =====================================================

-- Index sur les colonnes fréquemment utilisées pour les recherches
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON public.order_items(vendor_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

CREATE INDEX IF NOT EXISTS idx_faq_items_category_id ON public.faq_items(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_is_active ON public.faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_categories_is_active ON public.faq_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON public.content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_is_published ON public.content_pages(is_published);

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 15. POLITIQUES RLS (Exemples de base)
-- =====================================================

-- Profiles: Lecture publique, modification par propriétaire
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: Lecture publique
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (is_active = true);

-- Products: Lecture publique des produits actifs
CREATE POLICY "Active products are viewable by everyone"
  ON public.products FOR SELECT USING (is_active = true);

-- Products: Vendeurs peuvent gérer leurs produits
CREATE POLICY "Vendors can manage their own products"
  ON public.products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors 
      WHERE id = products.vendor_id 
      AND user_id = auth.uid()
    )
  );

-- Vendors: Lecture publique
CREATE POLICY "Vendors are viewable by everyone"
  ON public.vendors FOR SELECT USING (is_active = true);

-- Vendors: Modification par propriétaire
CREATE POLICY "Vendors can update their own data"
  ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- Cart items: Utilisateur peut gérer son panier
CREATE POLICY "Users can manage their own cart"
  ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist: Utilisateur peut gérer sa liste de souhaits
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Orders: Utilisateur peut voir ses commandes
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Orders: Utilisateur peut créer des commandes
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses: Utilisateur peut gérer ses adresses
CREATE POLICY "Users can manage their own addresses"
  ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Notifications: Utilisateur peut voir ses notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Lecture publique, création par utilisateurs authentifiés
CREATE POLICY "Reviews are viewable by everyone"
  ON public.product_reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FAQ Categories: Lecture publique des catégories actives
CREATE POLICY "FAQ categories are viewable by everyone"
  ON public.faq_categories FOR SELECT USING (is_active = true);

-- FAQ Items: Lecture publique des items actifs
CREATE POLICY "FAQ items are viewable by everyone"
  ON public.faq_items FOR SELECT USING (is_active = true);

-- Content Pages: Lecture publique des pages publiées
CREATE POLICY "Published content pages are viewable by everyone"
  ON public.content_pages FOR SELECT USING (is_published = true);

-- Content Pages: Modification par les admins uniquement
CREATE POLICY "Admins can manage content pages"
  ON public.content_pages FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- FAQ: Modification par les admins uniquement
CREATE POLICY "Admins can manage FAQ"
  ON public.faq_categories FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage FAQ items"
  ON public.faq_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Note: Ajoutez d'autres politiques selon vos besoins spécifiques

-- =====================================================
-- 16. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_catalog;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON public.vendors 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
  BEFORE UPDATE ON public.addresses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_categories_updated_at 
  BEFORE UPDATE ON public.faq_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at 
  BEFORE UPDATE ON public.faq_items 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at 
  BEFORE UPDATE ON public.content_pages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  
  -- Récupérer le rôle depuis les métadonnées ou utiliser 'client' par défaut
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');
  
  -- Créer l'entrée user_role avec le bon rôle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::public.app_role);
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour générer le numéro de commande
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_catalog
AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  seq_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Obtenir le dernier numéro de séquence de l'année
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO seq_number
  FROM public.orders
  WHERE order_number LIKE 'YAR-' || year_part || '-%';
  
  new_number := 'YAR-' || year_part || '-' || LPAD(seq_number::TEXT, 6, '0');
  RETURN new_number;
END;
$$;

-- Fonction pour mettre à jour les statistiques de produit
CREATE OR REPLACE FUNCTION public.update_product_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Mettre à jour la moyenne des avis
  UPDATE public.products
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour les stats après un avis
CREATE TRIGGER update_product_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stats();

-- Fonction pour mettre à jour les statistiques de vendeur
CREATE OR REPLACE FUNCTION public.update_vendor_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Mettre à jour la moyenne des avis du vendeur
  UPDATE public.vendors
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.vendor_reviews
      WHERE vendor_id = NEW.vendor_id AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.vendor_reviews
      WHERE vendor_id = NEW.vendor_id AND is_approved = true
    )
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour les stats du vendeur après un avis
CREATE TRIGGER update_vendor_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_stats();

-- Fonction pour incrémenter les vues de produit
CREATE OR REPLACE FUNCTION public.increment_product_views(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.products
  SET views = COALESCE(views, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Fonction pour incrémenter les vues de FAQ
CREATE OR REPLACE FUNCTION public.increment_faq_views()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.faq_items
  SET views = COALESCE(views, 0) + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Note: Ce trigger peut être ajouté côté application plutôt que base de données
-- pour éviter les problèmes de performance. À utiliser avec précaution.

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================

-- Notes importantes:
-- 1. Ce schéma est complet mais peut être adapté selon vos besoins
-- 2. Les politiques RLS doivent être affinées selon votre logique métier
-- 3. Pensez à ajouter des contraintes supplémentaires si nécessaire
-- 4. Les fonctions de statistiques peuvent être optimisées avec des vues matérialisées
-- 5. Pour la production, considérez l'ajout de partitions pour les tables volumineuses
--    (orders, product_views, notifications, etc.)
--
-- Mises à jour récentes:
-- - Ajout des méthodes de paiement: 'card', 'paypal', 'binance' pour correspondre à l'application
-- - Ajout de la table faq_categories et faq_items pour gérer les FAQs dynamiquement
-- - Ajout de la table content_pages pour gérer les pages de contenu statique (Terms, Privacy, Legal)
-- - Ajout des index et politiques RLS pour les nouvelles tables
-- - Ajout des triggers pour updated_at sur les nouvelles tables


