import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, MapPin, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getDiscount } from '@/lib/demo-data';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useWishlist } from '@/hooks/useWishlist';
import { optimizeImage, generateSrcSet } from '@/lib/imageOptimizer';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  vendorName?: string;
  vendorId?: string;
  vendorCity?: string;
  isVerified?: boolean;
  stock?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  vendorName,
  vendorId,
  vendorCity,
  isVerified,
  stock = 1,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { isLiked, isLiking, toggleWishlist } = useWishlist(id);
  const discount = getDiscount(price, originalPrice ?? null);
  const isOutOfStock = stock <= 0;

  // No click handler needed - tracking happens in ProductDetail page
  // Prefetch removed for performance - was causing too many requests

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id,
      name,
      price,
      originalPrice,
      image,
      vendorName,
      vendorCity,
    });
    toast.success(`${name} ajouté au panier !`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist();
  };

  return (
    <div
      className="group bg-card rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={optimizeImage(image, { width: 400, quality: 80 })}
          srcSet={generateSrcSet(image, [200, 400, 600])}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <Badge className="bg-secondary text-secondary-foreground font-semibold">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive">Rupture</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isLiking}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-90 ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Vendor info */}
        {vendorName && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1.5">
            {vendorId ? (
              <Link to={`/boutique/${vendorId}`} className="truncate max-w-[60px] sm:max-w-none hover:text-primary transition-colors font-bold">
                {vendorName}
              </Link>
            ) : (
              <span className="truncate max-w-[60px] sm:max-w-none">{vendorName}</span>
            )}
            {isVerified && <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />}
            {vendorCity && (
              <div className="flex items-center gap-0.5 shrink-0 ml-auto sm:ml-0">
                <span className="hidden sm:inline">•</span>
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>{vendorCity}</span>
              </div>
            )}
          </div>
        )}

        {/* Product name */}
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-0">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-3">
          <span className="text-sm sm:text-lg font-bold text-primary">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          className="w-full gap-1 sm:gap-2 px-1 sm:px-4 h-9 sm:h-10 text-[10px] sm:text-sm font-bold"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">
            {isOutOfStock ? (
              'Rupture'
            ) : (
              <>
                <span className="hidden sm:inline">Ajouter au panier</span>
                <span className="sm:hidden">Ajouter</span>
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
