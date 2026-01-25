import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Store, Package, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import yaridLogo from '@/assets/yarid-logo.jpg';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/demo-data';
import { toast } from 'sonner';

interface HeaderProps {
  cartItemCount?: number;
}

const Header = ({ cartItemCount = 0 }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<{ products: any[], vendors: any[] }>({ products: [], vendors: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions({ products: [], vendors: [] });
        return;
      }

      const [{ data: products }, { data: vendors }] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, images, vendor:vendors(shop_name)')
          .ilike('name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(4),
        supabase
          .from('vendors')
          .select('id, shop_name, logo_url, city')
          .ilike('shop_name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(2)
      ]);

      setSuggestions({
        products: products || [],
        vendors: vendors || []
      });
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update search query state when URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any remaining Yarid specific local data if necessary 
      // but NOT the cart since we want it in guest mode

      toast.success("Déconnexion réussie");

      // Hard redirect to clear all state and avoid residual session redirects
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error("Erreur lors de la déconnexion");
      // Fallback redirect
      window.location.href = '/';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalogue');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-soft">
      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={yaridLogo}
              alt="YARID"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit, une marque..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 pr-4 h-11 w-full bg-muted/50 border-0 focus-visible:ring-primary rounded-xl"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (searchQuery.length >= 2) && (suggestions.products.length > 0 || suggestions.vendors.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Products Section */}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        <span>Produits</span>
                        <Package className="w-3 h-3" />
                      </div>
                      <div className="space-y-1">
                        {suggestions.products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              navigate(`/product/${p.id}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <img src={p.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">{p.vendor?.shop_name || 'Vendeur Yarid'}</p>
                            </div>
                            <div className="text-sm font-black text-primary">
                              {formatPrice(p.price)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendors Section */}
                  {suggestions.vendors.length > 0 && (
                    <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        <span>Boutiques</span>
                        <Store className="w-3 h-3" />
                      </div>
                      <div className="space-y-1">
                        {suggestions.vendors.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              navigate(`/boutique/${v.id}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-left border border-transparent hover:border-slate-100"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0">
                              {v.logo_url ? (
                                <img src={v.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{v.shop_name}</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">{v.city || 'Cameroun'}</p>
                            </div>
                            <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleSearch({ preventDefault: () => { } } as any);
                      setShowSuggestions(false);
                    }}
                    className="w-full p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100"
                  >
                    Voir tous les résultats pour "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/profile?tab=wishlist">
              <Button variant="ghost" size="icon" className="relative touch-target text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative touch-target">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground border-2 border-background shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-2 font-medium">
                      {user.email?.split('@')[0]}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Quitter
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="font-bold">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="default" size="sm" className="font-bold bg-primary hover:bg-primary/90">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-target"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-4 h-10 w-full bg-muted/50 border-0 focus-visible:ring-primary rounded-xl"
            />

            {/* Mobile Suggestions Dropdown */}
            {showSuggestions && (searchQuery.length >= 2) && (suggestions.products.length > 0 || suggestions.vendors.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Products Section */}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        <span>Produits</span>
                        <Package className="w-3 h-3" />
                      </div>
                      <div className="space-y-1">
                        {suggestions.products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              navigate(`/product/${p.id}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">{formatPrice(p.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendors Section */}
                  {suggestions.vendors.length > 0 && (
                    <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        <span>Boutiques</span>
                        <Store className="w-3 h-3" />
                      </div>
                      <div className="space-y-1">
                        {suggestions.vendors.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              navigate(`/boutique/${v.id}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-left border border-transparent hover:border-slate-100"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0">
                              {v.logo_url ? (
                                <img src={v.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{v.shop_name}</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">{v.city}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleSearch({ preventDefault: () => { } } as any);
                      setShowSuggestions(false);
                    }}
                    className="w-full p-4 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100"
                  >
                    Voir tous les résultats pour "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/catalogue"
              className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target"
              onClick={() => setIsMenuOpen(false)}
            >
              Catalogue
            </Link>
            <Link
              to="/profile?tab=wishlist"
              className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-4 w-4 text-rose-500" />
              Ma Wishlist
            </Link>
            {user ? (
              <>
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Mon Compte
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon profil ({user.email?.split('@')[0]})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target text-destructive font-bold flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-3 rounded-lg bg-primary text-white transition-colors touch-target font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
            <Link
              to="/vendor/dashboard"
              className="block px-4 py-3 rounded-lg bg-secondary text-secondary-foreground transition-colors touch-target"
              onClick={() => setIsMenuOpen(false)}
            >
              Espace vendeur
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
