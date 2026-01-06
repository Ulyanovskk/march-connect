import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/demo-data';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, itemCount, total, savings } = useCart();

  const handleWhatsAppOrder = () => {
    const orderDetails = items.map(item => 
      `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const message = encodeURIComponent(
      `🛒 Nouvelle commande YARID\n\n${orderDetails}\n\n💰 Total: ${formatPrice(total)}\n\nMerci de me contacter pour finaliser la commande.`
    );
    window.open(`https://wa.me/237600000000?text=${message}`, '_blank');
  };

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
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link to="/catalogue">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voir le catalogue
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
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mon panier</h1>
            <p className="text-muted-foreground">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Vider
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-4 shadow-soft">
                <div className="flex gap-4">
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    {item.vendorName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.vendorName} • {item.vendorCity}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-l-xl"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-r-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
              <h2 className="font-bold text-lg mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(total + savings)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-yarid-green">
                    <span>Économies</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-yarid-green">À calculer</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-baseline mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
              </div>

              <div className="space-y-3">
                <Link to="/checkout">
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-semibold gap-2"
                  >
                    Continuer vers le paiement
                  </Button>
                </Link>

                <Button 
                  onClick={handleWhatsAppOrder}
                  size="lg" 
                  variant="outline"
                  className="w-full h-14 text-base font-semibold gap-2 border-yarid-green text-yarid-green hover:bg-yarid-green/5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Commander via WhatsApp
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Paiement par Orange Money, MTN Money ou Cash à la livraison
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  ✓ Vendeurs vérifiés
                </p>
                <p className="flex items-center gap-2">
                  ✓ Paiement sécurisé
                </p>
                <p className="flex items-center gap-2">
                  ✓ Support client 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
