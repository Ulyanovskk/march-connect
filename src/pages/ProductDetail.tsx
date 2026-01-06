import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, MessageCircle, BadgeCheck, MapPin, Store, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { demoProducts, formatPrice, getDiscount } from '@/lib/demo-data';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Find product from demo data
  const product = demoProducts.find(p => p.id === id) || demoProducts[0];
  const discount = getDiscount(product.price, product.original_price);

  // Simulated additional images for gallery
  const images = [
    product.images[0],
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    console.log('Added to cart:', { product, quantity });
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé par "${product.name}" à ${formatPrice(product.price)}`);
    window.open(`https://wa.me/237600000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to="/catalogue" className="hover:text-primary">Catalogue</Link>
          <span>/</span>
          <span className="text-foreground">{product.category.name}</span>
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
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === index 
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
                {product.category.name}
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
                    <span className="font-semibold">{product.vendor.shop_name}</span>
                    {product.vendor.is_verified && (
                      <BadgeCheck className="w-5 h-5 text-yarid-blue fill-yarid-blue/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {product.vendor.city}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs bg-yarid-green/10 text-yarid-green px-2 py-1 rounded-full">
                      98% satisfaction
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Membre depuis 2023
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
                  Livraison disponible à {product.vendor.city} et environs
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
