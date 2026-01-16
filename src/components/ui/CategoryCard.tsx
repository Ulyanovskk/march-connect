import { Link } from 'react-router-dom';
import {
  Smartphone,
  Refrigerator,
  Laptop,
  Gamepad2,
  Wrench,
  MapPin,
  Heart,
  Shirt,
  Dumbbell,
  LucideIcon
} from 'lucide-react';

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Refrigerator,
  Laptop,
  Gamepad2,
  Wrench,
  MapPin,
  Heart,
  Shirt,
  Dumbbell,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string | null;
  productCount?: number;
}

const CategoryCard = ({ name, slug, icon, productCount }: CategoryCardProps) => {
  const IconComponent = icon ? iconMap[icon] || Smartphone : Smartphone;

  return (
    <Link
      to={`/catalogue?category=${slug}`}
      className="group flex flex-col items-center p-2 sm:p-4 transition-all duration-300 hover:-translate-y-1 touch-target min-h-0"
    >
      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-[22px] bg-primary/10 flex items-center justify-center mb-0 sm:mb-3 group-hover:bg-primary/20 transition-all duration-300">
        <IconComponent className="h-9 w-9 sm:h-12 sm:w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="mt-2 text-[9px] sm:text-sm font-medium sm:font-bold text-center text-muted-foreground/80 group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2 leading-tight break-words px-1">
        {name}
      </h3>
      {productCount !== undefined && (
        <p className="hidden sm:block text-[9px] sm:text-xs text-muted-foreground mt-1">{productCount} produits</p>
      )}
    </Link>
  );
};

export default CategoryCard;
