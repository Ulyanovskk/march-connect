import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Phone } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/demo-data';

const Checkout = () => {
  const { items, itemCount, total } = useCart();

  // Si le panier est vide, rediriger visuellement vers le panier
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemCount={itemCount} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Votre panier est vide</h1>
            <p className="text-muted-foreground">
              Ajoutez des produits à votre panier avant de continuer votre commande.
            </p>
            <Link to="/catalogue">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au catalogue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Finaliser ma commande</h1>
              <p className="text-muted-foreground text-sm">
                Vérifiez votre panier et renseignez vos informations avant de confirmer.
              </p>
            </div>
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au panier
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne gauche : résumé des articles */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold mb-4">Articles dans votre commande</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.name}</p>
                        {item.vendorName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.vendorName} • {item.vendorCity}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Quantité : <span className="font-medium">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloc informations client (statique pour l’instant) */}
              <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                <h2 className="font-semibold">Informations de contact & livraison</h2>
                <p className="text-sm text-muted-foreground">
                  Pour l’instant, la finalisation se fait avec notre équipe via WhatsApp. 
                  Indiquez clairement dans le message votre <span className="font-semibold">nom complet</span>, 
                  votre <span className="font-semibold">ville</span> et votre <span className="font-semibold">numéro de téléphone</span>.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Livraison disponible dans les grandes villes du Cameroun.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Support WhatsApp pour confirmer les détails de la commande.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : récapitulatif paiement */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                <h2 className="font-semibold text-lg mb-6">Récapitulatif du paiement</h2>

                {/* Layout horizontal bien organisé */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Total produits</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="font-semibold text-base whitespace-nowrap">{formatPrice(total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Frais de livraison</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm text-accent font-medium whitespace-nowrap">À confirmer</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Montant estimé</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="font-bold text-2xl text-primary whitespace-nowrap">
                        {formatPrice(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Informations importantes */}
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Le montant final (avec livraison) sera confirmé par un agent YARID sur WhatsApp avant validation.
                  </p>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3 mb-6">
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-14 text-base font-semibold gap-2"
                  >
                    <Link to="/cart">
                      Modifier mon panier
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const orderDetails = items.map(item => 
                        `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
                      ).join('\\n');
                      const message = encodeURIComponent(
                        `🛒 Demande de confirmation de commande YARID\\n\\n${orderDetails}\\n\\n💰 Total estimé: ${formatPrice(total)}\\n\\nNom complet: [À renseigner]\\nVille: [À renseigner]\\nTéléphone: [À renseigner]`
                      );
                      window.open(`https://wa.me/237600000000?text=${message}`, '_blank');
                    }}
                  >
                    Confirmer par WhatsApp
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Garanties de sécurité */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Paiement sécurisé (Mobile Money ou Cash à la livraison).</span>
                  </div>
                  <p>Un agent vous contactera pour valider les détails et la livraison.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;


