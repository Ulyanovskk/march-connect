import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://media.istockphoto.com/id/508340372/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%BA%D1%80%D0%B0%D1%81%D0%B8%D0%B2%D0%B0%D1%8F-%D0%BC%D0%BE%D0%BB%D0%BE%D0%B4%D0%B0%D1%8F-%D0%B0%D1%84%D1%80%D0%B8%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F-%D0%B6%D0%B5%D0%BD%D1%89%D0%B8%D0%BD%D0%B0-%D1%83%D0%BB%D1%8B%D0%B1%D0%B0%D0%B5%D1%82%D1%81%D1%8F-%D0%BD%D0%B0-%D1%83%D0%BB%D0%B8%D1%86%D0%B5-%D1%81-%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD.jpg?s=612x612&w=0&k=20&c=e2ufD8zr6LpdGOuB96IPqmLJ4XRUMbn4PwBrEQHKj2g="
          alt="Shopping en ligne"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/80" />
      </div>

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
