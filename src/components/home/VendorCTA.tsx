import { Link } from 'react-router-dom';
import { Store, Percent, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VendorCTA = () => {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-secondary p-8 md:p-12">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Vendez sur YARID 🚀
              </h2>
              <p className="text-white/90 mb-6 text-lg">
                Rejoignez des centaines de vendeurs camerounais et touchez des milliers de clients.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Inscription gratuite</p>
                    <p className="text-sm text-white/70">Aucun frais pour commencer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Commission de seulement 15%</p>
                    <p className="text-sm text-white/70">Sur les ventes réalisées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Tableau de bord complet</p>
                    <p className="text-sm text-white/70">Gérez vos produits et commandes</p>
                  </div>
                </div>
              </div>

              <Button 
                asChild 
                size="lg" 
                className="bg-white text-secondary hover:bg-white/90 font-semibold"
              >
                <Link to="/vendeur/inscription">
                  Créer ma boutique
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Store className="h-24 w-24 text-white/80" />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-xl shadow-medium">
                  <p className="font-bold text-foreground">+100</p>
                  <p className="text-xs text-muted-foreground">Vendeurs actifs</p>
                </div>
                <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-accent rounded-xl text-accent-foreground">
                  <p className="font-bold">0 FCFA</p>
                  <p className="text-xs">Pour commencer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorCTA;
