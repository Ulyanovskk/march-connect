import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, MessageCircle, BadgeCheck, MapPin, Store, Star, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, getDiscount } from '@/lib/demo-data';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductReviews from '@/components/product/ProductReviews';
import { useProductViewTracking } from '@/hooks/useProductViewTracking';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Track product views
  useProductViewTracking(id || '');

  useEffect(() => {
    checkUserAndWishlist();
  }, [id]);

  const checkUserAndWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user || null;
    setUser(currentUser);

    if (currentUser && id) {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('product_id', id)
        .maybeSingle();

      if (!error && data) {
        setIsLiked(true);
      }
    }
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // Récupérer d'abord le produit
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      if (!productData) return null;

      // Récupérer les données de catégorie si elles existent
      let categoryData = null;
      if (productData.category_id) {
        const { data: cat, error: catError } = await supabase
          .from('categories')
          .select('name, slug')
          .eq('id', productData.category_id)
          .single();

        if (!catError) categoryData = cat;
      }

      // Récupérer les données du vendeur
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('shop_name, is_verified, city, description, created_at')
        .eq('id', productData.vendor_id)
        .single();

      let vendorInfo = null;
      if (!vendorError) vendorInfo = vendorData;

      // Combiner les données
      return {
        ...productData,
        category: categoryData,
        vendor: vendorInfo
      };
    },
    enabled: !!id
  });

  const discount = product ? getDiscount(product.price, product.original_price) : null;
  const images = useMemo(() => {
    if (!product) return [];
    const gallery = (product as any).images || [];
    return gallery;
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Produit introuvable</h2>
          <p className="text-muted-foreground mb-6">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/catalogue')}
              className="px-6"
            >
              Retour au catalogue
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6"
            >
              Rafraîchir la page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: images[0],
      vendorName: (product.vendor as any)?.shop_name || 'Boutique Yarid',
      vendorCity: (product.vendor as any)?.city || 'Cameroun',
    }, quantity);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé par "${product.name}" à ${formatPrice(product.price)}`);
    window.open(`https://wa.me/237695250379?text=${message}`, '_blank');
  };

  const handleToggleWishlist = async () => {
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
          .eq('product_id', id);

        if (error) throw error;
        setIsLiked(false);
        toast.success('Retiré des favoris');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: id
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

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Yarid Market',
      text: `Découvrez ${product?.name} sur Yarid !`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papier !');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to="/catalogue" className="hover:text-primary">Catalogue</Link>
          <span>/</span>
          <span className="text-foreground">{typeof (product as any).category === 'string' ? (product as any).category : ((product as any).category as any)?.name || 'Catégorie'}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Discount badge */}
              {discount && (
                <Badge className="absolute top-4 left-4 bg-yarid-orange text-white">
                  -{discount}%
                </Badge>
              )}

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={handleToggleWishlist}
                  disabled={isLiking}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transition-all active:scale-90 border-2 border-white text-gray-900"
                  aria-label="Liker le produit"
                >
                  <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-primary text-primary' : 'hover:text-primary'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-12 h-12 bg-white border-2 border-white rounded-full flex items-center justify-center shadow-xl text-gray-900 hover:text-primary transition-all active:scale-90"
                  aria-label="Partager le produit"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {typeof (product as any).category === 'string' ? (product as any).category : ((product as any).category as any)?.name || 'Produit'}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yarid-yellow text-yarid-yellow" />
                  <span className="font-medium">4.8</span>
                  <span>({reviewCount} avis)</span>
                </div>
                <span>•</span>
                <span>{product.views || 0} vues</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-2xl p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
              {discount && (
                <p className="text-sm text-yarid-green mt-1 font-medium">
                  Économisez {formatPrice(product.original_price! - product.price)}
                </p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantité:</span>
                <div className="flex items-center border rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} en stock
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 h-14 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  onClick={handleWhatsAppContact}
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 border-yarid-green text-yarid-green hover:bg-yarid-green hover:text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Vendor Info */}
            <div className="bg-muted/30 rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Informations vendeur
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Store className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{(product.vendor as any)?.shop_name || 'Boutique Partenaire'}</span>
                    {(product.vendor as any)?.is_verified && <BadgeCheck className="w-5 h-5 text-yarid-blue fill-yarid-blue/20" />}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {(product.vendor as any)?.city || 'Cameroun'}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    {(product.vendor as any)?.is_verified && (
                      <span className="text-xs bg-yarid-green/10 text-yarid-green px-2 py-1 rounded-full font-bold">
                        Vendeur Vérifié
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Membre depuis {new Date((product.vendor as any)?.created_at).getFullYear() || 2024}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold">
                    <Link to={`/boutique/${product.vendor_id}`}>
                      Voir la boutique
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>

            {/* Delivery & Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium text-sm mb-2">🚚 Livraison</h4>
                <p className="text-xs text-muted-foreground">
                  Livraison disponible partout au Cameroun
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium text-sm mb-2">💳 Paiement</h4>
                <p className="text-xs text-muted-foreground">
                  Orange Money, MTN Money, Cash
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12 max-w-4xl">
          <ProductReviews productId={product.id} onReviewsChange={setReviewCount} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
