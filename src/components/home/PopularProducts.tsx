import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { demoProducts } from '@/lib/demo-data';

const PopularProducts = () => {
  return (
    <section className="py-10 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Produits populaires
              </h2>
              <p className="text-muted-foreground mt-0.5">
                Les plus demandés cette semaine
              </p>
            </div>
          </div>
          <Link 
            to="/catalogue" 
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {demoProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.original_price}
              image={product.images[0]}
              vendorName={product.vendor?.shop_name}
              vendorCity={product.vendor?.city}
              isVerified={product.vendor?.is_verified}
              stock={product.stock}
            />
          ))}
        </div>

        {/* Mobile link */}
        <Link 
          to="/catalogue" 
          className="sm:hidden flex items-center justify-center gap-1 text-primary font-medium mt-6 touch-target"
        >
          Voir tous les produits
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default PopularProducts;
