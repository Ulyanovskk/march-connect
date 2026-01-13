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
      console.log('Fetching products...');

      // Requête simple et directe
      let query = supabase
        .from('products')
        .select(`
          *,
          vendor:vendors (
            shop_name,
            is_verified,
            city
          ),
          category:categories (
            name
          )
        `)
        .eq('is_active', true);

      // Filtre de recherche serveur
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Products fetch error:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} products`);

      // Filtrer les produits valides
      const validProducts = (data || []).filter(product =>
        product.id &&
        product.name &&
        product.price &&
        product.images &&
        product.images.length > 0
      );

      console.log(`Valid products: ${validProducts.length}`);

      if (validProducts.length > 0) {
        console.log('First valid product sample:', {
          id: validProducts[0].id,
          name: validProducts[0].name,
          price: validProducts[0].price,
          stock: validProducts[0].stock,
          images: validProducts[0].images?.length || 0
        });
      }

      return (validProducts || []).map(p => ({
        ...p,
        category_name: p.category?.name || p.category_name // Fallback if name is in the object
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  // Static categories list (matching converted slugs from category names)
  const staticCategories = [
    { name: 'Téléphones & accessoires', slug: 'telephones-accessoires' },
    { name: 'Électroménagers', slug: 'electromenagers' },
    { name: 'Informatique', slug: 'informatique' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Industriel & BTP', slug: 'industriel-btp' },
    { name: '100% Cameroun', slug: '100-cameroun' },
    { name: 'Santé & bien-être', slug: 'sante-bien-etre' },
    { name: 'Mode', slug: 'mode' },
    { name: 'Sport', slug: 'sport' }
  ];

  // Fetch unique category names from products for dynamic filtering
  const { data: productCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_name')
        .not('category_name', 'is', null)
        .eq('is_active', true)
        .order('category_name');

      if (error) throw error;

      // Extraire les noms uniques
      const uniqueCategories = [...new Set(data?.map(p => p.category_name).filter(Boolean) || [])]
        .map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') }));

      return uniqueCategories;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const cities = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda'];
  const priceRanges = [
    { value: '0-100000', label: 'Moins de 100 000 FCFA' },
    { value: '100000-300000', label: '100 000 - 300 000 FCFA' },
    { value: '300000-500000', label: '300 000 - 500 000 FCFA' },
    { value: '500000-1000000', label: '500 000 - 1 000 000 FCFA' },
    { value: '1000000+', label: 'Plus de 1 000 000 FCFA' },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    // 1. Filtrer par catégorie
    let result = [...products];

    if (selectedCategory) {
      console.log('🔍 Filtering by category:', selectedCategory);
      result = result.filter(product => {
        // Filtrer par nom de catégorie directement
        if (!product.category_name) {
          console.log('❌ Product has no category_name:', product.id, product.name);
          return false;
        }

        // Convertir le nom en slug pour comparaison (même logique que generateSlug)
        const productSlug = product.category_name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')  // Remove accents
          .replace(/[^a-z0-9]/g, '-')        // Replace non-alphanumeric with -
          .replace(/-+/g, '-')               // Replace multiple - with single -
          .replace(/^-|-$/g, '');            // Remove leading/trailing -

        console.log(`🔄 Product: "${product.category_name}" -> slug: "${productSlug}" | Filter: "${selectedCategory}" | Match: ${productSlug === selectedCategory}`);

        const matches = productSlug === selectedCategory;
        if (matches) {
          console.log('✅ MATCH FOUND!', product.name, product.category_name);
        }
        return matches;
      });
    }

    // 2. Filtrer par ville
    if (selectedCities.length > 0) {
      result = result.filter(product =>
        product.vendor?.city && selectedCities.includes(product.vendor.city)
      );
    }

    // 3. Filtrer par recherche (nom ou description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category_name && product.category_name.toLowerCase().includes(query))
      );
    }

    // 4. Filtrer par prix
    if (priceRange) {
      result = result.filter(product => {
        const price = product.price;

        switch (priceRange) {
          case '0-100000':
            return price < 100000;
          case '100000-300000':
            return price >= 100000 && price <= 300000;
          case '300000-500000':
            return price >= 300000 && price <= 500000;
          case '500000-1000000':
            return price >= 500000 && price <= 1000000;
          case '1000000+':
            return price > 1000000;
          default:
            return true;
        }
      });
    }

    // 5. Trier les produits
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
  }, [products, selectedCategory, selectedCities, searchQuery, priceRange, sortBy]);

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
          {staticCategories.map((cat) => (
            <button
              key={cat.slug}
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
                Découvrez {filteredAndSortedProducts.length} pépites sélectionnées pour vous
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
              ) : filteredAndSortedProducts.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-4'
                }>
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images?.[0]}
                      vendorName={product.vendor?.shop_name || 'Boutique Yarid'}
                      vendorId={product.vendor_id}
                      vendorCity={product.vendor?.city || 'Cameroun'}
                      isVerified={product.vendor?.is_verified}
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
                    {searchQuery
                      ? `Nous n'avons trouvé aucun produit correspondant à "${searchQuery}".`
                      : "Nous n'avons trouvé aucun produit correspondant à vos filtres actuels."}
                    {" "}Essayez d'élargir votre recherche.
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
