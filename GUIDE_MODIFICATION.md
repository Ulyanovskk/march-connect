# Guide des Modifications - March Connect

Ce document répertorie les changements majeurs effectués sur la plateforme March Connect pour assurer la stabilité et faciliter la maintenance.

---

## 1. Landing Page (Nouveauté)
**Fichier :** `src/pages/Landing.tsx`
- **Objectif :** Première page visible à la racine (`/`).
- **Fonctionnement :**
  - Section Hero avec proposition de valeur claire.
  - Cartes de sélection de parcours : **Acheteur** vs **Vendeur**.
  - Intégration du style visuel Yarid (Gradients, Glassmorphism).

---

## 2. Système d'Authentification & Rôles
**Fichier :** `src/components/auth/ProtectedRoute.tsx`
- **Objectif :** Sécuriser les accès aux pages sensibles (Catalogue, Dashboard, Checkout).
- **Logique :**
  - Vérification de la session via Supabase Auth.
  - Contrôle du rôle via `user_metadata` ou table `profiles`.
  - Redirection automatique vers `/login` pour les utilisateurs non connectés.
  - Redirection vers `/` si le rôle ne correspond pas au privilège requis (ex: vendeur accédant à une page admin).

**Application dans `App.tsx` :**
Toutes les routes de produits et de gestion sont désormais enveloppées dans un `<ProtectedRoute>`.

---

## 3. Mise à jour du Header
**Fichier :** `src/components/layout/Header.tsx`
- **Changements :**
  - Ajout du bouton **Inscription** à côté de **Connexion**.
  - État dynamique : Affiche le nom de l'utilisateur et un bouton **Quitter** (Déconnexion) si authentifié.
  - Redirection intelligente vers le bon profil (Dashboard ou Shop) selon le rôle.

---

## 4. Gestion Multi-Images (Produits)
**Fichier :** `src/pages/VendorDashboard.tsx`
- **Fonctionnement :**
  - Système de Drag & Drop supportant jusqu'à **10 photos**.
  - Galerie de prévisualisation avec option de suppression.
  - Désignation automatique de la première image comme "Photo de couverture".

---

## 5. Configuration Supabase (Base de données)

### Table `products`
Colonnes ajoutées : `image` (couverture), `images` (tableau), `slug` (auto-généré), `vendor_id` (lié à auth.users).

### Table `profiles` (Recommandé)
Pour une gestion robuste des rôles, exécutez ce SQL :

```sql
-- Création de la table profil
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'vendor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Active RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Politique de mise à jour par l'utilisateur
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger pour création automatique au signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'client'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

*Livrable final prêt pour le déploiement.*
