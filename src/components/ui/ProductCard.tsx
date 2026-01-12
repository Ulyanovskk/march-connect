import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, MapPin, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getDiscount } from '@/lib/demo-data';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProductViewTracking } from '@/hooks/useProductViewTracking';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  vendorName?: string;
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
  vendorCity,
  isVerified,
  stock = 1,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const discount = getDiscount(price, originalPrice ?? null);
  const isOutOfStock = stock <= 0;

  // No click handler needed - tracking happens in ProductDetail page
  // This keeps the navigation fast and reliable

  const prefetchProduct = async () => {
    try {
      // Vérifier d'abord si le produit existe
      const { data: productCheck, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (checkError || !productCheck) {
        // Ne pas prefetch si le produit n'existe pas
        return;
      }

      // Prefetch seulement si le produit existe
      queryClient.prefetchQuery({
        queryKey: ['product', id],
        queryFn: async () => {
          const { data, error } = await (supabase as any)
            .from('products')
            .select(`
              *,
              category:categories (name, slug),
              vendor:vendors (
                shop_name,
                description,
                created_at
              )
            `)
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      // Silencieux - on ne veut pas interrompre l'expérience utilisateur
      console.debug('Prefetch failed for product:', id);
    }
  };

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

  return (
    <div
      onMouseEnter={prefetchProduct}
      className="group bg-card rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
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
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Vendor info */}
        {vendorName && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1.5">
            <span className="truncate max-w-[60px] sm:max-w-none">{vendorName}</span>
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
