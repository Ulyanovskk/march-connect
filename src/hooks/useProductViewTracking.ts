import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Fonction pour générer un ID de session unique
const getSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('product_view_session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('product_view_session', sessionId);
    }
    return sessionId;
  }
  return null;
};

export const useProductViewTracking = (productId: string) => {
  useEffect(() => {
    if (!productId) return;

    const trackView = async () => {
      try {
        const storageKey = `v_viewed_${productId}`;
        const lastView = localStorage.getItem(storageKey);
        const now = Date.now();

        // Anti-spam : 1 vue par 12h
        if (lastView && (now - parseInt(lastView)) < 12 * 60 * 60 * 1000) {
          return;
        }

        // APPEL DE LA FONCTION SQL (RPC) - Très sécurisé
        const { error: rpcError } = await supabase.rpc('increment_product_views', {
          product_id: productId
        });

        if (rpcError) {
          console.error('❌ RPC Error (Check if function exists in SQL Editor):', rpcError.message);
        } else {
          console.log(`✅ View incremented via RPC for ${productId}`);
          localStorage.setItem(storageKey, now.toString());
        }

        // Log optionnel dans la table product_views
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const sessionId = getSessionId();
          await supabase.from('product_views').insert({
            product_id: productId,
            user_id: session?.user?.id || null,
            session_id: sessionId
          });
        } catch (e) {
          // Ignorer si la table n'existe pas
        }

      } catch (error) {
        console.log('View tracking error:', error);
      }
    };

    const timer = setTimeout(trackView, 1500);
    return () => clearTimeout(timer);
  }, [productId]);
};

export const fetchVendorViewStats = async (vendorId: string) => {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('views')
      .eq('vendor_id', vendorId);

    const totalViews = products?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;
    return { totalViews, uniqueVisitors: 0 };
  } catch (error) {
    return { totalViews: 0, uniqueVisitors: 0 };
  }
};
