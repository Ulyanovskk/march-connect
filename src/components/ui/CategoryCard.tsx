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
      className="group flex flex-col items-center p-4 bg-card rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 touch-target"
    >
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <IconComponent className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-sm font-medium text-center text-foreground line-clamp-2">{name}</h3>
      {productCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">{productCount} produits</p>
      )}
    </Link>
  );
};

export default CategoryCard;
