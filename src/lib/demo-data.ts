// Demo data for YARID MVP
// This is used for UI development before real data is available

export const demoCategories = [
  { id: '1', name: 'Téléphones & accessoires', slug: 'telephones', icon: 'Smartphone', description: 'Smartphones, tablettes et accessoires' },
  { id: '2', name: 'Électroménagers', slug: 'electromenagers', icon: 'Refrigerator', description: 'Réfrigérateurs, climatiseurs' },
  { id: '3', name: 'Informatique', slug: 'informatique', icon: 'Laptop', description: 'Ordinateurs et périphériques' },
  { id: '4', name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', description: 'Consoles et jeux vidéo' },
  { id: '5', name: 'Industriel & BTP', slug: 'industriel-btp', icon: 'Wrench', description: 'Équipements industriels' },
  { id: '6', name: '100% Cameroun', slug: 'cameroun', icon: 'MapPin', description: 'Produits made in Cameroon' },
  { id: '7', name: 'Santé & bien-être', slug: 'sante', icon: 'Heart', description: 'Équipements de santé' },
  { id: '8', name: 'Mode', slug: 'mode', icon: 'Shirt', description: 'Vêtements et accessoires' },
  { id: '9', name: 'Sport', slug: 'sport', icon: 'Dumbbell', description: 'Équipements sportifs' },
];

export const demoProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Le dernier iPhone avec puce A17 Pro, titane naturel. État neuf, garantie 1 an.',
    price: 850000,
    original_price: 950000,
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],
    stock: 5,
    category: demoCategories[0],
    vendor: { shop_name: 'TechPro Douala', city: 'Douala', is_verified: true },
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone Samsung haut de gamme avec S Pen intégré. 512GB stockage.',
    price: 780000,
    original_price: 850000,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
    stock: 8,
    category: demoCategories[0],
    vendor: { shop_name: 'Mobile Zone', city: 'Yaoundé', is_verified: true },
  },
  {
    id: '3',
    name: 'MacBook Pro M3 14"',
    description: 'Ordinateur portable Apple avec puce M3, 16GB RAM, 512GB SSD.',
    price: 1450000,
    original_price: 1600000,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    stock: 3,
    category: demoCategories[2],
    vendor: { shop_name: 'Apple Store Cameroun', city: 'Douala', is_verified: true },
  },
  {
    id: '4',
    name: 'PlayStation 5 + 2 Manettes',
    description: 'Console PS5 édition standard avec 2 manettes DualSense et 3 jeux inclus.',
    price: 420000,
    original_price: 480000,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'],
    stock: 12,
    category: demoCategories[3],
    vendor: { shop_name: 'GameWorld CM', city: 'Douala', is_verified: false },
  },
  {
    id: '5',
    name: 'Climatiseur Samsung 12000 BTU',
    description: 'Climatiseur split inverter économique, installation gratuite à Douala.',
    price: 285000,
    original_price: 320000,
    images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400'],
    stock: 20,
    category: demoCategories[1],
    vendor: { shop_name: 'Froid Express', city: 'Douala', is_verified: true },
  },
  {
    id: '6',
    name: 'AirPods Pro 2ème génération',
    description: 'Écouteurs sans fil Apple avec réduction de bruit active.',
    price: 165000,
    original_price: 185000,
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400'],
    stock: 15,
    category: demoCategories[0],
    vendor: { shop_name: 'TechPro Douala', city: 'Douala', is_verified: true },
  },
  {
    id: '7',
    name: 'Réfrigérateur LG 400L No Frost',
    description: 'Réfrigérateur combiné avec congélateur, technologie No Frost.',
    price: 520000,
    original_price: 580000,
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400'],
    stock: 6,
    category: demoCategories[1],
    vendor: { shop_name: 'Électro Ménager Plus', city: 'Yaoundé', is_verified: true },
  },
  {
    id: '8',
    name: 'Laptop HP Pavilion 15',
    description: 'Ordinateur portable HP avec Intel Core i7, 16GB RAM, 512GB SSD.',
    price: 480000,
    original_price: 520000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
    stock: 10,
    category: demoCategories[2],
    vendor: { shop_name: 'Info Tech CM', city: 'Douala', is_verified: false },
  },
];

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
