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
- **Logique de Redirection :**
  - Utilisateur non-connecté : Accès à la Landing Page.
  - Utilisateur connecté : Redirection immédiate vers son Onboarding (si non complété) ou vers son espace (Shop/Dashboard).

---

## 3. Parcours d'Onboarding
**Fichiers :** `src/pages/onboarding/ClientOnboarding.tsx` & `VendorOnboarding.tsx`

### Pour les Clients :
- Sélection de **minimum 3 catégories** favorites.
- Personnalisation automatique de l'expérience d'achat.

### Pour les Vendeurs :
- Configuration de l'identité commerciale : Nom de boutique, description, type de boutique (physique ou en ligne).
- Validation obligatoire avant d'accéder aux outils de vente.

---

## 4. Gestion du Profil
**Fichier :** `src/pages/Profile.tsx`
- Accessible via le nom de l'utilisateur dans le Header.
- Permet la modification du nom complet.
- Pour les vendeurs : permet d'éditer les informations de la boutique à tout moment.

---

## 5. Mise à jour du Header
**Fichier :** `src/components/layout/Header.tsx`
- **Dynamic User Name :** Le nom cliquable redirige vers `/profile`.
- **Auth State :** Gestion intelligente des boutons Connexion/Inscription et Déconnexion.

---

## 6. Configuration Supabase (Base de données)

### Table `profiles`
Schéma recommandé pour supporter toutes les fonctionnalités :

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'vendor', 'admin')),
    onboarding_completed BOOLEAN DEFAULT false,
    favorite_categories TEXT[] DEFAULT '{}',
    shop_name TEXT,
    shop_description TEXT,
    shop_category TEXT,
    has_physical_store BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

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
