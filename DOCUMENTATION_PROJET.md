# Documentation du Projet YARID - Marché Connect

## Table des Matières
1. [Structure du Projet](#structure-du-projet)
2. [Technologies Utilisées](#technologies-utilisées)
3. [Configuration du Projet](#configuration-du-projet)
4. [Architecture des Dossiers](#architecture-des-dossiers)
5. [Fonctionnalités Principales](#fonctionnalités-principales)
6. [Guide des Modifications](#guide-des-modifications)
7. [Gestion des Textes](#gestion-des-textes)
8. [Gestion des Images](#gestion-des-images)
9. [Gestion des Couleurs](#gestion-des-couleurs)
10. [Gestion des Composants UI](#gestion-des-composants-ui)

## Structure du Projet

```
march-connect/
├── public/                 # Fichiers statiques accessibles publiquement
├── src/                    # Code source de l'application
│   ├── components/         # Composants réutilisables
│   ├── contexts/           # Contextes React (état global)
│   ├── hooks/              # Hooks personnalisés
│   ├── integrations/       # Intégrations externes (Supabase)
│   ├── lib/                # Fonctions utilitaires
│   ├── pages/              # Pages de l'application
│   ├── types/              # Définitions de types TypeScript
│   ├── App.tsx            # Composant racine
│   ├── main.tsx           # Point d'entrée de l'application
│   └── autres fichiers
├── supabase/              # Configuration et fonctions Supabase
├── .env                   # Variables d'environnement
├── package.json           # Dépendances et scripts
└── autres fichiers de configuration
```

## Technologies Utilisées

- **React** avec TypeScript
- **Vite** comme outil de build
- **Supabase** pour l'authentification et la base de données
- **Tailwind CSS** pour le style
- **shadcn/ui** pour les composants UI
- **React Router DOM** pour la navigation

## Configuration du Projet

### Variables d'Environnement (.env)
Le fichier `.env` contient les clés d'API Supabase :
- `VITE_SUPABASE_PROJECT_ID` - ID du projet Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Clé publique Supabase
- `VITE_SUPABASE_URL` - URL de l'API Supabase

### Configuration Supabase
- Fichier: `src/integrations/supabase/client.ts`
- Gère la connexion à la base de données
- Fichier: `src/integrations/supabase/types.ts`
- Définit les types des tables Supabase

## Architecture des Dossiers

### Dossier `public/`
Contient les fichiers statiques accessibles directement :
- `_redirects` - Règles de redirection pour les déploiements
- `robots.txt` - Instructions pour les robots d'indexation

### Dossier `src/components/`
Composants réutilisables dans l'application :
- `auth/` - Composants liés à l'authentification
- `home/` - Composants de la page d'accueil
- `layout/` - Composants de mise en page (Header, Footer)
- `product/` - Composants liés aux produits
- `ui/` - Composants d'interface utilisateur génériques
- `NavLink.tsx` - Composant de navigation

### Dossier `src/contexts/`
- `CartContext.tsx` - Gère l'état du panier d'achat

### Dossier `src/hooks/`
- `use-mobile.tsx` - Hook pour détecter les appareils mobiles
- `use-toast.ts` - Hook pour les notifications

### Dossier `src/integrations/supabase/`
- `client.ts` - Client Supabase principal
- `types.ts` - Types TypeScript pour les tables

### Dossier `src/lib/`
- `demo-data.ts` - Données de démonstration
- `utils.ts` - Fonctions utilitaires

### Dossier `src/pages/`
Pages de l'application :
- `admin/` - Pages pour les administrateurs
- `onboarding/` - Pages d'inscription et de configuration
- Pages individuelles comme `Login.tsx`, `Signup.tsx`, `Catalogue.tsx`, etc.

### Dossier `src/types/`
- `index.ts` - Définitions de types globaux

### Dossier `supabase/`
Configuration et fonctions côté serveur :
- `functions/` - Fonctions Deno déployées
- `migrations/` - Scripts de migration de base de données
- `config.toml` - Configuration de Supabase

## Fonctionnalités Principales

### Authentification
- Connexion/Inscription (clients et vendeurs)
- Réinitialisation de mot de passe
- Confirmation par email
- Gestion des rôles (client, vendeur, admin)

### E-commerce
- Catalogue de produits
- Panier d'achat
- Paiement (Orange Money, MTN Money, Cash)
- Gestion des commandes

### Dashboard Vendeur
- Gestion des produits
- Statistiques de vente
- Gestion des commandes

### Fonctionnalités pour les Clients
- Navigation par catégories
- Recherche de produits
- Avis et évaluations
- Historique des commandes

## Guide des Modifications

Ce guide vous permettra de modifier différents aspects de votre application sans avoir besoin d'aide extérieure.

## Gestion des Textes

### Où trouver les textes à modifier

#### Pages principales
- `src/pages/Login.tsx` - Textes de la page de connexion
- `src/pages/Signup.tsx` - Textes de la page d'inscription
- `src/pages/ForgotPassword.tsx` - Textes de la page de mot de passe oublié
- `src/pages/ResetPassword.tsx` - Textes de la page de réinitialisation
- `src/pages/Catalogue.tsx` - Textes de la page catalogue
- `src/pages/ProductDetail.tsx` - Textes de la page détails produit
- `src/pages/Cart.tsx` - Textes de la page panier
- `src/pages/Checkout.tsx` - Textes de la page de paiement
- `src/pages/Index.tsx` - Textes de la page d'accueil
- `src/pages/Landing.tsx` - Textes de la page de destination
- `src/pages/FAQ.tsx` - Textes de la page FAQ
- `src/pages/TermsOfService.tsx` - Textes des conditions d'utilisation
- `src/pages/PrivacyPolicy.tsx` - Textes de la politique de confidentialité
- `src/pages/LegalNotice.tsx` - Textes des mentions légales

#### Composants réutilisables
- `src/components/layout/Header.tsx` - Textes de l'en-tête
- `src/components/layout/Footer.tsx` - Textes du pied de page
- `src/components/home/HeroBanner.tsx` - Textes de la bannière d'accueil
- `src/components/home/CategoriesSection.tsx` - Textes des catégories
- `src/components/home/PopularProducts.tsx` - Textes des produits populaires
- `src/components/home/VendorCTA.tsx` - Textes d'appel à l'action vendeur

#### Pages d'onboarding
- `src/pages/onboarding/ClientOnboarding.tsx` - Textes onboarding client
- `src/pages/onboarding/VendorOnboarding.tsx` - Textes onboarding vendeur

#### Pages vendeur
- `src/pages/VendorDashboard.tsx` - Textes du dashboard vendeur
- `src/pages/VendorInscription.tsx` - Textes d'inscription vendeur

### Comment modifier les textes

1. Ouvrez le fichier concerné dans votre éditeur de code
2. Recherchez le texte que vous souhaitez modifier
3. Remplacez-le par votre nouveau texte
4. Sauvegardez le fichier

Exemple : Pour modifier le texte "Bienvenue sur la marketplace N°1 du Cameroun" dans la page de connexion, allez dans `src/pages/Login.tsx` et modifiez le texte entre les balises HTML correspondantes.

## Gestion des Images

### Où trouver les images

#### Images du logo
- Le logo principal est importé dans chaque composant comme `yaridLogo`
- Il est généralement défini dans le composant racine ou dans un fichier d'assets

#### Images de produits
- Les images des produits sont généralement stockées dans une base de données Supabase
- Elles sont récupérées dynamiquement via des appels API

#### Images de fond et bannières
- Cherchez dans `src/components/home/HeroBanner.tsx` pour la bannière d'accueil
- Les images peuvent être intégrées directement dans le code ou provenir d'URL externes

### Comment remplacer les images

1. **Pour les images fixes (logo, icônes)** :
   - Placez votre nouvelle image dans le dossier `public/`
   - Mettez à jour le chemin d'importation dans le fichier correspondant
   - Assurez-vous que le format est compatible (PNG, JPG, SVG, etc.)

2. **Pour les images de produits** :
   - Les images sont gérées via le dashboard vendeur
   - Les vendeurs téléchargent leurs images via l'interface

## Gestion des Couleurs

### Fichiers de configuration des couleurs

#### Tailwind CSS
- `tailwind.config.ts` - Configuration principale des couleurs
- `src/index.css` - Styles globaux et variables CSS

#### Variables de couleurs dans Tailwind
Les couleurs personnalisées sont définies dans `tailwind.config.ts` dans la section `theme.extend.colors` :

```js
y: {
  primary: '#your-color',
  secondary: '#your-color',
  accent: '#your-color',
  // etc.
}
```

### Couleurs spécifiques utilisées dans le projet

- `yarid-green` - #22c55e (utilisé pour les éléments de succès)
- `yarid-orange` - #f97316 (utilisé pour les éléments d'accentuation)
- `yarid-yellow` - #eab308 (utilisé pour les étoiles et évaluations)
- `yarid-blue` - #3b82f6 (utilisé pour les éléments d'interface)
- `primary` - Couleur principale de l'interface
- `secondary` - Couleur secondaire de l'interface

### Comment modifier les couleurs

1. **Pour modifier les couleurs globales** :
   - Modifiez `tailwind.config.ts`
   - Mettez à jour les valeurs dans la section `theme.extend.colors`
   - Sauvegardez et redémarrez le serveur de développement si nécessaire

2. **Pour modifier les couleurs d'un composant spécifique** :
   - Localisez le composant concerné
   - Modifiez les classes Tailwind correspondantes
   - Exemple : remplacez `bg-primary` par `bg-blue-500` pour changer la couleur de fond

## Gestion des Composants UI

### Composants shadcn/ui

Le projet utilise des composants UI provenant de shadcn/ui :
- `src/components/ui/` - Contient tous les composants UI
- Chaque fichier correspond à un type de composant (boutons, formulaires, etc.)

### Composants personnalisés

#### Composants d'affichage produit
- `src/components/ui/ProductCard.tsx` - Carte d'affichage d'un produit
- `src/components/ui/CategoryCard.tsx` - Carte d'affichage d'une catégorie

#### Composants de formulaire
- `src/components/ui/Input.tsx` - Champ de saisie
- `src/components/ui/Button.tsx` - Bouton
- `src/components/ui/Select.tsx` - Sélecteur
- `src/components/ui/Textarea.tsx` - Zone de texte

### Comment modifier l'apparence des composants

1. **Pour modifier un composant spécifique** :
   - Allez dans le fichier du composant dans `src/components/ui/`
   - Modifiez les classes Tailwind ou le JSX
   - Sauvegardez

2. **Pour modifier l'apparence globale d'un type de composant** :
   - Modifiez le composant dans `src/components/ui/`
   - Tous les usages de ce composant seront affectés

## Personnalisation Avancée

### Modification du thème global

1. **Via Tailwind** :
   - Modifiez `tailwind.config.ts` pour changer les couleurs, polices, espacements globaux
   - Modifiez `src/index.css` pour ajouter des styles globaux

2. **Via les composants de mise en page** :
   - Modifiez `src/components/layout/Header.tsx` pour changer l'en-tête
   - Modifiez `src/components/layout/Footer.tsx` pour changer le pied de page

### Modification des fonctionnalités

1. **Ajout de nouvelles pages** :
   - Créez un nouveau fichier dans `src/pages/`
   - Ajoutez la route dans `src/App.tsx`

2. **Modification des routes** :
   - Modifiez `src/App.tsx` pour changer les routes de l'application

3. **Modification de la logique métier** :
   - Identifiez le composant ou la page concernée
   - Modifiez la logique dans le fichier correspondant
   - Mettez à jour les appels API si nécessaire

### Dépannage des modifications

1. **Problèmes de style** :
   - Vérifiez que les classes Tailwind sont correctement appliquées
   - Utilisez les outils de développement du navigateur pour inspecter les éléments

2. **Problèmes de fonctionnement** :
   - Vérifiez la console du navigateur pour les erreurs
   - Assurez-vous que les imports sont correctement mis à jour
   - Vérifiez que les variables et fonctions sont correctement définies

Ce document vous permettra de modifier votre projet de manière autonome. Si vous avez besoin de modifications spécifiques, référez-vous à la section correspondante pour localiser les fichiers concernés.