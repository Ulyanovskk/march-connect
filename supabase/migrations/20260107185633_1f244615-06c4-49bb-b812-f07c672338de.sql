-- Create orders table for tracking all payments
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'paypal', 'orange_money', 'mtn_money', 'binance', 'cash_on_delivery')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_reference text,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  
  -- Customer info (for non-authenticated orders)
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_whatsapp text,
  
  -- Delivery info
  delivery_address text NOT NULL,
  delivery_city text NOT NULL,
  delivery_notes text,
  
  -- Order items stored as JSONB
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Vendors can view orders containing their products
CREATE POLICY "Vendors can view orders with their products"
ON public.orders
FOR SELECT
USING (vendor_id = (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- Allow anonymous order creation for guest checkout
CREATE POLICY "Anyone can create guest orders"
ON public.orders
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create order_items table for detailed tracking
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their order items
CREATE POLICY "Users can view their order items"
ON public.order_items
FOR SELECT
USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

-- Allow insert for order items
CREATE POLICY "Can insert order items for own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid() OR user_id IS NULL)
);