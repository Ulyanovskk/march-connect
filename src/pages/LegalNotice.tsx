import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';

const LegalNotice = () => {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={itemCount} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Mentions légales</h1>
          <p className="text-muted-foreground mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Informations sur l'entreprise</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">Dénomination sociale :</strong> YARID
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Forme juridique :</strong> [À compléter selon la structure légale]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Siège social :</strong> [Adresse complète, Cameroun]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Numéro d'immatriculation :</strong> [Numéro RCCM ou équivalent]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Numéro d'identification fiscale :</strong> [NIF]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Capital social :</strong> [Montant en FCFA]
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Directeur de publication</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">Nom :</strong> [Nom du directeur de publication]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Fonction :</strong> [Fonction]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Contact :</strong> contact@yarid.cm
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Le site YARID est hébergé par :
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Hébergeur :</strong> [Nom de l'hébergeur]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Adresse :</strong> [Adresse de l'hébergeur]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Téléphone :</strong> [Numéro de téléphone]
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Site web :</strong> [URL du site de l'hébergeur]
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  L'ensemble du contenu du site YARID (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive 
                  de YARID ou de ses partenaires et est protégé par les lois camerounaises et internationales relatives à la propriété 
                  intellectuelle.
                </p>
                <p className="leading-relaxed">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
                  quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de YARID.
                </p>
                <p className="leading-relaxed">
                  Toute exploitation non autorisée du site ou de son contenu engage la responsabilité civile et/ou pénale de l'utilisateur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Protection des données personnelles</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à la loi camerounaise sur la protection des données personnelles, YARID s'engage à protéger la confidentialité 
                des informations personnelles collectées sur le site. Pour plus d'informations, consultez notre 
                <a href="/privacy-policy" className="text-primary hover:underline ml-1">Politique de confidentialité</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  YARID s'efforce de fournir des informations aussi précises que possible sur le site. Toutefois, YARID ne pourra être 
                  tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait 
                  ou du fait des tiers partenaires qui lui fournissent ces informations.
                </p>
                <p className="leading-relaxed">
                  YARID ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors 
                  de l'accès au site YARID, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit 
                  de l'apparition d'un bug ou d'une incompatibilité.
                </p>
                <p className="leading-relaxed">
                  YARID ne pourra également être tenue responsable des dommages indirects consécutifs à l'utilisation du site.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Liens hypertextes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site YARID peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers 
                ces autres ressources vous font quitter le site YARID. Il est possible de créer un lien vers la page de présentation 
                de ce site sans autorisation expresse de YARID. Aucune autorisation ni demande d'information préalable ne peut être 
                exigée par YARID à l'égard d'un site qui souhaite établir un lien vers le site de YARID.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Droit applicable</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes mentions légales sont régies par les lois de la République du Cameroun. En cas de litige et à défaut 
                d'accord amiable, le litige sera porté devant les tribunaux compétents conformément à la législation camerounaise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Médiation</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à la législation camerounaise, YARID s'engage à rechercher une solution amiable en cas de litige avec 
                un utilisateur. En cas d'échec de la médiation, le litige sera soumis aux tribunaux compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Email : legal@yarid.cm</li>
                <li>WhatsApp : +237 6XX XXX XXX</li>
                <li>Adresse postale : [Adresse complète de YARID, Cameroun]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                YARID se réserve le droit de modifier les présentes mentions légales à tout moment. L'utilisateur s'engage donc à 
                les consulter de manière régulière.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNotice;

