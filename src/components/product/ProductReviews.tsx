import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquare, User, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

interface ProductReviewsProps {
    productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
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
    }, [productId]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };

    const fetchReviews = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select(`
          id, rating, comment, created_at,
          profiles:user_id (full_name, avatar_url)
        `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data as any || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
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
                .from('reviews')
                .insert({
                    product_id: productId,
                    user_id: user.id,
                    rating: newReview.rating,
                    comment: newReview.comment
                } as any);

            if (error) {
                if (error.code === '23505') {
                    toast.error('Vous avez déjà laissé un avis sur ce produit');
                } else {
                    throw error;
                }
            } else {
                toast.success('Merci pour votre avis !');
                setNewReview({ rating: 5, comment: '' });
                fetchReviews();
            }
        } catch (err: any) {
            toast.error('Erreur lors de l\'envoi : ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 py-8 border-t">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Avis Clients ({reviews.length})
                </h2>

                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                        <span className="font-bold text-primary">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                        </span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'fill-primary text-primary' : 'text-muted'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Write a review */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-card border rounded-3xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">Laissez votre avis</p>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${star <= newReview.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Textarea
                            placeholder="Racontez votre expérience avec ce produit..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="rounded-2xl min-h-[100px] border-none bg-muted/30 focus-visible:ring-primary"
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="absolute bottom-3 right-3 rounded-xl gap-2 font-bold"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Publier
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/10 border border-dashed rounded-3xl p-8 text-center">
                    <p className="text-muted-foreground mb-4">Vous devez être connecté pour donner votre avis.</p>
                    <Button variant="outline" className="rounded-xl px-8" asChild>
                        <a href="/login">Se connecter</a>
                    </Button>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="group pb-6 border-b last:border-0 hover:bg-muted/5 transition-colors p-4 rounded-3xl -mx-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{review.profiles?.full_name || 'Anonyme'}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed pl-[52px]">
                                {review.comment}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
