import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Commande confirmée !</h1>
            <p className="text-muted-foreground text-lg">
              Votre paiement a été traité avec succès. Vous recevrez un email de confirmation sous peu.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm">Numéro de commande : YAR-2026-001234</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Un agent YARID vous contactera pour confirmer les détails de livraison.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/catalogue">
                <ShoppingBag className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;

