import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home, Loader2, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/demo-data';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

          if (error) throw error;
          setOrder(data);
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">Récupération des détails de votre commande...</p>
            </div>
          ) : order ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Commande confirmée !</h1>
                <p className="text-muted-foreground text-lg">
                  Votre commande a été enregistrée avec succès. {order.payment_method !== 'cash' && "Elle sera traitée dès que votre paiement sera vérifié."}
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-8 shadow-soft space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">N° Commande</p>
                      <p className="font-mono font-bold text-lg text-primary">{order.order_number || order.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Montant Total</p>
                    <p className="font-bold text-xl">{formatPrice(order.total || order.total_amount)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Prochaines étapes :
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground pl-6 list-disc">
                    <li>Un agent YARID ou le vendeur vous contactera pour confirmer la livraison.</li>
                    <li>{order.payment_method === 'cash' ? "Le paiement se fera à la livraison." : "Le statut de votre commande passera à 'Paid' dès validation de votre transaction."}</li>
                    <li>Vous pouvez suivre l'état de votre commande dans votre espace client.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/shop">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à la boutique
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <Link to="/profile">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Mes commandes
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="py-20 space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Oups ! Commande introuvable</h2>
              <p className="text-muted-foreground">Nous n'avons pas pu récupérer les détails de votre commande.</p>
              <Button asChild>
                <Link to="/shop">Retour à la boutique</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
