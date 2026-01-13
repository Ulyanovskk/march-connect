-- Add admin policy for vendors table
CREATE POLICY "Admins can manage all vendors"
  ON public.vendors FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add admin policy for products table (to allow banning shops and deactivating products)
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
