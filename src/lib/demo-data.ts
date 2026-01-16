// Demo data for YARID MVP
// This is used for UI development before real data is available

export const demoCategories = [
  { id: '1', name: 'Téléphones & accessoires', slug: 'telephones-accessoires', icon: 'Smartphone', description: 'Smartphones, tablettes et accessoires' },
  { id: '2', name: 'Électroménagers', slug: 'electromenagers', icon: 'Refrigerator', description: 'Réfrigérateurs, climatiseurs' },
  { id: '3', name: 'Informatique', slug: 'informatique', icon: 'Laptop', description: 'Ordinateurs et périphériques' },
  { id: '4', name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', description: 'Consoles et jeux vidéo' },
  { id: '5', name: 'Industriel & BTP', slug: 'industriel-btp', icon: 'Wrench', description: 'Équipements industriels' },
  { id: '6', name: '100% Cameroun', slug: '100-cameroun', icon: 'MapPin', description: 'Produits made in Cameroon' },
  { id: '7', name: 'Santé & bien-être', slug: 'sante-bien-etre', icon: 'Heart', description: 'Équipements de santé' },
  { id: '8', name: 'Mode', slug: 'mode', icon: 'Shirt', description: 'Vêtements et accessoires' },
  { id: '9', name: 'Sport', slug: 'sport', icon: 'Dumbbell', description: 'Équipements sportifs' },
];

/**
 * Note: demoProducts have been removed. 
 * All products are now fetched from Supabase real backend.
 */

// Format price in FCFA
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
};

// Calculate discount percentage
export const getDiscount = (price: number, originalPrice: number | null): number | null => {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};
