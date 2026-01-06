import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import yaridLogo from '@/assets/yarid-logo.jpg';

interface HeaderProps {
  cartItemCount?: number;
}

const Header = ({ cartItemCount = 0 }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-soft">
      {/* Top bar - Delivery info */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          <span>Livraison dans tout le Cameroun 🇨🇲</span>
        </div>
      </div>

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
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-secondary text-secondary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User */}
            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Connexion
              </Button>
            </Link>

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
            <Link
              to="/login"
              className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors touch-target"
              onClick={() => setIsMenuOpen(false)}
            >
              Connexion / Inscription
            </Link>
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
