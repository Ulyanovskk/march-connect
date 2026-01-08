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
import { toast } from 'sonner';

const Catalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const selectedCategory = searchParams.get('category') || '';
  const selectedCities = searchParams.getAll('city');
  const priceRange = searchParams.get('price') || '';
  const searchQuery = searchParams.get('q') || '';

  // Products Fetching with performance optimization (Server-side filtering where possible)
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, selectedCities.join(','), priceRange, searchQuery],
    queryFn: async () => {
      let query = (supabase as any)
        .from('products')
        .select(`
          *,
          vendor:profiles(shop_name, shop_city, avatar_url)
        `)
        .eq('is_active', true);

      if (selectedCategory) query = query.ilike('category', selectedCategory);
      if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

      // Basic price filtering in Supabase for speed
      if (priceRange) {
        const parts = priceRange.split('-');
        const min = parseInt(parts[0]);
        const max = parts[1] === '+' ? null : (parts[1] ? parseInt(parts[1]) : null);

        query = query.gte('price', min);
        if (max) query = query.lte('price', max);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by city locally as it's deeper in the join
      let result = data || [];
      if (selectedCities.length > 0) {
        result = result.filter((p: any) => selectedCities.includes(p.vendor?.shop_city));
      }

      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  const cities = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda'];
  const priceRanges = [
    { value: '0-100000', label: 'Moins de 100 000 FCFA' },
    { value: '100000-300000', label: '100 000 - 300 000 FCFA' },
    { value: '300000-500000', label: '300 000 - 500 000 FCFA' },
    { value: '500000-1000000', label: '500 000 - 1 000 000 FCFA' },
    { value: '1000000+', label: 'Plus de 1 000 000 FCFA' },
  ];

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

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
    }
    return result;
  }, [products, sortBy]);

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) searchParams.delete('category');
    else searchParams.set('category', slug);
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
    if (value === priceRange) searchParams.delete('price');
    else searchParams.set('price', value);
    setSearchParams(searchParams);
  };

  const clearFilters = () => setSearchParams({});

  const activeFiltersCount = [selectedCategory, ...selectedCities, priceRange].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="space-y-1">
          {demoCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === cat.slug
                ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20'
                : 'hover:bg-muted text-muted-foreground'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Ville</h3>
        <div className="space-y-2">
          {cities.map((city) => (
            <label key={city} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={selectedCities.includes(city)}
                onCheckedChange={() => handleCityToggle(city)}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm group-hover:text-primary transition-colors">{city}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handlePriceChange(range.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${priceRange === range.value
                ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20'
                : 'hover:bg-muted text-muted-foreground'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Notre Catalogue
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">
                Découvrez {sortedProducts.length} pépites sélectionnées pour vous
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-none shadow-sm h-11 rounded-xl">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="popular">💎 Plus populaires</SelectItem>
                  <SelectItem value="newest">🆕 Plus récents</SelectItem>
                  <SelectItem value="price-asc">📈 Prix croissant</SelectItem>
                  <SelectItem value="price-desc">📉 Prix décroissant</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center bg-white p-1 rounded-xl shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-lg h-9 w-9"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-lg h-9 w-9"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <div className="hidden lg:block sticky top-24 bg-white rounded-2xl p-6 shadow-soft border border-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-xl tracking-tight">Filtres</h2>
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <FilterContent />
              </div>

              <div className="lg:hidden flex items-center gap-2 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl bg-white border-none shadow-sm gap-2 font-bold">
                      <Filter className="h-4 w-4" />
                      Affiner ma recherche
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 p-0 flex items-center justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:w-[400px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-2xl font-black">Filtres</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                  </SheetContent>
                </Sheet>
              </div>
            </aside>

            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse shadow-sm" />
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-4'
                }>
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images?.[0]}
                      vendorName={(product.vendor as any)?.shop_name || 'Vendeur Vérifié'}
                      vendorCity={(product.vendor as any)?.shop_city || 'Cameroun'}
                      isVerified={true}
                      stock={product.stock}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl py-20 px-6 text-center shadow-soft border border-white">
                  <div className="w-24 h-24 bg-muted/30 mx-auto mb-6 rounded-full flex items-center justify-center">
                    <Filter className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Nous n'avons trouvé aucun produit correspondant à vos filtres actuels. Essayez d'élargir votre recherche.
                  </p>
                  <Button size="lg" className="rounded-xl px-10 font-bold" onClick={clearFilters}>
                    Réinitialiser tout
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
