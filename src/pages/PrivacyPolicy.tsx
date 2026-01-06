import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';

const PrivacyPolicy = () => {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Politique de confidentialité</h1>
          <p className="text-muted-foreground mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                YARID (ci-après "nous", "notre" ou "YARID") s'engage à protéger votre vie privée. Cette politique de confidentialité 
                explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez 
                notre site web et nos services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informations que nous collectons</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2">2.1 Informations que vous nous fournissez</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nom complet</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse de livraison</li>
                    <li>Informations de paiement (traitées de manière sécurisée)</li>
                    <li>Informations de votre compte vendeur (si applicable)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">2.2 Informations collectées automatiquement</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Adresse IP</li>
                    <li>Type de navigateur et système d'exploitation</li>
                    <li>Pages visitées et temps passé sur le site</li>
                    <li>Données de navigation et préférences</li>
                    <li>Cookies et technologies similaires</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Utilisation de vos informations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous utilisons vos informations personnelles pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Traiter et gérer vos commandes</li>
                <li>Faciliter les paiements et les transactions</li>
                <li>Coordonner la livraison de vos produits</li>
                <li>Vous contacter concernant vos commandes et notre service</li>
                <li>Améliorer notre site web et nos services</li>
                <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                <li>Détecter et prévenir la fraude et les activités illégales</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Partage de vos informations</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Nous ne vendons jamais vos informations personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Avec les vendeurs :</strong> Pour permettre la livraison de vos commandes</li>
                  <li><strong>Prestataires de services :</strong> Pour le traitement des paiements, la livraison, et l'hébergement</li>
                  <li><strong>Obligations légales :</strong> Si requis par la loi ou pour protéger nos droits</li>
                  <li><strong>Avec votre consentement :</strong> Dans tout autre cas avec votre autorisation explicite</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Sécurité de vos données</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations 
                personnelles contre l'accès non autorisé, la perte, la destruction ou la modification. Cependant, aucune méthode de 
                transmission sur Internet n'est 100% sécurisée.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vos informations de paiement sont cryptées et traitées par des prestataires de paiement certifiés PCI-DSS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies et technologies similaires</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Nous utilisons des cookies et des technologies similaires pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mémoriser vos préférences et votre panier</li>
                  <li>Améliorer votre expérience de navigation</li>
                  <li>Analyser l'utilisation du site</li>
                  <li>Personnaliser le contenu et les publicités</li>
                </ul>
                <p className="leading-relaxed">
                  Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Vos droits</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément à la loi camerounaise sur la protection des données et au RGPD (si applicable), vous avez le droit de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Accéder à vos informations personnelles</li>
                <li>Corriger vos informations inexactes ou incomplètes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
                <li>Déposer une plainte auprès de l'autorité de contrôle compétente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Conservation des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et respecter 
                nos obligations légales. Les données de commande sont conservées pendant au moins 5 ans conformément aux exigences 
                comptables et fiscales camerounaises.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Transferts internationaux</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont principalement stockées et traitées au Cameroun. Si nous transférons vos données vers d'autres pays, 
                nous nous assurons que des garanties appropriées sont en place pour protéger vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Modifications de cette politique</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement 
                significatif en publiant la nouvelle politique sur cette page et en mettant à jour la date de "dernière mise à jour".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Email : privacy@yarid.cm</li>
                <li>WhatsApp : +237 6XX XXX XXX</li>
                <li>Adresse : [Adresse complète de YARID, Cameroun]</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

