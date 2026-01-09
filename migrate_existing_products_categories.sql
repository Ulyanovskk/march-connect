-- Script de migration pour attribuer des catégories aux produits existants
-- Ce script attribue automatiquement des catégories basées sur le nom des produits

-- Vérifier les catégories disponibles
SELECT 'Catégories disponibles:' as info;
SELECT id, name, slug FROM categories WHERE is_active = true ORDER BY name;

-- Vérifier les produits sans catégorie
SELECT 'Produits sans catégorie:' as info;
SELECT COUNT(*) as produits_sans_categorie 
FROM products 
WHERE category_id IS NULL OR category_id = '00000000-0000-0000-0000-000000000000';

-- Attribution automatique des catégories basée sur les mots-clés dans le nom
BEGIN;

-- 1. Attribuer "Téléphones et accessoires" aux produits contenant ces mots
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'telephones-accessoires' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL 
  AND (
    LOWER(name) LIKE '%iphone%' OR
    LOWER(name) LIKE '%samsung%' OR
    LOWER(name) LIKE '%telephone%' OR
    LOWER(name) LIKE '%smartphone%' OR
    LOWER(name) LIKE '%mobile%' OR
    LOWER(name) LIKE '%téléphone%' OR
    LOWER(name) LIKE '%galaxy%' OR
    LOWER(name) LIKE '%xiaomi%' OR
    LOWER(name) LIKE '%huawei%' OR
    LOWER(name) LIKE '%écran%' OR
    LOWER(name) LIKE '%ecran%' OR
    LOWER(name) LIKE '%chargeur%' OR
    LOWER(name) LIKE '%casque%' OR
    LOWER(name) LIKE '%écouteur%' OR
    LOWER(name) LIKE '%ecouteur%' OR
    LOWER(name) LIKE '%coque%' OR
    LOWER(name) LIKE '%étui%' OR
    LOWER(name) LIKE '%etui%'
  );

-- 2. Attribuer "Mode et accessoires" aux produits de mode
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'mode-accessoires' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL 
  AND (
    LOWER(name) LIKE '%montre%' OR
    LOWER(name) LIKE '%watch%' OR
    LOWER(name) LIKE '%chaussure%' OR
    LOWER(name) LIKE '%basket%' OR
    LOWER(name) LIKE '%sac%' OR
    LOWER(name) LIKE '%bag%' OR
    LOWER(name) LIKE '%vêtement%' OR
    LOWER(name) LIKE '%vetement%' OR
    LOWER(name) LIKE '%chemise%' OR
    LOWER(name) LIKE '%robe%' OR
    LOWER(name) LIKE '%jupe%' OR
    LOWER(name) LIKE '%pantalon%' OR
    LOWER(name) LIKE '%bijou%' OR
    LOWER(name) LIKE '%collier%' OR
    LOWER(name) LIKE '%bague%' OR
    LOWER(name) LIKE '%bracelet%'
  );

-- 3. Attribuer "Maison et jardin" aux produits domestiques
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'maison-jardin' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL 
  AND (
    LOWER(name) LIKE '%canapé%' OR
    LOWER(name) LIKE '%canape%' OR
    LOWER(name) LIKE '%table%' OR
    LOWER(name) LIKE '%chaise%' OR
    LOWER(name) LIKE '%lampe%' OR
    LOWER(name) LIKE '%éclairage%' OR
    LOWER(name) LIKE '%eclairage%' OR
    LOWER(name) LIKE '%décoration%' OR
    LOWER(name) LIKE '%decoration%' OR
    LOWER(name) LIKE '%coussin%' OR
    LOWER(name) LIKE '%rideau%' OR
    LOWER(name) LIKE '%literie%' OR
    LOWER(name) LIKE '%matelas%' OR
    LOWER(name) LIKE '%meuble%' OR
    LOWER(name) LIKE '%armoire%' OR
    LOWER(name) LIKE '%bureau%'
  );

-- 4. Attribuer "Électronique" aux appareils électroniques
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'electronique' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL 
  AND (
    LOWER(name) LIKE '%ordinateur%' OR
    LOWER(name) LIKE '%computer%' OR
    LOWER(name) LIKE '%laptop%' OR
    LOWER(name) LIKE '%pc%' OR
    LOWER(name) LIKE '%imprimante%' OR
    LOWER(name) LIKE '%printer%' OR
    LOWER(name) LIKE '%enceinte%' OR
    LOWER(name) LIKE '%speaker%' OR
    LOWER(name) LIKE '%télévision%' OR
    LOWER(name) LIKE '%television%' OR
    LOWER(name) LIKE '%tv%' OR
    LOWER(name) LIKE '%console%' OR
    LOWER(name) LIKE '%jeu%' OR
    LOWER(name) LIKE '%game%'
  );

-- 5. Attribuer "Beauté et santé" aux produits de beauté
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'beaute-sante' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL 
  AND (
    LOWER(name) LIKE '%parfum%' OR
    LOWER(name) LIKE '%perfume%' OR
    LOWER(name) LIKE '%cosmétique%' OR
    LOWER(name) LIKE '%cosmetique%' OR
    LOWER(name) LIKE '%soin%' OR
    LOWER(name) LIKE '%crème%' OR
    LOWER(name) LIKE '%creme%' OR
    LOWER(name) LIKE '%maquillage%' OR
    LOWER(name) LIKE '%makeup%' OR
    LOWER(name) LIKE '%shampooing%' OR
    LOWER(name) LIKE '%savon%' OR
    LOWER(name) LIKE '%lotion%'
  );

-- 6. Attribuer une catégorie par défaut aux produits restants
UPDATE products 
SET category_id = (
    SELECT id FROM categories 
    WHERE slug = 'divers' AND is_active = true
    LIMIT 1
)
WHERE category_id IS NULL;

-- Vérifier les résultats
SELECT 'Migration terminée. Répartition par catégorie:' as info;
SELECT 
    COALESCE(c.name, 'Sans catégorie') as categorie,
    COUNT(p.id) as nombre_produits
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY nombre_produits DESC;

-- Validation finale
SELECT 'Produits toujours sans catégorie:' as info;
SELECT COUNT(*) as restants 
FROM products 
WHERE category_id IS NULL OR category_id = '00000000-0000-0000-0000-000000000000';

COMMIT;