import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
import { demoCategories } from '@/lib/demo-data';

const CategoriesSection = () => {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Catégories
            </h2>
            <p className="text-muted-foreground mt-1">
              Trouvez ce que vous cherchez
            </p>
          </div>
          <Link 
            to="/categories" 
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-4">
          {demoCategories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              icon={category.icon}
            />
          ))}
        </div>

        {/* Mobile link */}
        <Link 
          to="/categories" 
          className="sm:hidden flex items-center justify-center gap-1 text-primary font-medium mt-6 touch-target"
        >
          Voir toutes les catégories
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default CategoriesSection;
