import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';

const TermsOfService = () => {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Conditions d'utilisation</h1>
          <p className="text-muted-foreground mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En accédant et en utilisant le site YARID (ci-après "le Site"), vous acceptez d'être lié par les présentes conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                YARID est une plateforme de marketplace en ligne qui permet aux vendeurs de proposer leurs produits et aux acheteurs 
                d'acheter ces produits au Cameroun. YARID agit en tant qu'intermédiaire entre les vendeurs et les acheteurs.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Mise en relation entre vendeurs et acheteurs</li>
                <li>Gestion des commandes et des paiements</li>
                <li>Coordination de la livraison</li>
                <li>Support client</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Compte utilisateur</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Pour utiliser certains services du Site, vous devez créer un compte. Vous êtes responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                  <li>Toutes les activités qui se produisent sous votre compte</li>
                  <li>Fournir des informations exactes, complètes et à jour</li>
                  <li>Notifier immédiatement YARID de toute utilisation non autorisée de votre compte</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Commandes et paiements</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Les commandes passées sur YARID sont soumises aux conditions suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tous les prix sont indiqués en FCFA (Franc CFA)</li>
                  <li>Les prix peuvent être modifiés à tout moment sans préavis</li>
                  <li>Les paiements peuvent être effectués via Orange Money, MTN Mobile Money, carte bancaire, PayPal ou Binance Pay</li>
                  <li>YARID se réserve le droit d'annuler toute commande en cas d'erreur de prix ou de disponibilité</li>
                  <li>Les frais de livraison sont calculés séparément et communiqués avant la finalisation de la commande</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Livraison</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  YARID coordonne la livraison des produits dans les grandes villes du Cameroun. Les délais de livraison sont indicatifs 
                  et peuvent varier selon la disponibilité des produits et la localisation.
                </p>
                <p className="leading-relaxed">
                  Le client est responsable de vérifier les informations de livraison avant la confirmation de la commande. 
                  En cas d'adresse incorrecte, des frais supplémentaires peuvent s'appliquer.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Retours et remboursements</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Les retours sont acceptés dans un délai de 7 jours suivant la réception du produit, sous réserve que :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Le produit soit dans son état d'origine, non utilisé et dans son emballage d'origine</li>
                  <li>Le produit présente un défaut de fabrication ou ne correspond pas à la description</li>
                  <li>La demande de retour soit effectuée via le support client YARID</li>
                </ul>
                <p className="leading-relaxed">
                  Les frais de retour sont à la charge du client sauf en cas de produit défectueux ou d'erreur de notre part.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Propriété intellectuelle</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tous les contenus du Site, y compris mais sans s'y limiter, les textes, graphiques, logos, icônes, images, 
                clips audio et vidéo, sont la propriété de YARID ou de ses fournisseurs de contenu et sont protégés par les lois 
                camerounaises et internationales sur la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation de responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                YARID agit en tant qu'intermédiaire et ne peut être tenu responsable :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>De la qualité, de la sécurité ou de la légalité des produits vendus par les vendeurs</li>
                <li>De la véracité des descriptions de produits fournies par les vendeurs</li>
                <li>Des retards de livraison dus à des circonstances indépendantes de notre volonté</li>
                <li>Des dommages indirects résultant de l'utilisation du Site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modification des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                YARID se réserve le droit de modifier ces conditions d'utilisation à tout moment. Les modifications entrent en vigueur 
                dès leur publication sur le Site. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Droit applicable et juridiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes conditions d'utilisation sont régies par les lois de la République du Cameroun. 
                Tout litige relatif à ces conditions sera soumis à la juridiction exclusive des tribunaux compétents du Cameroun.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li>Email : contact@yarid.cm</li>
                <li>WhatsApp : +237 6XX XXX XXX</li>
                <li>Support client disponible 24/7</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

