// Test minimal pour vérifier les commandes du vendeur
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mhbhzbgxyjqkokilxpfw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYmh6Ymd4eWpxa29raWx4cGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDkzNzMsImV4cCI6MjA4MzM4NTM3M30.8PhDnRAZiKkF7aH5Kn5X-yiyZeBNtbUb9bjeDoYYFmk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testVendorOrders() {
  console.log('=== TEST DES COMMANDES VENDEUR ===\n');
  
  try {
    // 1. Trouver le vendeur "Love Jean"
    console.log('1. RECHERCHE DU VENDEUR LOVE JEAN:');
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, user_id, shop_name')
      .eq('shop_name', 'Love Jean')
      .single();
    
    if (vendorError) {
      console.log('❌ Erreur recherche vendeur:', vendorError.message);
      return;
    }
    
    console.log(`✅ Vendeur trouvé: ${vendor.shop_name}`);
    console.log(`   Vendor ID: ${vendor.id}`);
    console.log(`   User ID: ${vendor.user_id}`);
    
    // 2. Chercher les commandes pour ce vendeur
    console.log('\n2. RECHERCHE DES COMMANDES:');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        vendor_id,
        quantity,
        total_price,
        product:products (
          name
        ),
        order:orders (
          order_number,
          created_at,
          status
        )
      `)
      .eq('vendor_id', vendor.id);
    
    if (itemsError) {
      console.log('❌ Erreur recherche commandes:', itemsError.message);
      return;
    }
    
    console.log(`✅ Commandes trouvées: ${orderItems?.length || 0}`);
    
    if (orderItems && orderItems.length > 0) {
      orderItems.forEach((item, index) => {
        console.log(`\n--- Commande ${index + 1} ---`);
        console.log(`Produit: ${item.product?.name || 'N/A'}`);
        console.log(`Quantité: ${item.quantity}`);
        console.log(`Montant: ${item.total_price} FCFA`);
        console.log(`Numéro: ${item.order?.order_number || 'N/A'}`);
        console.log(`Statut: ${item.order?.status || 'N/A'}`);
      });
    } else {
      console.log('❌ AUCUNE COMMANDE TROUVÉE pour ce vendeur');
      
      // 3. Vérifier s'il y a des order_items globalement
      console.log('\n3. VÉRIFICATION GLOBALE DES ORDER_ITEMS:');
      const { data: allItems, error: allError } = await supabase
        .from('order_items')
        .select('id, vendor_id, order_id');
      
      if (allError) {
        console.log('❌ Erreur vérification globale:', allError.message);
      } else {
        console.log(`Total order_items dans la base: ${allItems?.length || 0}`);
        if (allItems && allItems.length > 0) {
          console.log('Liste des vendor_id présents:');
          const vendorIds = [...new Set(allItems.map(item => item.vendor_id))];
          vendorIds.forEach(id => console.log(`   - ${id}`));
        }
      }
    }
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

testVendorOrders();