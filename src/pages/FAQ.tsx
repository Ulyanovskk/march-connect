import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { ChevronDown, ChevronUp, ShoppingCart, Package, CreditCard, Truck, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ = () => {
  const { itemCount } = useCart();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories: FAQCategory[] = [
    {
      title: 'Commandes et Paiement',
      icon: <ShoppingCart className="w-5 h-5" />,
      items: [
        {
          question: 'Comment passer une commande sur YARID ?',
          answer: 'Pour passer une commande, parcourez notre catalogue, ajoutez les produits qui vous intéressent à votre panier, puis cliquez sur "Continuer vers le paiement". Vous pourrez ensuite choisir votre méthode de paiement (Orange Money, MTN MoMo, carte bancaire, PayPal ou Binance Pay) et finaliser votre commande.'
        },
        {
          question: 'Quelles sont les méthodes de paiement acceptées ?',
          answer: 'YARID accepte plusieurs méthodes de paiement : Orange Money, MTN Mobile Money, cartes bancaires (Visa, Mastercard, American Express), PayPal et Binance Pay pour les paiements en crypto-monnaie. Vous pouvez également payer en espèces à la livraison.'
        },
        {
          question: 'Le paiement est-il sécurisé ?',
          answer: 'Oui, tous les paiements sont sécurisés et cryptés. Nous utilisons des prestataires de paiement certifiés PCI-DSS pour les transactions par carte bancaire. Vos informations de paiement ne sont jamais stockées sur nos serveurs.'
        },
        {
          question: 'Puis-je annuler ma commande ?',
          answer: 'Vous pouvez annuler votre commande avant qu\'elle ne soit expédiée. Contactez notre service client via WhatsApp dans les 24 heures suivant votre commande pour demander l\'annulation. Une fois la commande expédiée, vous devrez suivre la procédure de retour.'
        },
        {
          question: 'Comment puis-je suivre ma commande ?',
          answer: 'Une fois votre commande confirmée, vous recevrez un email de confirmation avec un numéro de suivi. Vous pouvez également contacter notre service client via WhatsApp pour obtenir des mises à jour sur l\'état de votre commande.'
        }
      ]
    },
    {
      title: 'Livraison',
      icon: <Truck className="w-5 h-5" />,
      items: [
        {
          question: 'Dans quelles villes livrez-vous ?',
          answer: 'Nous livrons dans toutes les grandes villes du Cameroun, notamment Douala, Yaoundé, Bafoussam, Bamenda, Garoua, Maroua, et bien d\'autres. Les frais de livraison varient selon votre localisation.'
        },
        {
          question: 'Quels sont les délais de livraison ?',
          answer: 'Les délais de livraison varient selon votre localisation et la disponibilité du produit. En général, comptez entre 2 à 7 jours ouvrés pour les grandes villes. Un agent YARID vous contactera pour confirmer les détails de livraison après votre commande.'
        },
        {
          question: 'Combien coûtent les frais de livraison ?',
          answer: 'Les frais de livraison sont calculés en fonction de votre localisation et du poids du colis. Le montant exact vous sera communiqué avant la finalisation de votre commande. Les frais peuvent varier entre 2000 et 10000 FCFA selon la destination.'
        },
        {
          question: 'Puis-je modifier mon adresse de livraison ?',
          answer: 'Vous pouvez modifier votre adresse de livraison avant que la commande ne soit expédiée. Contactez notre service client via WhatsApp avec votre numéro de commande pour effectuer cette modification.'
        },
        {
          question: 'Que faire si je ne suis pas présent à la livraison ?',
          answer: 'Si vous n\'êtes pas présent lors de la livraison, notre livreur tentera de vous contacter. Vous pourrez convenir d\'un nouveau rendez-vous ou récupérer votre colis à un point relais. Après 3 tentatives infructueuses, le colis sera retourné et des frais supplémentaires pourront s\'appliquer.'
        }
      ]
    },
    {
      title: 'Retours et Remboursements',
      icon: <Package className="w-5 h-5" />,
      items: [
        {
          question: 'Puis-je retourner un produit ?',
          answer: 'Oui, vous pouvez retourner un produit dans un délai de 7 jours suivant la réception, à condition que le produit soit dans son état d\'origine, non utilisé et dans son emballage d\'origine. Contactez notre service client pour initier le processus de retour.'
        },
        {
          question: 'Dans quels cas puis-je retourner un produit ?',
          answer: 'Vous pouvez retourner un produit s\'il présente un défaut de fabrication, ne correspond pas à la description, ou si vous avez changé d\'avis (dans les 7 jours). Les produits personnalisés ou endommagés par l\'utilisateur ne peuvent pas être retournés.'
        },
        {
          question: 'Qui paie les frais de retour ?',
          answer: 'Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou d\'erreur de notre part. Dans ces cas, YARID prend en charge les frais de retour.'
        },
        {
          question: 'Combien de temps pour obtenir un remboursement ?',
          answer: 'Une fois le produit retourné et vérifié, le remboursement sera effectué dans un délai de 5 à 10 jours ouvrés sur le même moyen de paiement utilisé lors de la commande.'
        },
        {
          question: 'Puis-je échanger un produit ?',
          answer: 'Oui, vous pouvez demander un échange si le produit est disponible en stock. Contactez notre service client avec votre numéro de commande et le produit souhaité. Les frais de livraison de l\'échange seront à votre charge.'
        }
      ]
    },
    {
      title: 'Compte et Sécurité',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          question: 'Comment créer un compte ?',
          answer: 'Cliquez sur "Connexion" dans le menu, puis sur "Créer un compte". Remplissez le formulaire avec vos informations (nom, email, téléphone, mot de passe) et choisissez votre type de compte (client ou vendeur). Vous recevrez un email de confirmation.'
        },
        {
          question: 'J\'ai oublié mon mot de passe, que faire ?',
          answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe. Si vous rencontrez des difficultés, contactez notre service client.'
        },
        {
          question: 'Mes données personnelles sont-elles sécurisées ?',
          answer: 'Oui, nous prenons la sécurité de vos données très au sérieux. Toutes vos informations sont cryptées et stockées de manière sécurisée. Nous ne partageons jamais vos données avec des tiers sans votre consentement. Consultez notre Politique de confidentialité pour plus d\'informations.'
        },
        {
          question: 'Puis-je modifier mes informations personnelles ?',
          answer: 'Oui, vous pouvez modifier vos informations personnelles depuis votre compte. Connectez-vous et accédez aux paramètres de votre profil pour mettre à jour vos informations.'
        }
      ]
    },
    {
      title: 'Vendre sur YARID',
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          question: 'Comment devenir vendeur sur YARID ?',
          answer: 'Pour devenir vendeur, cliquez sur "Devenir vendeur" ou "Créer ma boutique" et remplissez le formulaire d\'inscription. Une fois votre compte approuvé, vous pourrez commencer à ajouter vos produits et à vendre sur la plateforme.'
        },
        {
          question: 'Quels sont les frais pour les vendeurs ?',
          answer: 'L\'inscription est gratuite. YARID prélève une commission de 15% sur chaque vente réalisée. Il n\'y a pas de frais mensuels ou de frais d\'inscription.'
        },
        {
          question: 'Comment ajouter mes produits ?',
          answer: 'Une fois connecté à votre compte vendeur, accédez à votre tableau de bord et cliquez sur "Ajouter un produit". Remplissez les informations du produit (nom, description, prix, photos) et publiez-le. Vos produits seront visibles dans le catalogue après validation.'
        },
        {
          question: 'Comment sont gérés les paiements des ventes ?',
          answer: 'Les paiements des ventes sont versés sur votre compte vendeur dans un délai de 3 à 5 jours ouvrés après la livraison confirmée du produit. Vous pouvez retirer vos fonds via Orange Money, MTN MoMo ou virement bancaire.'
        },
        {
          question: 'Puis-je vendre n\'importe quel type de produit ?',
          answer: 'Non, certains produits sont interdits sur YARID (armes, drogues, produits contrefaits, etc.). Consultez nos conditions d\'utilisation pour la liste complète des produits interdits. Nous nous réservons le droit de retirer tout produit non conforme.'
        }
      ]
    },
    {
      title: 'Autres Questions',
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          question: 'Comment contacter le service client ?',
          answer: 'Vous pouvez contacter notre service client 24/7 via WhatsApp au +237 6XX XXX XXX, par email à contact@yarid.cm, ou utiliser le bouton WhatsApp flottant en bas à droite de chaque page.'
        },
        {
          question: 'YARID propose-t-il une garantie sur les produits ?',
          answer: 'La garantie dépend du vendeur et du type de produit. Certains produits électroniques bénéficient d\'une garantie constructeur. Les détails de garantie sont indiqués sur chaque fiche produit. En cas de problème, contactez notre service client.'
        },
        {
          question: 'Puis-je acheter en gros ?',
          answer: 'Oui, certains vendeurs proposent des prix dégressifs pour les achats en gros. Contactez directement le vendeur via la plateforme ou notre service client pour négocier les conditions d\'achat en gros.'
        },
        {
          question: 'YARID propose-t-il des promotions ?',
          answer: 'Oui, YARID organise régulièrement des promotions et des soldes. Abonnez-vous à notre newsletter et suivez-nous sur les réseaux sociaux pour être informé des meilleures offres.'
        },
        {
          question: 'Comment signaler un problème avec un vendeur ?',
          answer: 'Si vous rencontrez un problème avec un vendeur (produit non conforme, problème de livraison, etc.), contactez immédiatement notre service client avec votre numéro de commande. Nous enquêterons et prendrons les mesures appropriées.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Foire Aux Questions</h1>
            <p className="text-muted-foreground text-lg">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-semibold">{category.title}</h2>
                </div>

                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const itemId = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems.has(itemId);

                    return (
                      <div
                        key={itemIndex}
                        className="border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-semibold text-base pr-4">{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pt-0">
                            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Section Contact */}
          <div className="mt-12 bg-card rounded-2xl p-6 md:p-8 shadow-soft text-center">
            <h2 className="text-2xl font-semibold mb-4">Vous avez d'autres questions ?</h2>
            <p className="text-muted-foreground mb-6">
              Notre équipe est là pour vous aider 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2"
              >
                <a href="https://wa.me/237695250379" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="w-5 h-5" />
                  Contacter le support
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2"
              >
                <a href="mailto:contact@yarid.cm">
                  <HelpCircle className="w-5 h-5" />
                  Envoyer un email
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;

