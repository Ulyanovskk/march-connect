import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Smartphone, Coins, ShieldCheck, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/demo-data';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'paypal' | 'orange_money' | 'mtn_momo' | 'binance';

const Payment = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isLoading, setIsLoading] = useState(false);

  // Données du formulaire selon la méthode
  const [formData, setFormData] = useState({
    // Carte bancaire
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    // PayPal
    paypalEmail: '',
    // Orange Money / MTN MoMo
    phoneNumber: '',
    // Binance
    binanceEmail: '',
    binanceWallet: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation selon la méthode choisie
    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
        toast.error('Veuillez remplir tous les champs de la carte');
        setIsLoading(false);
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!formData.paypalEmail) {
        toast.error('Veuillez entrer votre email PayPal');
        setIsLoading(false);
        return;
      }
    } else if (paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo') {
      if (!formData.phoneNumber) {
        toast.error('Veuillez entrer votre numéro de téléphone');
        setIsLoading(false);
        return;
      }
    } else if (paymentMethod === 'binance') {
      if (!formData.binanceEmail || !formData.binanceWallet) {
        toast.error('Veuillez remplir tous les champs Binance');
        setIsLoading(false);
        return;
      }
    }

    // Simulation du paiement
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Paiement traité avec succès !');
    clearCart();
    setIsLoading(false);
    
    // Redirection vers une page de confirmation
    navigate('/order-confirmation');
  };

  // Si le panier est vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemCount={itemCount} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Votre panier est vide</h1>
            <p className="text-muted-foreground">
              Ajoutez des produits à votre panier avant de procéder au paiement.
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
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Paiement sécurisé</h1>
              <p className="text-muted-foreground text-sm">
                Choisissez votre méthode de paiement préférée
              </p>
            </div>
            <Link to="/checkout">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne gauche : Formulaire de paiement */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Méthode de paiement</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Sélection de la méthode */}
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                    <div className="space-y-3">
                      {/* Carte bancaire */}
                      <Label
                        htmlFor="card"
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium">Carte bancaire</span>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                        </div>
                      </Label>

                      {/* PayPal */}
                      <Label
                        htmlFor="paypal"
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Wallet className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <span className="font-medium">PayPal</span>
                          <p className="text-xs text-muted-foreground">Payer avec votre compte PayPal</p>
                        </div>
                      </Label>

                      {/* Orange Money */}
                      <Label
                        htmlFor="orange_money"
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'orange_money'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="orange_money" id="orange_money" />
                        <Smartphone className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <span className="font-medium">Orange Money</span>
                          <p className="text-xs text-muted-foreground">Paiement via Orange Money</p>
                        </div>
                      </Label>

                      {/* MTN Mobile Money */}
                      <Label
                        htmlFor="mtn_momo"
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'mtn_momo'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                        <Smartphone className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <span className="font-medium">MTN Mobile Money</span>
                          <p className="text-xs text-muted-foreground">Paiement via MTN MoMo</p>
                        </div>
                      </Label>

                      {/* Binance (Crypto) */}
                      <Label
                        htmlFor="binance"
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'binance'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="binance" id="binance" />
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                          <span className="font-medium">Binance Pay</span>
                          <p className="text-xs text-muted-foreground">Paiement en crypto-monnaie via Binance</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  {/* Formulaire selon la méthode choisie */}
                  <div className="space-y-4">
                    {paymentMethod === 'card' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Numéro de carte</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            className="h-12"
                            maxLength={19}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardHolder">Nom sur la carte</Label>
                          <Input
                            id="cardHolder"
                            name="cardHolder"
                            type="text"
                            placeholder="Jean Dupont"
                            value={formData.cardHolder}
                            onChange={handleChange}
                            className="h-12"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Date d'expiration</Label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              type="text"
                              placeholder="MM/AA"
                              value={formData.expiryDate}
                              onChange={handleChange}
                              className="h-12"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              type="text"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={handleChange}
                              className="h-12"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div className="space-y-2">
                        <Label htmlFor="paypalEmail">Email PayPal</Label>
                        <Input
                          id="paypalEmail"
                          name="paypalEmail"
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.paypalEmail}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Vous serez redirigé vers PayPal pour confirmer votre paiement
                        </p>
                      </div>
                    )}

                    {(paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo') && (
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          Numéro de téléphone {paymentMethod === 'orange_money' ? 'Orange' : 'MTN'}
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="+237 6XX XXX XXX"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Vous recevrez une demande de confirmation sur votre téléphone
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'binance' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="binanceEmail">Email Binance</Label>
                          <Input
                            id="binanceEmail"
                            name="binanceEmail"
                            type="email"
                            placeholder="votre@email.com"
                            value={formData.binanceEmail}
                            onChange={handleChange}
                            className="h-12"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="binanceWallet">Adresse du portefeuille Binance</Label>
                          <Input
                            id="binanceWallet"
                            name="binanceWallet"
                            type="text"
                            placeholder="0x..."
                            value={formData.binanceWallet}
                            onChange={handleChange}
                            className="h-12 font-mono text-sm"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Vous serez redirigé vers Binance Pay pour finaliser le paiement en crypto-monnaie
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement du paiement...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Payer {formatPrice(total)}
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Colonne droite : Récapitulatif */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-card rounded-2xl p-6 shadow-soft lg:sticky top-24">
                <h2 className="font-semibold text-lg mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Quantité : {item.quantity}
                        </p>
                        <p className="font-semibold text-sm text-primary mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="text-accent">À confirmer</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Paiement sécurisé et crypté. Vos données sont protégées.</span>
                  </div>
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

export default Payment;

