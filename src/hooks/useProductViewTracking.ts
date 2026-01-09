// Composant de tracking des vues de produits - À intégrer dans ProductDetail.tsx

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Fonction pour générer un ID de session unique pour les visiteurs anonymes
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

// Hook pour tracker les vues de produits
export const useProductViewTracking = (productId: string) => {
  useEffect(() => {
    if (!productId) return;

    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionId = getSessionId();
        
        // Vérifier si cette session a déjà vu ce produit récemment (évite le spam)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        let query = supabase
          .from('product_views')
          .select('id')
          .eq('product_id', productId)
          .gte('created_at', twentyFourHoursAgo.toISOString());

        // Ajouter condition user_id ou session_id selon l'authentification
        if (session?.user?.id) {
          query = query.eq('user_id', session.user.id);
        } else {
          query = query.eq('session_id', sessionId);
        }

        const { data: recentView } = await query.limit(1).maybeSingle();

        // Si pas de vue récente, enregistrer une nouvelle vue
        if (!recentView) {
          const viewData = {
            product_id: productId,
            user_id: session?.user?.id || null,
            session_id: sessionId
          };

          const { error } = await supabase
            .from('product_views')
            .insert(viewData);

          if (error) {
            console.log('View tracking error (non-blocking):', error.message);
          } else {
            console.log(`✅ View tracked for product ${productId}`);
          }
        }
      } catch (error) {
        console.log('View tracking failed (non-blocking):', error);
      }
    };

    // Tracker la vue avec un léger délai pour s'assurer du chargement
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [productId]);
};

// Fonction pour obtenir les statistiques de vues d'un vendeur
export const fetchVendorViewStats = async (vendorId: string) => {
  try {
    console.log('🔍 Fetching view stats for vendor:', vendorId);
    
    // Obtenir tous les produits du vendeur
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorId);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      throw productsError;
    }
    
    if (!products || products.length === 0) {
      console.log('ℹ️ No products found for vendor');
      return { totalViews: 0, uniqueVisitors: 0 };
    }

    const productIds = products.map(p => p.id);
    console.log('📦 Found products:', productIds.length);

    // Compter les vues pour tous les produits du vendeur
    const { count: totalViews, error: viewsError } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .in('product_id', productIds);

    if (viewsError) {
      console.error('❌ Error counting views:', viewsError);
      // Si la table n'existe pas, retourner 0
      if (viewsError.message.includes('relation "product_views" does not exist')) {
        console.log('⚠️ product_views table does not exist yet');
        return { totalViews: 0, uniqueVisitors: 0 };
      }
      throw viewsError;
    }

    // Compter les visiteurs uniques (approche simplifiée)
    const { data: visitorData, error: visitorsError } = await supabase
      .from('product_views')
      .select('user_id')
      .in('product_id', productIds)
      .not('user_id', 'is', null);

    if (visitorsError) {
      console.error('❌ Error counting visitors:', visitorsError);
      throw visitorsError;
    }

    // Compter les utilisateurs uniques
    const uniqueUsers = visitorData ? [...new Set(visitorData.map(v => v.user_id))].length : 0;
    
    const result = {
      totalViews: totalViews || 0,
      uniqueVisitors: uniqueUsers || 0
    };
    
    console.log('✅ View stats result:', result);
    return result;

  } catch (error) {
    console.error('💥 Error in fetchVendorViewStats:', error);
    return { totalViews: 0, uniqueVisitors: 0 };
  }
};