import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import yaridLogo from '@/assets/yarid-logo.jpg';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  cartItemCount?: number;
}

const Header = ({ cartItemCount = 0 }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 w-full bg-muted/50 border-0 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
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
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 w-full bg-muted/50 border-0"
            />
          </div>
        </div>
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
