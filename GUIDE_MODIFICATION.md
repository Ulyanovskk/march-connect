#  Guide de Modification du Site YARID

Ce guide vous explique où modifier les différents éléments de votre site web pour que vous puissiez le personnaliser facilement.

---

##  MODIFIER LES TEXTES DES PAGES

###  Page d'Accueil (Homepage)

**Fichier :** `src/pages/Index.tsx`
- Cette page assemble les différentes sections de la page d'accueil

**Sections individuelles :**

1. **Hero Banner (Bannière principale avec titre)**
   - **Fichier :** `src/components/home/HeroBanner.tsx`
   - **Textes à modifier :**
     - Titre principal : ligne 29 - `"Le Marché Sans Frontières"`
     - Sous-titre : ligne 32 - `"Achetez et vendez vos équipements électroniques..."`
     - Badge : ligne 24 - `"Plus de 500 produits disponibles"`
     - Bouton "Explorer le catalogue" : ligne 43
     - Bouton "Devenir vendeur" : ligne 54
     - Barre supérieure : ligne 23 - `"Livraison dans tout le Cameroun 🇨🇲"`

2. **Section Catégories**
   - **Fichier :** `src/components/home/CategoriesSection.tsx`
   - Modifier les catégories et leurs descriptions ici

3. **Produits Populaires**
   - **Fichier :** `src/components/home/PopularProducts.tsx`
   - Titre et description de la section des produits populaires

4. **Section "Devenir Vendeur" (CTA Vendeur)**
   - **Fichier :** `src/components/home/VendorCTA.tsx`
   - **Textes à modifier :**
     - Titre : ligne 18 - `"Vendez sur YARID 🚀"`
     - Description : ligne 21 - `"Rejoignez des centaines de vendeurs..."`
     - Avantages (lignes 31, 40, 49) : texte de chaque avantage
     - Bouton : ligne 61 - `"Créer ma boutique"`

###  Page Catalogue

**Fichier :** `src/pages/Catalogue.tsx`
- Titre de la page
- Texte de filtres
- Messages de recherche
- Textes des produits

###  Page Détail Produit

**Fichier :** `src/pages/ProductDetail.tsx`
- Textes de description
- Labels de boutons
- Messages d'information

###  Page Panier

**Fichier :** `src/pages/Cart.tsx`
- Titre de la page
- Messages du panier vide
- Textes des boutons

###  Page Connexion (Login)

**Fichier :** `src/pages/Login.tsx`
- **Textes à modifier :**
  - Titre : ligne 78 - `"Connexion"`
  - Sous-titre : ligne 80
  - Titre du panneau gauche : ligne 46 - `"Bienvenue sur la marketplace N°1 du Cameroun"`
  - Description : ligne 49
  - Footer : ligne 59 - `"© 2026 YARID. Tous droits réservés."`
  - Messages de badges (lignes 52-54)

###  Page Inscription (Signup)

**Fichier :** `src/pages/Signup.tsx`
- **Textes à modifier :**
  - Titre : ligne 164 - `"Créer un compte"` ou `"Créer ma boutique"` (si vendeur)
  - Sous-titre : ligne 168
  - Titre du panneau gauche : ligne 79 - `"Rejoignez la communauté YARID"` ou `"Ouvrez votre boutique sur YARID"`
  - Description : lignes 82-86
  - Avantages (lignes 89-102)
  - Labels des champs de formulaire
  - Footer : ligne 144 - `"© 2026 YARID. Tous droits réservés."`

###  Page Inscription Vendeur (Ancienne)

**Fichier :** `src/pages/VendorInscription.tsx`
- Même structure que Signup mais spécifique aux vendeurs
- Footer : ligne 121 - `"© 2026 YARID. Tous droits réservés."`

###  Dashboard Vendeur

**Fichier :** `src/pages/VendorDashboard.tsx`
- Tous les textes du tableau de bord vendeur

###  Page 404 (Page Non Trouvée)

**Fichier :** `src/pages/NotFound.tsx`
- Message d'erreur 404
- Texte du bouton retour

###  Page Checkout (Finalisation de commande)

**Fichier :** `src/pages/Checkout.tsx`
- **Textes à modifier :**
  - Titre : ligne 49 - `"Finaliser ma commande"`
  - Sous-titre : ligne 51
  - Titre section articles : ligne 66 - `"Articles dans votre commande"`
  - Titre section informations : ligne 99 - `"Informations de contact & livraison"`
  - Textes des boutons (lignes 171-190)
  - Messages d'information sur la livraison

###  Page Payment (Paiement)

**Fichier :** `src/pages/Payment.tsx`
- **Textes à modifier :**
  - Titre : ligne 118 - `"Paiement sécurisé"`
  - Sous-titre : ligne 120
  - Titre section méthode : ligne 137 - `"Méthode de paiement"`
  - Labels des méthodes de paiement (carte, PayPal, Orange Money, MTN MoMo, Binance)
  - Placeholders des champs de formulaire selon la méthode choisie
  - Textes des boutons de paiement

###  Page Order Confirmation (Confirmation de commande)

**Fichier :** `src/pages/OrderConfirmation.tsx`
- **Textes à modifier :**
  - Titre : ligne 20 - `"Commande confirmée !"`
  - Message de confirmation
  - Numéro de commande (format : YAR-2026-001234)
  - Textes des boutons de navigation

###  Page Terms of Service (Conditions d'utilisation)

**Fichier :** `src/pages/TermsOfService.tsx`
- **Textes à modifier :**
  - Tous les textes des sections (11 sections)
  - Informations de contact (ligne 150+)
  - Coordonnées et détails légaux

###  Page Privacy Policy (Politique de confidentialité)

**Fichier :** `src/pages/PrivacyPolicy.tsx`
- **Textes à modifier :**
  - Tous les textes des sections (11 sections)
  - Informations sur la collecte et l'utilisation des données
  - Coordonnées pour les questions de confidentialité (ligne 160+)

###  Page Legal Notice (Mentions légales)

**Fichier :** `src/pages/LegalNotice.tsx`
- **Textes à modifier :**
  - Informations sur l'entreprise (section 1)
  - Directeur de publication (section 2)
  - Informations d'hébergement (section 3)
  - Coordonnées légales (section 10)

###  Page FAQ (Foire Aux Questions)

**Fichier :** `src/pages/FAQ.tsx`
- **Textes à modifier :**
  - Titre principal : ligne 20 - `"Foire Aux Questions"`
  - Toutes les questions et réponses dans les 6 catégories :
    - Commandes et Paiement
    - Livraison
    - Retours et Remboursements
    - Compte et Sécurité
    - Vendre sur YARID
    - Autres Questions
  - Section contact en bas de page

---

##  MODIFIER LES IMAGES ET LOGOS

### Logo Principal

**Fichier image :** `src/assets/yarid-logo.jpg`
- Remplacez ce fichier par votre nouveau logo
- **Format recommandé :** JPG, PNG ou SVG
- **Aspect ratio :** Conserver les proportions pour éviter la déformation

**Où il est utilisé :**
- Header : `src/components/layout/Header.tsx` (ligne 32)
- Footer : `src/components/layout/Footer.tsx` (ligne 27)
- Pages Login/Signup : `src/pages/Login.tsx` et `src/pages/Signup.tsx`

### Images des Produits

**Fichier de données :** `src/lib/demo-data.ts`
- Les URLs des images de produits sont dans le tableau `demoProducts`
- Ligne 23 et suivantes : modifier les URLs dans `images: [...]`

### Images de Placeholder

**Fichier :** `public/placeholder.svg`
- Image par défaut utilisée quand une image de produit est manquante

### Favicon

**Fichier :** `public/favicon.ico`
- Remplacez par votre icône de site (icône dans l'onglet du navigateur)

---

##  MODIFIER LE HEADER (En-tête)

**Fichier :** `src/components/layout/Header.tsx`

**Éléments à modifier :**

1. **Barre supérieure (Livraison)**
   - Ligne 23 : `"Livraison dans tout le Cameroun 🇨🇲"`

2. **Barre de recherche**
   - Ligne 45 : Placeholder `"Rechercher un produit..."`

3. **Menu de navigation**
   - Liens dans le menu (lignes 52-65)
   - Texte du bouton compte

4. **Logo**
   - Voir section "Modifier les Images"

---

##  MODIFIER LE FOOTER (Pied de page)

**Fichier :** `src/components/layout/Footer.tsx`

**Éléments à modifier :**

1. **Description de la marque (Slogan)**
   - Ligne 34 : `"Le e-commerce pour vous et par vous"`

2. **Liens de navigation**
   - Lignes 42-45 : Liens du menu footer

3. **Liens légaux**
   - Lignes 52-55 : Conditions d'utilisation, politique de confidentialité

4. **Coordonnées de contact**
   - **Téléphone :** Ligne 62 - Actuellement `"+237 695 250 379"`
   - **Email :** Ligne 67 - Actuellement `"contact@yarid.cm"`
   - **Adresse :** Ligne 72 - Adresse physique
   - **WhatsApp :** Ligne 13 - URL WhatsApp `"https://wa.me/237 695 250 379"`

5. **Réseaux sociaux**
   - Lignes 79-93 : URLs des réseaux sociaux (Facebook, Instagram, Twitter)

6. **Copyright**
   - Ligne 99 : `"© ${currentYear} YARID. Tous droits réservés."`
   - L'année est automatique (utilise `currentYear`)

7. **Logo**
   - Voir section "Modifier les Images"

---

##  RÔLE DE CHAQUE DOSSIER

### `/src/pages/`
Contient toutes les **pages principales** du site :
- `Index.tsx` - Page d'accueil
- `Catalogue.tsx` - Page de catalogue de produits
- `ProductDetail.tsx` - Page de détail d'un produit
- `Cart.tsx` - Page du panier
- `Checkout.tsx` - Page de finalisation de commande
- `Payment.tsx` - Page de paiement
- `OrderConfirmation.tsx` - Page de confirmation de commande
- `Login.tsx` - Page de connexion
- `Signup.tsx` - Page d'inscription (client et vendeur)
- `VendorDashboard.tsx` - Tableau de bord vendeur
- `VendorInscription.tsx` - Ancienne page d'inscription vendeur (peut être supprimée)
- `TermsOfService.tsx` - Conditions d'utilisation
- `PrivacyPolicy.tsx` - Politique de confidentialité
- `LegalNotice.tsx` - Mentions légales
- `FAQ.tsx` - Foire Aux Questions
- `NotFound.tsx` - Page 404

### `/src/pages/admin/`
Contient les **pages d'administration** :
- `Payments.tsx` - Dashboard de suivi des paiements


### `/src/components/`
Contient tous les **composants réutilisables** :

**`/components/home/`** - Composants de la page d'accueil :
- `HeroBanner.tsx` - Bannière hero
- `CategoriesSection.tsx` - Section des catégories
- `PopularProducts.tsx` - Section produits populaires
- `VendorCTA.tsx` - Section "Devenir vendeur"

**`/components/layout/`** - Composants de mise en page :
- `Header.tsx` - En-tête du site
- `Footer.tsx` - Pied de page

**`/components/`** - Autres composants :
- `NavLink.tsx` - Composant de lien de navigation

**`/components/ui/`** - Composants d'interface utilisateur :
- Composants réutilisables (boutons, inputs, cards, etc.)
- `CategoryCard.tsx` - Carte de catégorie réutilisable
- `ProductCard.tsx` - Carte de produit réutilisable
- **Ne modifiez généralement pas ces fichiers** sauf si vous voulez changer le style global

### `/src/assets/`
Contient les **ressources statiques** :
- Images
- Logos
- Fichiers multimédias

### `/src/lib/`
Contient les **utilitaires et données** :
- `demo-data.ts` - Données de démonstration (catégories, produits)
- `utils.ts` - Fonctions utilitaires

### `/src/contexts/`
Contient les **contextes React** (gestion d'état global) :
- `CartContext.tsx` - Gestion du panier

### `/src/types/`
Contient les **définitions de types TypeScript** :
- `index.ts` - Types utilisés dans l'application

### `/src/integrations/`
Contient les **intégrations externes** :
- `supabase/client.ts` - Client Supabase pour la connexion à la base de données
- `supabase/types.ts` - Types TypeScript générés pour Supabase

### `/supabase/functions/`
Contient les **Edge Functions (Backend)** :
- `stripe-webhook/index.ts` - Webhook Stripe pour gérer les mises à jour de paiement

### `/public/`
Fichiers **statiques publics** accessibles directement :
- `favicon.ico` - Icône du site
- `robots.txt` - Configuration pour les robots de recherche
- `placeholder.svg` - Image placeholder

### `/` (Racine du projet)
**Fichiers de configuration racine :**
- `index.html` - Fichier HTML principal, contient les meta tags et le titre du site
  - **À modifier :** Titre de la page, meta description, Open Graph tags
- `package.json` - Configuration npm, dépendances et scripts
- `tailwind.config.ts` - Configuration Tailwind CSS
- `vite.config.ts` - Configuration Vite (si présent)

### `/src/hooks/`
Contient les **hooks React personnalisés** :
- `use-mobile.tsx` - Hook pour détecter si l'appareil est mobile
- `use-toast.ts` - Hook pour gérer les notifications toast

### `/src/`
**Fichiers racine importants :**
- `App.tsx` - Point d'entrée principal, routes de l'application
- `main.tsx` - Point d'entrée de l'application React
- `index.css` - Styles globaux et thème
- `App.css` - Styles CSS personnalisés
- `vite-env.d.ts` - Définitions de types pour Vite (généré automatiquement)

---

##  MODIFIER LES ROUTES (URLs)

**Fichier :** `src/App.tsx`

**Exemple de route :**
```tsx
<Route path="/catalogue" element={<Catalogue />} />
```

Pour ajouter une nouvelle page :
1. Créez le fichier dans `/src/pages/`
2. Importez-le dans `App.tsx`
3. Ajoutez une route dans la section `<Routes>`

---

##  MODIFIER LES COULEURS ET STYLES

### Couleurs principales

**Fichier :** `src/index.css`

**Lignes 13-73 :** Définition des couleurs du thème
- `--primary` - Couleur primaire (bleu foncé YARID)
- `--secondary` - Couleur secondaire (bleu cyan)
- `--accent` - Couleur d'accentuation (teal)

**Gradients :**
- Lignes 66-68 : Définition des gradients
  - `--gradient-primary` - Gradient principal
  - `--gradient-secondary` - Gradient secondaire
  - `--gradient-accent` - Gradient accent

### Styles globaux

**Fichier :** `src/index.css`
- Modifications globales du style

**Fichier :** `src/App.css`
- Styles CSS personnalisés supplémentaires

### Police de caractères

**Fichier :** `src/index.css` ligne 121
- Police actuelle : `'Montserrat'`
- Pour changer, modifiez cette ligne et assurez-vous d'importer la nouvelle police

---

##  MODIFIER LES DONNÉES DE DÉMONSTRATION

**Fichier :** `src/lib/demo-data.ts`

**Catégories :**
- Modifier le tableau `demoCategories` (lignes 4-14)
- Changer les noms, descriptions, icônes

**Produits :**
- Modifier le tableau `demoProducts` (lignes 16+)
- Ajouter/modifier les produits, prix, images, descriptions

---

##  MODIFIER LES META TAGS ET SEO

**Fichier :** `index.html`

**Éléments à modifier :**

1. **Titre de la page**
   - Ligne 6 : `<title>YARID - Le Marché Sans Frontières | E-commerce Cameroun</title>`

2. **Meta description**
   - Ligne 7 : `content="YARID - Le e-commerce pour vous et par vous..."`
   - Description affichée dans les résultats de recherche

3. **Meta keywords**
   - Ligne 9 : Mots-clés pour le référencement

4. **Open Graph (Réseaux sociaux)**
   - Lignes 16-19 : Titre, description et image pour le partage sur les réseaux sociaux
   - `og:title`, `og:description`, `og:image`

5. **Twitter Card**
   - Lignes 21-23 : Configuration pour le partage sur Twitter

---

##  FICHIERS DE CONFIGURATION IMPORTANTS

### Configuration Tailwind CSS
**Fichier :** `tailwind.config.ts`
- Configuration du framework CSS Tailwind
- Modification des couleurs, polices, breakpoints

### Configuration Vite
**Fichier :** `vite.config.ts` (si présent)
- Configuration du build et du serveur de développement

### Package.json
**Fichier :** `package.json`
- Liste des dépendances du projet
- Scripts npm

---

##  MODIFIER LES INFORMATIONS DE CONTACT

### Dans le Footer
**Fichier :** `src/components/layout/Footer.tsx`
- **Téléphone :** Ligne 62
- **Email :** Ligne 67
- **Adresse :** Ligne 72
- **WhatsApp :** Ligne 13 (modifier le numéro dans l'URL)

### Dans le Header
**Fichier :** `src/components/layout/Header.tsx`
- Barre d'information supérieure (ligne 23)

---

##  RACCOURCIS RAPIDES

| Élément à modifier | Fichier |
|-------------------|---------|
| **Titre page d'accueil** | `src/components/home/HeroBanner.tsx` |
| **Logo du site** | `src/assets/yarid-logo.jpg` |
| **Menu navigation** | `src/components/layout/Header.tsx` |
| **Pied de page** | `src/components/layout/Footer.tsx` |
| **Contact (email, tel)** | `src/components/layout/Footer.tsx` |
| **Produits de démonstration** | `src/lib/demo-data.ts` |
| **Couleurs du site** | `src/index.css` |
| **Routes/URLs** | `src/App.tsx` |
| **Page 404** | `src/pages/NotFound.tsx` |
| **Page Checkout** | `src/pages/Checkout.tsx` |
| **Page Paiement** | `src/pages/Payment.tsx` |
| **Page FAQ** | `src/pages/FAQ.tsx` |
| **Conditions d'utilisation** | `src/pages/TermsOfService.tsx` |
| **Politique de confidentialité** | `src/pages/PrivacyPolicy.tsx` |
| **Mentions légales** | `src/pages/LegalNotice.tsx` |
| **Admin Paiements** | `src/pages/admin/Payments.tsx` |
| **Meta tags / SEO** | `index.html` |

---

##  CONSEILS IMPORTANTS

1. **Sauvegardez avant de modifier** : Toujours faire une copie de sauvegarde avant de modifier un fichier important

2. **Testez après modification** : Vérifiez que le site fonctionne toujours après vos modifications

3. **Respectez la structure** : Gardez la même structure de dossiers pour que le projet fonctionne correctement

4. **Format des images** : Utilisez des formats optimisés (WebP, JPG, PNG) pour de meilleures performances

5. **Responsive** : Testez sur mobile et desktop après vos modifications

---

##  BESOIN D'AIDE ?

Si vous avez des questions sur la modification d'un élément spécifique, consultez ce guide ou référez-vous aux commentaires dans le code source.

**Bon développement ! **

