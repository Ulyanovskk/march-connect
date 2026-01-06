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

1. **Description de la marque**
   - Ligne 34 : `"Votre marketplace camerounaise de confiance..."`

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
- `Login.tsx` - Page de connexion
- `Signup.tsx` - Page d'inscription (client et vendeur)
- `VendorDashboard.tsx` - Tableau de bord vendeur
- `VendorInscription.tsx` - Ancienne page d'inscription vendeur (peut être supprimée)
- `NotFound.tsx` - Page 404

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

**`/components/ui/`** - Composants d'interface utilisateur :
- Composants réutilisables (boutons, inputs, cards, etc.)
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
- `supabase/` - Configuration Supabase (base de données)

### `/public/`
Fichiers **statiques publics** accessibles directement :
- `favicon.ico` - Icône du site
- `robots.txt` - Configuration pour les robots de recherche
- `placeholder.svg` - Image placeholder

### `/src/`
**Fichiers racine importants :**
- `App.tsx` - Point d'entrée principal, routes de l'application
- `main.tsx` - Point d'entrée de l'application React
- `index.css` - Styles globaux et thème
- `App.css` - Styles CSS personnalisés

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

## 🔧 FICHIERS DE CONFIGURATION IMPORTANTS

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

## 📱 MODIFIER LES INFORMATIONS DE CONTACT

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

## 🎯 RACCOURCIS RAPIDES

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

---

## ⚠️ CONSEILS IMPORTANTS

1. **Sauvegardez avant de modifier** : Toujours faire une copie de sauvegarde avant de modifier un fichier important

2. **Testez après modification** : Vérifiez que le site fonctionne toujours après vos modifications

3. **Respectez la structure** : Gardez la même structure de dossiers pour que le projet fonctionne correctement

4. **Format des images** : Utilisez des formats optimisés (WebP, JPG, PNG) pour de meilleures performances

5. **Responsive** : Testez sur mobile et desktop après vos modifications

---

## 📞 BESOIN D'AIDE ?

Si vous avez des questions sur la modification d'un élément spécifique, consultez ce guide ou référez-vous aux commentaires dans le code source.

**Bon développement ! 🚀**

