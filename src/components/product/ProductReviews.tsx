import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquare, User, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    is_approved: boolean;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

interface ProductReviewsProps {
    productId: string;
    onReviewsChange?: (count: number) => void;
}

const ProductReviews = ({ productId, onReviewsChange }: ProductReviewsProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        fetchReviews();
        checkUser();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`public:product_reviews:product_id=eq.${productId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'product_reviews',
                    filter: `product_id=eq.${productId}`
                },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    fetchReviews();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };

    const fetchReviews = async () => {
        try {
            console.log('Fetching reviews for product:', productId);
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                if (onReviewsChange) onReviewsChange(0);
                return;
            }

            const userIds = [...new Set(reviewsData.map(r => r.user_id))];
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            const mergedReviews = reviewsData.map(review => ({
                ...review,
                profiles: profilesData?.find(p => p.id === review.user_id) || { full_name: 'Acheteur Vérifié', avatar_url: null }
            }));

            setReviews(mergedReviews);
            if (onReviewsChange) onReviewsChange(mergedReviews.length);
        } catch (err) {
            console.error('Final error fetching reviews:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Connectez-vous pour laisser un avis');
            return;
        }

        if (!newReview.comment.trim()) {
            toast.error('Veuillez ajouter un commentaire');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await (supabase as any)
                .from('product_reviews')
                .insert({
                    product_id: productId,
                    user_id: user.id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                    is_approved: true // Auto-approve for better UX during development
                });

            if (error) {
                if (error.code === '23505') {
                    toast.error('Vous avez déjà laissé un avis sur ce produit');
                } else {
                    throw error;
                }
            } else {
                toast.success('Merci pour votre avis !');
                setNewReview({ rating: 5, comment: '' });
                // fetchReviews() will be called by realtime, but we call it anyway for safety
                fetchReviews();
            }
        } catch (err: any) {
            toast.error('Erreur lors de l\'envoi : ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return (
        <div className="space-y-10 py-10 border-t">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Avis Clients ({reviews.length})
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">Ce que nos clients pensent de ce produit</p>
                </div>

                {reviews.length > 0 && (
                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-primary leading-none">
                                {averageRating.toFixed(1)}
                            </span>
                            <div className="flex mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < Math.round(averageRating) ? "fill-primary text-primary" : "text-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Formulaire d'avis */}
            <div className="bg-gradient-to-br from-card to-muted/20 border rounded-[2rem] p-6 shadow-sm">
                {user ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary/10">
                                {user.email?.[0].toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold">Partagez votre avis</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="hover:scale-125 transition-transform duration-200"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-7 h-7 transition-all duration-300",
                                                    star <= newReview.rating ? "fill-primary text-primary shadow-glow" : "text-muted hover:text-primary/50"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="Votre expérience, vos conseils, points forts et points faibles..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="rounded-[1.5rem] min-h-[120px] border-none bg-muted/40 focus-visible:ring-primary focus-visible:bg-muted/60 transition-all p-5"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="absolute bottom-4 right-4 rounded-2xl gap-2 font-bold px-6 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                )}
                                Publier l'avis
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="py-10 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">Connectez-vous pour laisser votre avis sur cet article.</p>
                            <Button variant="outline" className="mt-4 rounded-2xl px-8 border-primary text-primary hover:bg-primary hover:text-white font-bold" asChild>
                                <a href="/login">Se connecter</a>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm font-medium animate-pulse text-muted-foreground">Chargement des avis...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="group relative bg-card border border-transparent hover:border-primary/10 hover:shadow-soft-xl transition-all duration-500 p-6 rounded-[2rem]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden flex items-center justify-center border-2 border-background group-hover:border-primary/20 transition-all">
                                            {review.profiles?.avatar_url ? (
                                                <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base leading-none">
                                                {review.profiles?.full_name || 'Acheteur Vérifié'}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex bg-muted/30 px-3 py-1.5 rounded-xl gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-3.5 h-3.5",
                                                    i < review.rating ? "fill-primary text-primary" : "text-muted/50"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="pl-16">
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/5 rounded-[3rem] border border-dashed">
                        <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Aucun avis encore</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            Soyez le premier à partager votre expérience et aidez les autres acheteurs !
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
