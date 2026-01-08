import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary opacity-95" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
            <span className="animate-pulse">🔥</span>
            <span>Plus de 500 produits disponibles</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Le e-commerce par vous et pour vous
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Achetez et vendez vos équipements électroniques en toute confiance partout au Cameroun
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <Link to="/catalogue">
                Explorer le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/80 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold"
            >
              <Link to="/signup?vendor=true">
                Devenir vendeur
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Livraison nationale</p>
                <p className="text-xs text-white/70">Douala, Yaoundé et plus</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Paiement sécurisé</p>
                <p className="text-xs text-white/70">Orange Money, MTN MoMo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Support WhatsApp</p>
                <p className="text-xs text-white/70">Réponse rapide 7j/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
