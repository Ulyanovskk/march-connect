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
- **Database Password** : Créez un mot de passe fort ( Notez-le quelque part !)
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

## ⚙️ ÉTAPE 3 : CONFIGURER LES VARIABLES D'ENVIRONNEMENT

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

## 🔗 LIENS UTILES

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

