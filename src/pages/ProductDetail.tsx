import { useState, useMemo } from 'react';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select(`
          *,
          vendor:profiles!products_vendor_id_fkey (
            shop_name,
            shop_description,
            has_physical_store,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <h2 className="text-xl font-bold">Produit introuvable</h2>
        <Button onClick={() => navigate('/catalogue')}>Retour au catalogue</Button>
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
      vendorName: (product.vendor as any)?.shop_name || 'Vendeur March Connect',
      vendorCity: 'Cameroun',
    }, quantity);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé par "${product.name}" à ${formatPrice(product.price)}`);
    window.open(`https://wa.me/237600000000?text=${message}`, '_blank');
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
                <button className="w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors">
                  <Share2 className="w-5 h-5" />
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
                  <span>(24 avis)</span>
                </div>
                <span>•</span>
                <span>128 vues</span>
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
                    {(product.vendor as any)?.has_physical_store && (
                      <BadgeCheck className="w-5 h-5 text-yarid-blue fill-yarid-blue/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    Cameroun
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs bg-yarid-green/10 text-yarid-green px-2 py-1 rounded-full">
                      Vendeur Vérifié
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Membre depuis {new Date((product.vendor as any)?.created_at).getFullYear() || 2024}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
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
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
