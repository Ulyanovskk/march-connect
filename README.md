#DEPLOIEMENT



#  Guide de Déploiement Complet - YARID Marketplace

Ce guide vous accompagne étape par étape pour déployer votre marketplace YARID en ligne de manière professionnelle.

---

##  PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :

-  Un compte **GitHub** (gratuit)
-  Un compte **Supabase** (gratuit jusqu'à 500 Mo)
-  Un compte **Vercel** ou **Netlify** (gratuit)
-  Un domaine personnalisé (optionnel, mais recommandé)
-  Git installé sur votre ordinateur

---

##  ÉTAPE 1 : PRÉPARATION DU PROJET

### 1.1. Vérifier que tout fonctionne localement

```bash
# Installer les dépendances si ce n'est pas déjà fait
npm install

# Tester en développement
npm run dev
```

 Vérifiez que le site s'ouvre sur `http://localhost:8080` sans erreurs

### 1.2. Vérifier les fichiers de configuration

Vérifiez que ces fichiers existent :
-  `vercel.json` - Configuration pour Vercel (redirections SPA, headers de sécurité)
-  `public/_redirects` - Configuration pour Netlify (si vous utilisez Netlify)

 **Important :** Ne commitez JAMAIS le fichier `.env.local` réel dans Git !

### 1.3. Créer un fichier `.gitignore`

Assurez-vous que votre `.gitignore` contient :

```
# Variables d'environnement
.env
.env.local
.env.production
.env.*.local

# Build
dist/
build/

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*
```

### 1.4. Commiter le code sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Projet YARID prêt pour déploiement"

# Créer un repository sur GitHub (via le site web)
# Puis connecter votre projet local
git remote add origin https://github.com/VOTRE_USERNAME/march-connect.git
git branch -M main
git push -u origin main
```

 Votre code est maintenant sur GitHub

---

##  ÉTAPE 2 : DÉPLOIEMENT DE LA BASE DE DONNÉES (SUPABASE)

### 2.1. Créer un compte Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"** ou **"Sign up"**
3. Connectez-vous avec GitHub (plus simple)
4. Cliquez sur **"New Project"**

### 2.2. Créer un nouveau projet

Remplissez le formulaire :
- **Organization** : Choisissez ou créez une organisation
- **Name** : `yarid-marketplace` (ou le nom de votre choix)
- **Database Password** : Créez un mot de passe fort (⚠️ Notez-le quelque part !)
- **Region** : Choisissez la région la plus proche (ex: `West EU (Paris)` pour l'Europe)
- **Pricing Plan** : Free (gratuit pour commencer)

Cliquez sur **"Create new project"** ⏳ (Cela prend 2-3 minutes)

### 2.3. Récupérer les clés d'API

Une fois le projet créé :

1. Allez dans **Settings** (⚙️) → **API**
2. Vous verrez :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key : Une longue clé qui commence par `eyJ...`

 **Copiez ces deux valeurs** - vous en aurez besoin plus tard !

### 2.4. Appliquer les migrations de base de données

**Option A : Via la CLI Supabase (Recommandé)**

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login

# Lier votre projet local au projet Supabase en ligne
supabase link --project-ref VOTRE_PROJECT_REF
# (Le project-ref se trouve dans l'URL de votre projet Supabase)

# Appliquer les migrations
supabase db push
```

**Option B : Via le Dashboard Supabase**

1. Allez dans **SQL Editor** dans le menu gauche
2. Ouvrez votre fichier de migration : `supabase/migrations/20260106110229_702b9a69-729e-408d-a14f-9280be02ff16.sql`
3. Copiez tout le contenu SQL
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **"Run"** 

 Votre base de données est maintenant configurée !

### 2.5. Configurer les politiques de sécurité (RLS)

1. Allez dans **Authentication** → **Policies**
2. Pour chaque table (`profiles`, `products`, `orders`, etc.) :
   - Activez **Row Level Security (RLS)**
   - Créez des politiques permettant :
     - Lecture publique pour les produits
     - Écriture uniquement pour les propriétaires/vendeurs

**Politiques de base recommandées :**

```sql
-- Permettre la lecture publique des produits
CREATE POLICY "Produits lisibles par tous"
ON public.products FOR SELECT
USING (true);

-- Permettre l'insertion uniquement aux vendeurs authentifiés
CREATE POLICY "Vendeurs peuvent créer des produits"
ON public.products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'vendor'
  )
);
```

 Votre base de données est sécurisée !

---

##  ÉTAPE 3 : CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### 3.1. Créer un fichier `.env.local` (pour développement)

À la racine de votre projet, créez `.env.local` :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

 **Important :** Ce fichier ne doit JAMAIS être commité dans Git !

### 3.2. Tester avec les nouvelles variables

```bash
# Redémarrer le serveur de développement
npm run dev
```

 Vérifiez que la connexion à Supabase fonctionne (pas d'erreurs dans la console)

---

##  ÉTAPE 4 : DÉPLOIEMENT DU FRONTEND (VERCEL)

### 4.1. Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign up"**
3. Choisissez **"Continue with GitHub"** (plus simple)
4. Autorisez Vercel à accéder à vos repositories

### 4.2. Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repository `march-connect`
3. Cliquez sur **"Import"**

### 4.3. Configurer le projet

Dans la page de configuration :

**Framework Preset :**
- Vercel détecte automatiquement **Vite**

**Root Directory :**
- Laissez vide (ou `./` si nécessaire)

**Build Command :**
- Laissez par défaut : `npm run build`

**Output Directory :**
- Par défaut : `dist`

**Install Command :**
- Laissez par défaut : `npm install`

### 4.4. Ajouter les variables d'environnement

Dans la section **"Environment Variables"** :

1. Cliquez sur **"Add Variable"**
2. Ajoutez :
   - **Name :** `VITE_SUPABASE_URL`
   - **Value :** `https://xxxxxxxxxxxxx.supabase.co` (votre URL Supabase)
   -  Cochez **Production**, **Preview**, et **Development**
3. Cliquez sur **"Add"**

4. Répétez pour la deuxième variable :
   - **Name :** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (votre clé publique)
   -  Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **"Add"**

### 4.5. Déployer !

1. Cliquez sur **"Deploy"** 🚀
2. Attendez 2-3 minutes que le build se termine
3. Une fois terminé, vous verrez : **"Congratulations! Your project has been deployed."**

 Vous obtenez une URL comme : `https://march-connect.vercel.app`

### 4.6. Tester le déploiement

1. Cliquez sur l'URL de votre site
2. Vérifiez que :
   -  Le site se charge
   -  Pas d'erreurs dans la console (F12)
   -  Les images se chargent
   -  Les liens fonctionnent

---

##  ÉTAPE 5 : CONFIGURATION DES DÉPLOIEMENTS AUTOMATIQUES

### 5.1. Vercel déploie automatiquement

Chaque fois que vous poussez du code sur GitHub :

```bash
git add .
git commit -m "Mise à jour du site"
git push origin main
```

Vercel détectera automatiquement le changement et redéploiera votre site ! 🎉

### 5.2. Voir les déploiements

Dans le dashboard Vercel :
- **Deployments** : Voir tous vos déploiements
- **Logs** : Voir les logs de build en cas d'erreur
- **Analytics** : Statistiques de visite (sur le plan payant)

---

##  ÉTAPE 6 : DOMAINE PERSONNALISÉ (OPTIONNEL MAIS RECOMMANDÉ)

### 6.1. Acheter un domaine

1. Allez sur un registraire de domaine (ex: [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), ou [OVH](https://ovh.com) pour le Cameroun)
2. Recherchez votre domaine (ex: `yarid.cm` ou `yarid-marketplace.com`)
3. Achetez le domaine

### 6.2. Configurer le domaine dans Vercel

1. Dans Vercel, allez dans votre projet → **Settings** → **Domains**
2. Entrez votre domaine (ex: `yarid.cm`)
3. Cliquez sur **"Add"**
4. Vercel vous donnera des instructions de configuration DNS

### 6.3. Configurer les DNS

Dans votre registraire de domaine, ajoutez ces enregistrements DNS :

**Pour un domaine principal (yarid.cm) :**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Pour un sous-domaine (www.yarid.cm) :**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

⏳ **Attendez 24-48h** pour que les DNS se propagent.

### 6.4. Activer HTTPS automatique

Vercel configure automatiquement un certificat SSL gratuit ! 🎉
Votre site sera accessible en `https://yarid.cm` (sécurisé)

---

##  ÉTAPE 7 : VÉRIFICATIONS POST-DÉPLOIEMENT

### 7.1. Checklist de vérification

- [ ] Le site se charge correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Les images se chargent
- [ ] La connexion à Supabase fonctionne (testez l'inscription/connexion)
- [ ] Les pages principales fonctionnent (accueil, catalogue, panier)
- [ ] Le site est responsive (mobile et desktop)
- [ ] HTTPS est activé (cadenas vert dans la barre d'adresse)
- [ ] Le domaine personnalisé fonctionne (si configuré)

### 7.2. Tester les fonctionnalités principales

1. **Inscription** :
   - Créez un compte test
   - Vérifiez qu'il apparaît dans Supabase (Authentication → Users)

2. **Connexion** :
   - Déconnectez-vous
   - Reconnectez-vous avec votre compte test

3. **Navigation** :
   - Parcourez toutes les pages
   - Testez les liens du menu
   - Testez la recherche (si implémentée)

---

##  ÉTAPE 8 : OPTIMISATIONS ET MAINTENANCE

### 8.1. Activer la compression

Vercel active automatiquement la compression Gzip/Brotli. Pas besoin de configuration !

### 8.2. Configuration déjà en place

 Le fichier `vercel.json` est déjà configuré avec :
- **Redirections SPA** : Toutes les routes pointent vers `index.html` (nécessaire pour React Router)
- **Headers de sécurité** : Protection contre le clickjacking, XSS, etc.

Vous pouvez modifier `vercel.json` si vous voulez ajouter des redirections personnalisées :

```json
{
  "rewrites": [...],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "headers": [...]
}
```

### 8.4. Monitoring et Analytics

**Vercel Analytics** (sur le plan payant) :
- Statistiques de visite
- Performance
- Web Vitals

**Alternatives gratuites** :
- Google Analytics
- Plausible Analytics
- Umami

---

##  GESTION DES ERREURS COURANTES

### Erreur : "Failed to fetch" dans la console

**Cause :** Variables d'environnement non configurées

**Solution :**
1. Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont bien dans Vercel
2. Redéployez après avoir ajouté les variables

### Erreur : "Build failed"

**Cause :** Erreur de compilation TypeScript ou dépendance manquante

**Solution :**
1. Testez localement avec `npm run build`
2. Corrigez les erreurs
3. Commitez et poussez : Vercel redéploiera automatiquement

### Erreur : "Database connection failed"

**Cause :** Mauvaise URL ou clé Supabase

**Solution :**
1. Vérifiez vos variables d'environnement dans Vercel
2. Vérifiez que votre projet Supabase est actif
3. Vérifiez les politiques RLS (Row Level Security)

### Erreur : "404 Not Found" sur certaines routes

**Cause :** Vite nécessite une configuration spéciale pour le routing

**Solution :** Le fichier `vercel.json` devrait déjà exister avec cette configuration. Si ce n'est pas le cas, créez-le à la racine du projet avec le contenu des redirections SPA (voir section 8.2).

---

##  ALTERNATIVE : DÉPLOIEMENT SUR NETLIFY

Si vous préférez Netlify à Vercel :

### 4.1. Créer un compte Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez sur **"Sign up"**
3. Connectez-vous avec GitHub

### 4.2. Déployer

1. **Add new site** → **Import an existing project**
2. Sélectionnez votre repository GitHub
3. Configuration :
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
4. **Advanced build settings** → **New variable** :
   - `VITE_SUPABASE_URL` = votre URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = votre clé
5. Cliquez sur **"Deploy site"**

### 4.3. Configurer les redirections

Créez `public/_redirects` :

```
/*    /index.html   200
```

 Netlify fonctionne très bien aussi pour les projets Vite/React !

---

##  RÉCAPITULATIF DES ÉTAPES

1.  **Préparation** : Code sur GitHub
2.  **Base de données** : Projet Supabase créé et migrations appliquées
3.  **Variables** : Configurées localement et sur Vercel
4.  **Déploiement** : Site en ligne sur Vercel
5.  **Domaine** : Configuré (optionnel)
6.  **Vérification** : Tout fonctionne
7.  **Optimisation** : Headers, redirections configurées

---

##  CHECKLIST FINALE

- [ ] Code sur GitHub
- [ ] Projet Supabase créé
- [ ] Migrations appliquées
- [ ] Variables d'environnement configurées (local et Vercel)
- [ ] Site déployé sur Vercel
- [ ] Site accessible et fonctionnel
- [ ] Domaine personnalisé configuré (si souhaité)
- [ ] HTTPS activé
- [ ] Tests fonctionnels réussis
- [ ] Documentation à jour

---

##  LIENS UTILES

- **Supabase Dashboard :** [supabase.com/dashboard](https://supabase.com/dashboard)
- **Vercel Dashboard :** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentation Vite :** [vitejs.dev](https://vitejs.dev)
- **Documentation Supabase :** [supabase.com/docs](https://supabase.com/docs)

---

##  CONSEILS FINAUX

1. **Sauvegardez régulièrement** : Faites des commits fréquents sur GitHub
2. **Testez avant de déployer** : Utilisez `npm run build` localement
3. **Surveillez les logs** : Vérifiez les logs Vercel en cas de problème
4. **Sécurité** : Ne commitez JAMAIS vos clés API dans Git
5. **Performance** : Optimisez les images avant de les uploader
6. **SEO** : Ajoutez des métadonnées dans `index.html`

---

**Félicitations !  Votre marketplace YARID est maintenant en ligne !**

Pour toute question ou problème, référez-vous à ce guide ou consultez la documentation officielle.

**Bon lancement ! **

####### MODIFICATIONS 


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
