import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWishlist = (productId?: string) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUserAndWishlist();
    }, [productId]);

    const checkUserAndWishlist = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser && productId) {
            const { data, error } = await supabase
                .from('wishlist')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('product_id', productId)
                .maybeSingle();

            if (!error && data) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        }
    };

    const toggleWishlist = async (pId?: string) => {
        const activeProductId = pId || productId;

        if (!activeProductId) return;

        if (!user) {
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
                    .eq('user_id', user.id)
                    .eq('product_id', activeProductId);

                if (error) throw error;
                setIsLiked(false);
                toast.success('Retiré des favoris');
            } else {
                const { error } = await supabase
                    .from('wishlist')
                    .insert({
                        user_id: user.id,
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

    return { isLiked, isLiking, toggleWishlist, user };
};
