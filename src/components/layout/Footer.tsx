import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import yaridLogo from '@/assets/yarid-logo.jpg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/237695250379"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-secondary flex items-center justify-center shadow-medium hover:scale-110 transition-transform touch-target"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-secondary-foreground" />
      </a>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={yaridLogo} 
                alt="YARID" 
                className="h-12 w-auto object-contain bg-white rounded-lg p-1"
              />
            </div>
            <p className="text-sm text-primary-foreground/80">
              Votre marketplace camerounaise de confiance pour acheter et vendre des équipements électroniques.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Navigation</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/catalogue" className="hover:text-secondary transition-colors">Catalogue</Link></li>
              <li><Link to="/categories" className="hover:text-secondary transition-colors">Catégories</Link></li>
              <li><Link to="/vendeur" className="hover:text-secondary transition-colors">Devenir vendeur</Link></li>
              <li><Link to="/faq" className="hover:text-secondary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Légal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/terms-of-service" className="hover:text-secondary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-secondary transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/legal-notice" className="hover:text-secondary transition-colors">Mentions légales</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+237 695 250 379</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>contact@yarid.cm</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Douala, Cameroun</span>
              </li>
            </ul>
            <Button 
              asChild
              className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0"
            >
              <a href="https://wa.me/237695250379" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg">
              <div className="w-8 h-8 rounded bg-[#FF6600] flex items-center justify-center">
                <span className="text-white text-xs font-bold">OM</span>
              </div>
              <span className="text-sm">Orange Money</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg">
              <div className="w-8 h-8 rounded bg-[#FFCC00] flex items-center justify-center">
                <span className="text-black text-xs font-bold">MTN</span>
              </div>
              <span className="text-sm">MTN MoMo</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg">
              <span className="text-sm">💵 Paiement à la livraison</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-primary-foreground/70">
          <p>© {currentYear} YARID. Tous droits réservés. 🇨🇲</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
