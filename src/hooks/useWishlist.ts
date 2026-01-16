import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Cache global pour la session - initialisé à false (non vérifié), puis à l'utilisateur ou null
let sessionChecked = false;
let cachedUser: any = null;

// Initialiser le cache au chargement du module
const initSession = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        cachedUser = session?.user || null;
        sessionChecked = true;
    } catch {
        cachedUser = null;
        sessionChecked = true;
    }
};

// Lancer l'initialisation immédiatement
initSession();

// Écouter les changements de session pour mettre à jour le cache
supabase.auth.onAuthStateChange((event, session) => {
    cachedUser = session?.user || null;
    sessionChecked = true;
});

export const useWishlist = (productId?: string) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const hasChecked = useRef(false);

    useEffect(() => {
        // Éviter les vérifications répétées
        if (hasChecked.current || !productId) return;

        const checkWishlist = async () => {
            // Attendre que la session soit vérifiée si besoin
            if (!sessionChecked) {
                await initSession();
            }

            if (cachedUser && productId) {
                hasChecked.current = true;
                try {
                    const { data } = await supabase
                        .from('wishlist')
                        .select('id')
                        .eq('user_id', cachedUser.id)
                        .eq('product_id', productId)
                        .maybeSingle();

                    if (data) {
                        setIsLiked(true);
                    }
                } catch (err) {
                    // Silently fail - not critical
                }
            } else {
                hasChecked.current = true;
            }
        };

        checkWishlist();
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
