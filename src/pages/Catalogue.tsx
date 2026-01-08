import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3X3, List, ChevronDown, X, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { demoCategories, formatPrice } from '@/lib/demo-data';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Catalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const selectedCategory = searchParams.get('category') || '';
  const selectedCities = searchParams.getAll('city');
  const priceRange = searchParams.get('price') || '';

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select(`
          *,
          vendor:profiles!products_vendor_id_fkey (
            shop_name,
            shop_category,
            has_physical_store
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  const cities = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda'];
  const priceRanges = [
    { value: '0-100000', label: 'Moins de 100 000 FCFA' },
    { value: '100000-300000', label: '100 000 - 300 000 FCFA' },
    { value: '300000-500000', label: '300 000 - 500 000 FCFA' },
    { value: '500000-1000000', label: '500 000 - 1 000 000 FCFA' },
    { value: '1000000+', label: 'Plus de 1 000 000 FCFA' },
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(p => {
        // Handle both object category (old demo) and string category (new DB)
        const catSlug = typeof (p as any).category === 'string'
          ? (p as any).category.toLowerCase()
          : (p as any).category?.slug?.toLowerCase();

        return catSlug === selectedCategory.toLowerCase();
      });
    }

    // Filter by city (Note: in real DP, city might be in profile or product)
    if (selectedCities.length > 0) {
      // Assuming for now vendors are in specific cities or we add a city field
      // For the demo, let's keep it simple or filter by profiles if city is there
      // result = result.filter(p => p.vendor?.city ...); 
    }

    // Filter by price
    if (priceRange) {
      const parts = priceRange.split('-');
      const min = parseInt(parts[0]);
      const max = parts[1] === '+' ? Infinity : (parts[1] ? parseInt(parts[1]) : Infinity);

      result = result.filter(p => p.price >= min && p.price <= max);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, selectedCities, priceRange, sortBy]);

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleCityToggle = (city: string) => {
    const currentCities = searchParams.getAll('city');
    searchParams.delete('city');

    if (currentCities.includes(city)) {
      currentCities.filter(c => c !== city).forEach(c => searchParams.append('city', c));
    } else {
      [...currentCities, city].forEach(c => searchParams.append('city', c));
    }
    setSearchParams(searchParams);
  };

  const handlePriceChange = (value: string) => {
    if (value === priceRange) {
      searchParams.delete('price');
    } else {
      searchParams.set('price', value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory,
    ...selectedCities,
    priceRange
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="space-y-2">
          {demoCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div>
        <h3 className="font-semibold mb-3">Ville</h3>
        <div className="space-y-2">
          {cities.map((city) => (
            <label
              key={city}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedCities.includes(city)}
                onCheckedChange={() => handleCityToggle(city)}
              />
              <span className="text-sm">{city}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handlePriceChange(range.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceRange === range.value
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Catalogue
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active filters badges */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {demoCategories.find(c => c.slug === selectedCategory)?.name}
                    <button onClick={() => handleCategoryChange(selectedCategory)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCities.map(city => (
                  <Badge key={city} variant="secondary" className="gap-1">
                    {city}
                    <button onClick={() => handleCityToggle(city)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="newest">Plus récents</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="hidden md:flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex gap-8">
            {/* Desktop sidebar filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold text-lg mb-4">Filtres</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground font-medium italic">Chargement des produits réels...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-4'
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images?.[0]}
                      vendorName={(product.vendor as any)?.shop_name || 'Vendeur March Connect'}
                      vendorCity="Cameroun"
                      isVerified={(product.vendor as any)?.has_physical_store}
                      stock={product.stock}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Filter className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos filtres ou revenez plus tard.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalogue;
