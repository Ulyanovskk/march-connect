import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Cache global pour la session et les favoris
let sessionChecked = false;
let cachedUser: any = null;
let userWishlistIds: Set<string> = new Set();
let wishlistLoaded = false;

// Initialiser le cache au chargement du module
const initSession = async () => {
    if (sessionChecked) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        cachedUser = session?.user || null;
        sessionChecked = true;

        // Charger tous les favoris en une seule requête
        if (cachedUser) {
            await loadUserWishlist();
        }
    } catch {
        cachedUser = null;
        sessionChecked = true;
    }
};

// Charger tous les favoris de l'utilisateur en une seule requête
const loadUserWishlist = async () => {
    if (!cachedUser || wishlistLoaded) return;

    try {
        const { data } = await supabase
            .from('wishlist')
            .select('product_id')
            .eq('user_id', cachedUser.id);

        userWishlistIds = new Set((data || []).map(item => item.product_id));
        wishlistLoaded = true;
    } catch {
        // Silently fail
    }
};

// Lancer l'initialisation immédiatement
initSession();

// Écouter les changements de session
supabase.auth.onAuthStateChange(async (event, session) => {
    cachedUser = session?.user || null;
    sessionChecked = true;
    wishlistLoaded = false;
    userWishlistIds = new Set();

    if (cachedUser) {
        await loadUserWishlist();
    }
});

export const useWishlist = (productId?: string) => {
    // Initialiser directement depuis le cache
    const [isLiked, setIsLiked] = useState(() =>
        productId ? userWishlistIds.has(productId) : false
    );
    const [isLiking, setIsLiking] = useState(false);

    // Synchroniser avec le cache si le wishlist est chargé après le premier render
    useEffect(() => {
        if (!productId) return;

        const syncWithCache = () => {
            if (wishlistLoaded) {
                setIsLiked(userWishlistIds.has(productId));
            }
        };

        // Vérifier si le cache est prêt
        if (wishlistLoaded) {
            syncWithCache();
        } else {
            // Attendre un peu que le cache soit prêt
            const timeout = setTimeout(syncWithCache, 500);
            return () => clearTimeout(timeout);
        }
    }, [productId]);

    const toggleWishlist = async (pId?: string) => {
        const activeProductId = pId || productId;
        if (!activeProductId) return;

        if (!cachedUser) {
            toast.error('Connectez-vous pour ajouter ce produit à vos favoris');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);
        try {
            if (isLiked) {
                const { error } = await supabase
                    .from('wishlist')
                    .delete()
                    .eq('user_id', cachedUser.id)
                    .eq('product_id', activeProductId);

                if (error) throw error;

                // Mettre à jour le cache global
                userWishlistIds.delete(activeProductId);
                setIsLiked(false);
                toast.success('Retiré des favoris');
            } else {
                const { error } = await supabase
                    .from('wishlist')
                    .insert({
                        user_id: cachedUser.id,
                        product_id: activeProductId
                    });

                if (error) throw error;

                // Mettre à jour le cache global
                userWishlistIds.add(activeProductId);
                setIsLiked(true);
                toast.success('Ajouté aux favoris');
            }
        } catch (err: any) {
            console.error('Error toggling wishlist:', err);
            toast.error('Une erreur est survenue');
        } finally {
            setIsLiking(false);
        }
    };

    return { isLiked, isLiking, toggleWishlist, user: cachedUser };
};
