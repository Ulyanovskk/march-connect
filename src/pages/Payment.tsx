import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Smartphone, Coins, ShieldCheck, Lock, Copy, Check, AlertCircle, User, MapPin, Phone, Mail } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PaymentMethod = 'card' | 'paypal' | 'orange_money' | 'mtn_momo' | 'binance';

// Numéros de paiement (à configurer par le propriétaire)
const PAYMENT_CONFIG = {
  orange_money: {
    number: '237 6XX XXX XXX',
    name: 'YARID SHOP'
  },
  mtn_momo: {
    number: '237 6XX XXX XXX',
    name: 'YARID SHOP'
  },
  binance: {
    wallet: 'TRC20: TXXX...XXXX',
    payId: 'yarid_shop'
  }
};

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, itemCount, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'payment'>('info');

  // Données client
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  // Référence de transaction pour paiement manuel
  const [transactionRef, setTransactionRef] = useState('');

  // Check for cancelled payment
  useEffect(() => {
    if (searchParams.get('status') === 'cancelled') {
      toast.error('Le paiement a été annulé');
    }
  }, [searchParams]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateCustomerInfo = () => {
    if (!customerInfo.name.trim()) {
      toast.error('Veuillez entrer votre nom complet');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return false;
    }
    if (!customerInfo.address.trim()) {
      toast.error('Veuillez entrer votre adresse de livraison');
      return false;
    }
    if (!customerInfo.city.trim()) {
      toast.error('Veuillez entrer votre ville');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateCustomerInfo()) {
      setStep('payment');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleStripePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          customerInfo,
          paymentMethod
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors de la création du paiement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPayment = async () => {
    if (!transactionRef.trim()) {
      toast.error('Veuillez entrer la référence de votre transaction');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id || null;

      // Récupérer le vendor_id du premier article pour lier la commande
      const { data: product } = await supabase
        .from('products')
        .select('vendor_id')
        .eq('id', items[0].id)
        .single();

      const vendorId = product?.vendor_id || null;

      // 1. Créer d'abord l'adresse de livraison
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          label: 'Adresse de livraison',
          full_name: customerInfo.name,
          phone: customerInfo.phone,
          address_line1: customerInfo.address,
          city: customerInfo.city,
          is_default: false
        })
        .select()
        .single();

      if (addressError) throw addressError;

      // Générer un numéro de commande unique
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `YAR-${year}-${randomNumber}`;

      // 2. Créer la commande principale
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId,
          vendor_id: vendorId,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          shipping_address_id: address.id,
          status: 'pending',
          subtotal: total,
          total_amount: total,
          notes: `Paiement par ${paymentMethod}`,
          payment_method: paymentMethod,
          payment_reference: transactionRef,
          payment_status: 'pending' // Explicitly set payment status
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Créer les détails des articles (order_items)
      const orderItems = [];

      for (const item of items) {
        // Récupérer le vendor_id du produit
        const { data: productData, error: productError } = await (supabase as any)
          .from('products')
          .select('vendor_id')
          .eq('id', item.id)
          .single();

        if (productError) {
          console.error(`❌ Erreur récupération vendor_id pour produit ${item.id}:`, productError);
          toast.error(`Erreur avec le produit ${item.name}: ${productError.message}`);
          throw new Error(`Impossible de récupérer les informations du produit ${item.name}`);
        }

        if (!productData?.vendor_id) {
          console.error(`❌ Produit ${item.id} n'a pas de vendor_id`);
          toast.error(`Le produit ${item.name} n'est pas associé à un vendeur`);
          throw new Error(`Produit ${item.name} invalide: vendor_id manquant`);
        }

        orderItems.push({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          vendor_id: productData.vendor_id
        });
      }

      // Insérer tous les order_items en une seule requête
      console.log('📦 Insertion des order_items:', orderItems);
      const { data: insertedItems, error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('❌ Erreur création order_items:', itemsError);
        toast.error(`Erreur création des articles: ${itemsError.message}`);
        throw new Error(`Impossible de créer les articles de la commande: ${itemsError.message}`);
      }

      console.log('✅ Order_items créés avec succès:', insertedItems);

      toast.success('Commande créée ! Votre paiement sera vérifié sous 24h.');
      clearCart();
      navigate(`/order-confirmation?order_id=${order.id}&status=pending`);
    } catch (error: any) {
      console.error('Manual payment error:', error);
      toast.error(`Erreur : ${error.message || 'Impossible de créer la commande'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card' || paymentMethod === 'paypal') {
      await handleStripePayment();
    } else {
      await handleManualPayment();
    }
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Paiement sécurisé</h1>
              <p className="text-muted-foreground text-sm">
                {step === 'info' ? 'Renseignez vos informations de livraison' : 'Choisissez votre méthode de paiement'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => step === 'payment' ? setStep('info') : navigate('/checkout')}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'info' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
              <User className="w-4 h-4" />
              <span>1. Informations</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <CreditCard className="w-4 h-4" />
              <span>2. Paiement</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Colonne gauche : Formulaire */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                {step === 'info' ? (
                  /* Étape 1: Informations client */
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">Informations de livraison</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Jean Dupont"
                          value={customerInfo.name}
                          onChange={handleCustomerChange}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+237 6XX XXX XXX"
                            value={customerInfo.phone}
                            onChange={handleCustomerChange}
                            className="h-12 pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (optionnel)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={customerInfo.email}
                            onChange={handleCustomerChange}
                            className="h-12 pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          placeholder="Douala"
                          value={customerInfo.city}
                          onChange={handleCustomerChange}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse de livraison *</Label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Quartier, Rue..."
                          value={customerInfo.address}
                          onChange={handleCustomerChange}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleContinueToPayment}
                      size="lg"
                      className="w-full h-14 text-base font-semibold"
                    >
                      Continuer vers le paiement
                      <ArrowLeft className="w-5 h-5 rotate-180 ml-2" />
                    </Button>
                  </div>
                ) : (
                  /* Étape 2: Méthode de paiement */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Lock className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">Méthode de paiement</h2>
                    </div>

                    {/* Sélection de la méthode */}
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                      <div className="space-y-3">
                        {/* Carte bancaire */}
                        <Label
                          htmlFor="card"
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card'
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
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'paypal'
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
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'orange_money'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <RadioGroupItem value="orange_money" id="orange_money" />
                          <Smartphone className="w-5 h-5 text-orange-600" />
                          <div className="flex-1">
                            <span className="font-medium">Orange Money</span>
                            <p className="text-xs text-muted-foreground">Paiement manuel via Orange Money</p>
                          </div>
                        </Label>

                        {/* MTN Mobile Money */}
                        <Label
                          htmlFor="mtn_momo"
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'mtn_momo'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                          <Smartphone className="w-5 h-5 text-yellow-600" />
                          <div className="flex-1">
                            <span className="font-medium">MTN Mobile Money</span>
                            <p className="text-xs text-muted-foreground">Paiement manuel via MTN MoMo</p>
                          </div>
                        </Label>

                        {/* Binance (Crypto) */}
                        <Label
                          htmlFor="binance"
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'binance'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <RadioGroupItem value="binance" id="binance" />
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <div className="flex-1">
                            <span className="font-medium">Binance / Crypto</span>
                            <p className="text-xs text-muted-foreground">Paiement en USDT (TRC20)</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-primary mb-1">Paiement 100% sécurisé & Logistique YARID</p>
                        <p className="text-muted-foreground leading-relaxed">
                          « Pour votre sécurité, tous les paiements sont centralisés par <span className="font-bold text-foreground">YARID</span>. La logistique et la livraison sont entièrement prises en charge par nos services. Les vendeurs ne reçoivent les fonds qu'après confirmation de la livraison et validation de la conformité du produit. »
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Instructions selon la méthode choisie */}
                    <div className="space-y-4">
                      {(paymentMethod === 'card' || paymentMethod === 'paypal') && (
                        <Alert>
                          <ShieldCheck className="w-4 h-4" />
                          <AlertDescription>
                            Vous serez redirigé vers une page de paiement sécurisée pour finaliser votre achat.
                          </AlertDescription>
                        </Alert>
                      )}

                      {paymentMethod === 'orange_money' && (
                        <div className="space-y-4">
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                              <strong>Instructions :</strong>
                              <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>Envoyez <strong>{formatPrice(total)}</strong> au numéro ci-dessous</li>
                                <li>Notez l'ID de transaction reçu par SMS</li>
                                <li>Entrez l'ID de transaction ci-dessous</li>
                              </ol>
                            </AlertDescription>
                          </Alert>

                          <div className="p-4 bg-orange-100 rounded-xl space-y-2">
                            <p className="text-sm font-medium text-orange-800">Numéro Orange Money :</p>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-lg font-bold text-orange-900">{PAYMENT_CONFIG.orange_money.number}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(PAYMENT_CONFIG.orange_money.number.replace(/\s/g, ''), 'Numéro')}
                              >
                                {copied === 'Numéro' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-orange-700">Nom : {PAYMENT_CONFIG.orange_money.name}</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transactionRef">ID de transaction Orange Money *</Label>
                            <Input
                              id="transactionRef"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                              placeholder="Ex: OM123456789"
                              className="h-12 font-mono"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'mtn_momo' && (
                        <div className="space-y-4">
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                              <strong>Instructions :</strong>
                              <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>Envoyez <strong>{formatPrice(total)}</strong> au numéro ci-dessous</li>
                                <li>Notez l'ID de transaction reçu par SMS</li>
                                <li>Entrez l'ID de transaction ci-dessous</li>
                              </ol>
                            </AlertDescription>
                          </Alert>

                          <div className="p-4 bg-yellow-100 rounded-xl space-y-2">
                            <p className="text-sm font-medium text-yellow-800">Numéro MTN MoMo :</p>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-lg font-bold text-yellow-900">{PAYMENT_CONFIG.mtn_momo.number}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(PAYMENT_CONFIG.mtn_momo.number.replace(/\s/g, ''), 'Numéro')}
                              >
                                {copied === 'Numéro' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-yellow-700">Nom : {PAYMENT_CONFIG.mtn_momo.name}</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transactionRef">ID de transaction MTN MoMo *</Label>
                            <Input
                              id="transactionRef"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                              placeholder="Ex: MOMO123456789"
                              className="h-12 font-mono"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'binance' && (
                        <div className="space-y-4">
                          <Alert className="border-amber-200 bg-amber-50">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                              <strong>Instructions :</strong>
                              <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>Envoyez l'équivalent de <strong>{formatPrice(total)}</strong> en USDT</li>
                                <li>Utilisez le réseau <strong>TRC20</strong> (frais réduits)</li>
                                <li>Notez le TxID de la transaction</li>
                                <li>Entrez le TxID ci-dessous</li>
                              </ol>
                            </AlertDescription>
                          </Alert>

                          <div className="p-4 bg-amber-100 rounded-xl space-y-3">
                            <div>
                              <p className="text-sm font-medium text-amber-800">Adresse USDT (TRC20) :</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-mono text-sm font-bold text-amber-900 break-all">{PAYMENT_CONFIG.binance.wallet}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(PAYMENT_CONFIG.binance.wallet, 'Adresse')}
                                >
                                  {copied === 'Adresse' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800">Binance Pay ID :</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-mono text-sm font-bold text-amber-900">{PAYMENT_CONFIG.binance.payId}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(PAYMENT_CONFIG.binance.payId, 'Pay ID')}
                                >
                                  {copied === 'Pay ID' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transactionRef">TxID / Hash de transaction *</Label>
                            <Input
                              id="transactionRef"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                              placeholder="Ex: 0x1234...abcd"
                              className="h-12 font-mono text-sm"
                              required
                            />
                          </div>
                        </div>
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
                          Traitement...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5" />
                          {(paymentMethod === 'card' || paymentMethod === 'paypal')
                            ? `Payer ${formatPrice(total)}`
                            : 'Confirmer ma commande'
                          }
                        </span>
                      )}
                    </Button>
                  </form>
                )}
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

                {step === 'info' && customerInfo.name && (
                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Livraison à :</p>
                    <p className="text-sm font-medium">{customerInfo.name}</p>
                    {customerInfo.city && <p className="text-xs text-muted-foreground">{customerInfo.city}</p>}
                  </div>
                )}

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
