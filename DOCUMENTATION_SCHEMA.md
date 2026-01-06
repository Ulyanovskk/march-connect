# 📊 Documentation du Schéma de Base de Données - YARID Marketplace

Ce document explique en détail toutes les tables du schéma de base de données pour YARID.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Tableaux récapitulatifs](#tableaux-récapitulatifs)
3. [Détails des tables](#détails-des-tables)
4. [Relations entre tables](#relations-entre-tables)
5. [Utilisation pratique](#utilisation-pratique)

---

## 🎯 Vue d'ensemble

Le schéma contient **30+ tables** organisées en **11 catégories principales** :

1. **Utilisateurs et Authentification** (3 tables)
2. **Vendeurs et Boutiques** (2 tables)
3. **Catégories et Produits** (4 tables)
4. **Commandes et Paiements** (5 tables)
5. **Panier et Favoris** (2 tables)
6. **Avis et Notations** (2 tables)
7. **Notifications et Messages** (2 tables)
8. **Promotions et Coupons** (3 tables)
9. **Livraison** (2 tables)
10. **Statistiques et Analytics** (2 tables)
11. **Configuration** (1 table)

---

## 📊 Tableaux Récapitulatifs

### Liste Complète des Tables

| # | Table | Description | Lignes estimées |
|---|-------|-------------|-----------------|
| **UTILISATEURS** |
| 1 | `profiles` | Profils utilisateurs | ~10,000 |
| 2 | `user_roles` | Rôles des utilisateurs | ~15,000 |
| **VENDEURS** |
| 3 | `vendors` | Informations des vendeurs/boutiques | ~500 |
| 4 | `vendor_verification_documents` | Documents de vérification | ~500 |
| **PRODUITS** |
| 5 | `categories` | Catégories de produits | ~50 |
| 6 | `products` | Produits | ~50,000 |
| 7 | `product_variants` | Variantes de produits | ~10,000 |
| 8 | `product_attributes` | Attributs de produits | ~100,000 |
| **COMMANDES** |
| 9 | `addresses` | Adresses de livraison | ~20,000 |
| 10 | `orders` | Commandes | ~100,000 |
| 11 | `order_items` | Articles des commandes | ~300,000 |
| 12 | `order_status_history` | Historique des statuts | ~500,000 |
| 13 | `payments` | Paiements | ~100,000 |
| **PANIER & FAVORIS** |
| 14 | `cart_items` | Articles du panier | ~50,000 |
| 15 | `wishlist` | Liste de souhaits | ~30,000 |
| **AVIS** |
| 16 | `product_reviews` | Avis sur produits | ~50,000 |
| 17 | `vendor_reviews` | Avis sur vendeurs | ~10,000 |
| **NOTIFICATIONS** |
| 18 | `notifications` | Notifications | ~1,000,000 |
| 19 | `messages` | Messages support | ~100,000 |
| **PROMOTIONS** |
| 20 | `coupons` | Coupons de réduction | ~1,000 |
| 21 | `coupon_usage` | Utilisation des coupons | ~20,000 |
| 22 | `promotions` | Promotions spéciales | ~100 |
| **LIVRAISON** |
| 23 | `shipping_methods` | Méthodes de livraison | ~20 |
| 24 | `shipments` | Expéditions | ~100,000 |
| **ANALYTICS** |
| 25 | `product_views` | Vues de produits | ~5,000,000 |
| 26 | `search_history` | Historique de recherche | ~500,000 |
| **CONFIGURATION** |
| 27 | `site_settings` | Paramètres du site | ~50 |

**Total : 27 tables principales**

---

## 📖 Détails des Tables

### 1. UTILISATEURS ET AUTHENTIFICATION

#### `profiles`
Profil de base pour chaque utilisateur (client ou vendeur).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID utilisateur (référence auth.users) |
| `full_name` | TEXT | Nom complet |
| `phone` | TEXT | Téléphone |
| `whatsapp` | TEXT | WhatsApp |
| `avatar_url` | TEXT | URL de l'avatar |
| `city` | TEXT | Ville |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Profil de base pour tous les utilisateurs.

---

#### `user_roles`
Rôles des utilisateurs (admin, client, vendor).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `role` | ENUM | 'admin', 'client', ou 'vendor' |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Un utilisateur peut avoir plusieurs rôles (ex: client + vendor).

---

### 2. VENDEURS ET BOUTIQUES

#### `vendors`
Informations spécifiques aux vendeurs/boutiques.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID vendeur |
| `user_id` | UUID (FK) | Référence vers auth.users (UNIQUE) |
| `shop_name` | TEXT | Nom de la boutique |
| `slug` | TEXT (UNIQUE) | Slug URL (ex: "techpro-douala") |
| `description` | TEXT | Description de la boutique |
| `logo_url` | TEXT | Logo de la boutique |
| `cover_image_url` | TEXT | Image de couverture |
| `phone` | TEXT | Téléphone |
| `whatsapp` | TEXT | WhatsApp |
| `email` | TEXT | Email |
| `city` | TEXT | Ville (défaut: 'Douala') |
| `address` | TEXT | Adresse physique |
| `is_verified` | BOOLEAN | Boutique vérifiée ? |
| `is_active` | BOOLEAN | Boutique active ? |
| `commission_rate` | DECIMAL(5,2) | Taux de commission (défaut: 15%) |
| `max_products_per_month` | INTEGER | Limite de produits (défaut: 3) |
| `rating_average` | DECIMAL(3,2) | Note moyenne |
| `rating_count` | INTEGER | Nombre d'avis |
| `total_sales` | INTEGER | Nombre total de ventes |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Toutes les informations de la boutique.

---

#### `vendor_verification_documents`
Documents pour la vérification des vendeurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `vendor_id` | UUID (FK) | Référence vers vendors |
| `document_type` | TEXT | Type: 'cni', 'business_license', 'tax_id' |
| `document_url` | TEXT | URL du document |
| `status` | TEXT | 'pending', 'approved', 'rejected' |
| `reviewed_by` | UUID (FK) | Admin qui a vérifié |
| `reviewed_at` | TIMESTAMP | Date de vérification |
| `notes` | TEXT | Notes |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Gérer la vérification des vendeurs.

---

### 3. CATÉGORIES ET PRODUITS

#### `categories`
Catégories de produits (avec support hiérarchique).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID catégorie |
| `name` | TEXT | Nom |
| `slug` | TEXT (UNIQUE) | Slug URL |
| `icon` | TEXT | Nom de l'icône |
| `description` | TEXT | Description |
| `parent_id` | UUID (FK) | Catégorie parente (NULL si racine) |
| `image_url` | TEXT | Image de la catégorie |
| `is_active` | BOOLEAN | Active ? |
| `sort_order` | INTEGER | Ordre d'affichage |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Organisation des produits par catégories.

---

#### `products`
Produits vendus sur la plateforme.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID produit |
| `vendor_id` | UUID (FK) | Référence vers vendors |
| `category_id` | UUID (FK) | Référence vers categories |
| `name` | TEXT | Nom du produit |
| `slug` | TEXT | Slug URL (unique par vendeur) |
| `description` | TEXT | Description complète |
| `short_description` | TEXT | Description courte |
| `price` | DECIMAL(12,2) | Prix de vente |
| `original_price` | DECIMAL(12,2) | Prix original (pour promo) |
| `sku` | TEXT (UNIQUE) | Code SKU |
| `stock` | INTEGER | Stock disponible |
| `min_stock` | INTEGER | Stock minimum |
| `images` | TEXT[] | Tableau d'URLs d'images |
| `is_active` | BOOLEAN | Produit actif ? |
| `is_featured` | BOOLEAN | Produit mis en avant ? |
| `views` | INTEGER | Nombre de vues |
| `sales_count` | INTEGER | Nombre de ventes |
| `rating_average` | DECIMAL(3,2) | Note moyenne |
| `rating_count` | INTEGER | Nombre d'avis |
| `weight_kg` | DECIMAL(8,2) | Poids en kg |
| `dimensions_cm` | TEXT | Dimensions (LxWxH) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Tous les produits de la marketplace.

---

#### `product_variants`
Variantes de produits (taille, couleur, etc.).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID variante |
| `product_id` | UUID (FK) | Référence vers products |
| `name` | TEXT | Nom (ex: "Rouge", "XL") |
| `sku` | TEXT (UNIQUE) | SKU de la variante |
| `price` | DECIMAL(12,2) | Prix spécifique (optionnel) |
| `stock` | INTEGER | Stock spécifique |
| `image_url` | TEXT | Image spécifique |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Gérer les variantes (couleur, taille, etc.).

---

#### `product_attributes`
Attributs additionnels des produits.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `product_id` | UUID (FK) | Référence vers products |
| `attribute_name` | TEXT | Nom (ex: "Marque", "Garantie") |
| `attribute_value` | TEXT | Valeur (ex: "Samsung", "1 an") |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Stocker des attributs flexibles (marque, garantie, etc.).

---

### 4. COMMANDES ET PAIEMENTS

#### `addresses`
Adresses de livraison des utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID adresse |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `label` | TEXT | Label (ex: "Domicile", "Bureau") |
| `full_name` | TEXT | Nom complet |
| `phone` | TEXT | Téléphone |
| `address_line1` | TEXT | Adresse ligne 1 |
| `address_line2` | TEXT | Adresse ligne 2 |
| `city` | TEXT | Ville |
| `postal_code` | TEXT | Code postal |
| `is_default` | BOOLEAN | Adresse par défaut ? |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Gérer les adresses de livraison.

---

#### `orders`
Commandes des clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID commande |
| `order_number` | TEXT (UNIQUE) | Numéro (ex: "YAR-2026-001234") |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `shipping_address_id` | UUID (FK) | Référence vers addresses |
| `status` | ENUM | Statut (pending, confirmed, etc.) |
| `subtotal` | DECIMAL(12,2) | Sous-total |
| `shipping_cost` | DECIMAL(12,2) | Coût livraison |
| `commission_amount` | DECIMAL(12,2) | Commission YARID |
| `total_amount` | DECIMAL(12,2) | Montant total |
| `notes` | TEXT | Notes client |
| `vendor_notes` | TEXT | Notes internes vendeur |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Statuts possibles :**
- `pending` - En attente
- `confirmed` - Confirmée
- `processing` - En préparation
- `ready` - Prête à être livrée
- `shipped` - Expédiée
- `delivered` - Livrée
- `cancelled` - Annulée
- `refunded` - Remboursée

---

#### `order_items`
Articles dans une commande.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `order_id` | UUID (FK) | Référence vers orders |
| `product_id` | UUID (FK) | Référence vers products |
| `variant_id` | UUID (FK) | Référence vers product_variants |
| `quantity` | INTEGER | Quantité |
| `unit_price` | DECIMAL(12,2) | Prix unitaire au moment de la commande |
| `total_price` | DECIMAL(12,2) | Prix total (quantity × unit_price) |
| `vendor_id` | UUID (FK) | Référence vers vendors |
| `created_at` | TIMESTAMP | Date de création |

**Utilisation :** Stocker chaque article de la commande avec son prix au moment de l'achat.

---

#### `order_status_history`
Historique des changements de statut.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `order_id` | UUID (FK) | Référence vers orders |
| `status` | ENUM | Nouveau statut |
| `notes` | TEXT | Notes |
| `changed_by` | UUID (FK) | Qui a changé le statut |
| `created_at` | TIMESTAMP | Date du changement |

**Utilisation :** Traçabilité complète des commandes.

---

#### `payments`
Paiements des commandes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID paiement |
| `order_id` | UUID (FK) | Référence vers orders |
| `payment_method` | ENUM | Méthode (orange_money, mtn_momo, etc.) |
| `status` | ENUM | Statut (pending, completed, etc.) |
| `amount` | DECIMAL(12,2) | Montant |
| `transaction_id` | TEXT | ID transaction |
| `transaction_reference` | TEXT | Référence transaction |
| `payment_proof_url` | TEXT | Capture d'écran du paiement |
| `paid_at` | TIMESTAMP | Date de paiement |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Méthodes de paiement :**
- `orange_money`
- `mtn_momo`
- `cash_on_delivery`
- `bank_transfer`
- `credit_card`

---

### 5. PANIER ET FAVORIS

#### `cart_items`
Articles du panier (persistant en base).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `product_id` | UUID (FK) | Référence vers products |
| `variant_id` | UUID (FK) | Référence vers product_variants |
| `quantity` | INTEGER | Quantité |
| `created_at` | TIMESTAMP | Date d'ajout |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Panier synchronisé entre appareils (alternative au localStorage).

---

#### `wishlist`
Liste de souhaits/Favoris.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `product_id` | UUID (FK) | Référence vers products |
| `created_at` | TIMESTAMP | Date d'ajout |

**Utilisation :** Produits favoris des utilisateurs.

---

### 6. AVIS ET NOTATIONS

#### `product_reviews`
Avis sur les produits.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID avis |
| `product_id` | UUID (FK) | Référence vers products |
| `order_id` | UUID (FK) | Référence vers orders (optionnel) |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `rating` | INTEGER | Note (1-5) |
| `title` | TEXT | Titre de l'avis |
| `comment` | TEXT | Commentaire |
| `images` | TEXT[] | Images de l'avis |
| `is_verified_purchase` | BOOLEAN | Achat vérifié ? |
| `is_approved` | BOOLEAN | Avis approuvé ? |
| `helpful_count` | INTEGER | Nombre de "utile" |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Avis clients sur les produits.

---

#### `vendor_reviews`
Avis sur les vendeurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID avis |
| `vendor_id` | UUID (FK) | Référence vers vendors |
| `order_id` | UUID (FK) | Référence vers orders |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `rating` | INTEGER | Note (1-5) |
| `comment` | TEXT | Commentaire |
| `is_approved` | BOOLEAN | Avis approuvé ? |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Utilisation :** Avis clients sur les vendeurs.

---

### 7. NOTIFICATIONS ET MESSAGES

#### `notifications`
Notifications aux utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID notification |
| `user_id` | UUID (FK) | Référence vers auth.users |
| `type` | ENUM | Type de notification |
| `title` | TEXT | Titre |
| `message` | TEXT | Message |
| `link` | TEXT | URL vers la page |
| `is_read` | BOOLEAN | Lu ? |
| `metadata` | JSONB | Données supplémentaires |
| `created_at` | TIMESTAMP | Date de création |

**Types de notifications :**
- `order_placed`, `order_confirmed`, `order_shipped`, `order_delivered`
- `payment_received`, `review_received`
- `product_approved`, `vendor_verified`
- `system_announcement`

---

#### `messages`
Messages entre utilisateurs et support.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID message |
| `sender_id` | UUID (FK) | Expéditeur |
| `recipient_id` | UUID (FK) | Destinataire |
| `order_id` | UUID (FK) | Référence commande (optionnel) |
| `subject` | TEXT | Sujet |
| `message` | TEXT | Message |
| `is_read` | BOOLEAN | Lu ? |
| `created_at` | TIMESTAMP | Date d'envoi |

---

### 8. PROMOTIONS ET COUPONS

#### `coupons`
Coupons de réduction.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID coupon |
| `code` | TEXT (UNIQUE) | Code (ex: "PROMO2026") |
| `description` | TEXT | Description |
| `discount_type` | TEXT | 'percentage' ou 'fixed' |
| `discount_value` | DECIMAL(12,2) | Valeur (15% ou 5000 FCFA) |
| `min_purchase_amount` | DECIMAL(12,2) | Montant minimum |
| `max_discount_amount` | DECIMAL(12,2) | Réduction max (pour %) |
| `usage_limit` | INTEGER | Limite d'utilisation |
| `usage_count` | INTEGER | Nombre d'utilisations |
| `is_active` | BOOLEAN | Actif ? |
| `valid_from` | TIMESTAMP | Valide à partir de |
| `valid_until` | TIMESTAMP | Valide jusqu'à |
| `created_at` | TIMESTAMP | Date de création |

---

#### `coupon_usage`
Utilisation des coupons.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `coupon_id` | UUID (FK) | Référence vers coupons |
| `user_id` | UUID (FK) | Utilisateur |
| `order_id` | UUID (FK) | Commande |
| `discount_amount` | DECIMAL(12,2) | Montant de réduction |
| `used_at` | TIMESTAMP | Date d'utilisation |

---

#### `promotions`
Promotions spéciales.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID promotion |
| `name` | TEXT | Nom |
| `description` | TEXT | Description |
| `discount_type` | TEXT | 'percentage' ou 'fixed' |
| `discount_value` | DECIMAL(12,2) | Valeur |
| `min_purchase_amount` | DECIMAL(12,2) | Montant minimum |
| `applicable_to` | TEXT | 'all', 'category', 'product', 'vendor' |
| `category_id` | UUID (FK) | Si applicable_to = 'category' |
| `product_id` | UUID (FK) | Si applicable_to = 'product' |
| `vendor_id` | UUID (FK) | Si applicable_to = 'vendor' |
| `is_active` | BOOLEAN | Active ? |
| `valid_from` | TIMESTAMP | Valide à partir de |
| `valid_until` | TIMESTAMP | Valide jusqu'à |
| `created_at` | TIMESTAMP | Date de création |

---

### 9. LIVRAISON

#### `shipping_methods`
Méthodes de livraison disponibles.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `name` | TEXT | Nom (ex: "Livraison standard") |
| `description` | TEXT | Description |
| `cost` | DECIMAL(12,2) | Coût |
| `free_shipping_threshold` | DECIMAL(12,2) | Livraison gratuite au-delà de |
| `estimated_days` | INTEGER | Délai estimé (jours) |
| `is_active` | BOOLEAN | Active ? |
| `city` | TEXT | Si spécifique à une ville |
| `created_at` | TIMESTAMP | Date de création |

---

#### `shipments`
Expéditions des commandes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID expédition |
| `order_id` | UUID (FK) | Référence vers orders |
| `shipping_method_id` | UUID (FK) | Méthode utilisée |
| `tracking_number` | TEXT | Numéro de suivi |
| `carrier` | TEXT | Transporteur (DHL, FedEx, etc.) |
| `shipped_at` | TIMESTAMP | Date d'expédition |
| `delivered_at` | TIMESTAMP | Date de livraison |
| `created_at` | TIMESTAMP | Date de création |

---

### 10. STATISTIQUES ET ANALYTICS

#### `product_views`
Vues de produits (pour analytics).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `product_id` | UUID (FK) | Produit vu |
| `user_id` | UUID (FK) | Utilisateur (NULL si anonyme) |
| `ip_address` | INET | Adresse IP |
| `user_agent` | TEXT | Navigateur |
| `created_at` | TIMESTAMP | Date |

---

#### `search_history`
Historique de recherche.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `user_id` | UUID (FK) | Utilisateur (NULL si anonyme) |
| `search_query` | TEXT | Terme recherché |
| `results_count` | INTEGER | Nombre de résultats |
| `created_at` | TIMESTAMP | Date |

---

### 11. CONFIGURATION

#### `site_settings`
Paramètres du site.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID |
| `key` | TEXT (UNIQUE) | Clé (ex: "maintenance_mode") |
| `value` | JSONB | Valeur (flexible) |
| `description` | TEXT | Description |
| `updated_at` | TIMESTAMP | Date de mise à jour |
| `updated_by` | UUID (FK) | Qui a mis à jour |

**Utilisation :** Stocker des paramètres configurables (ex: maintenance, taux de commission global, etc.).

---

## 🔗 Relations entre Tables

### Schéma Relationnel Simplifié

```
auth.users
    ├── profiles (1:1)
    ├── user_roles (1:N)
    ├── vendors (1:1)
    ├── addresses (1:N)
    ├── orders (1:N)
    ├── cart_items (1:N)
    ├── wishlist (1:N)
    └── notifications (1:N)

vendors
    ├── vendor_verification_documents (1:N)
    ├── products (1:N)
    ├── vendor_reviews (1:N)
    └── orders (via order_items) (1:N)

categories
    ├── categories (parent_id, hiérarchique)
    └── products (1:N)

products
    ├── product_variants (1:N)
    ├── product_attributes (1:N)
    ├── product_reviews (1:N)
    ├── cart_items (1:N)
    ├── wishlist (1:N)
    └── order_items (1:N)

orders
    ├── order_items (1:N)
    ├── order_status_history (1:N)
    ├── payments (1:N)
    └── shipments (1:1)

coupons
    └── coupon_usage (1:N)
```

---

## 💡 Utilisation Pratique

### Scénarios Courants

#### 1. Créer un produit

```sql
-- Insérer un produit
INSERT INTO products (vendor_id, category_id, name, slug, description, price, stock, images)
VALUES (
  'vendor-uuid',
  'category-uuid',
  'iPhone 15 Pro Max',
  'iphone-15-pro-max',
  'Description...',
  850000,
  5,
  ARRAY['https://...', 'https://...']
);
```

#### 2. Créer une commande

```sql
-- 1. Créer la commande
INSERT INTO orders (order_number, user_id, shipping_address_id, status, subtotal, total_amount)
VALUES (
  generate_order_number(),
  'user-uuid',
  'address-uuid',
  'pending',
  850000,
  850000
)
RETURNING id;

-- 2. Ajouter les articles
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, vendor_id)
VALUES (
  'order-uuid',
  'product-uuid',
  1,
  850000,
  850000,
  'vendor-uuid'
);
```

#### 3. Récupérer les produits d'un vendeur

```sql
SELECT 
  p.*,
  c.name as category_name,
  v.shop_name
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN vendors v ON p.vendor_id = v.id
WHERE p.vendor_id = 'vendor-uuid'
  AND p.is_active = true
ORDER BY p.created_at DESC;
```

#### 4. Calculer les statistiques d'un vendeur

```sql
SELECT 
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(oi.total_price) as total_revenue,
  AVG(vr.rating) as avg_rating
FROM vendors v
LEFT JOIN products p ON v.id = p.vendor_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
LEFT JOIN vendor_reviews vr ON v.id = vr.vendor_id
WHERE v.id = 'vendor-uuid'
GROUP BY v.id;
```

---

## 📝 Notes Importantes

1. **Row Level Security (RLS)** : Toutes les tables ont RLS activé. Les politiques de base sont définies, mais affinez-les selon vos besoins.

2. **Indexes** : Des index sont créés sur les colonnes fréquemment utilisées pour optimiser les performances.

3. **Triggers** : 
   - `updated_at` se met à jour automatiquement
   - Création automatique de profil à l'inscription
   - Mise à jour automatique des statistiques (ratings)

4. **Évolutivité** : Pour de grandes quantités de données, considérez :
   - Partitions pour `orders`, `product_views`, `notifications`
   - Archivage des anciennes données
   - Vues matérialisées pour les statistiques

5. **Sécurité** : 
   - Ne stockez JAMAIS les mots de passe (géré par Supabase Auth)
   - Les clés API doivent être dans les variables d'environnement
   - Validez toujours les entrées utilisateur

---

## ✅ Checklist de Déploiement

- [ ] Appliquer la migration sur Supabase
- [ ] Configurer les politiques RLS selon vos besoins
- [ ] Tester les insertions de données
- [ ] Vérifier les triggers
- [ ] Configurer les backups automatiques
- [ ] Monitorer les performances

---

**Ce schéma est conçu pour évoluer avec votre marketplace ! 🚀**

