import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManualOrderRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customerInfo: {
    name: string;
    email?: string;
    phone: string;
    whatsapp?: string;
    address: string;
    city: string;
  };
  paymentMethod: 'orange_money' | 'mtn_momo' | 'binance';
  paymentReference: string; // Transaction ID entered by user
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { items, customerInfo, paymentMethod, paymentReference }: ManualOrderRequest = await req.json();

    console.log("Creating manual order for:", customerInfo.name);

    if (!items || items.length === 0) {
      throw new Error("Aucun article dans le panier");
    }

    if (!paymentReference || paymentReference.trim() === '') {
      throw new Error("La référence de transaction est requise");
    }

    // Get user if authenticated
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    let userEmail = customerInfo.email;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        userId = data.user.id;
        userEmail = data.user.email || customerInfo.email;
      }
    }

    // Calculate total and get vendor_id (from first item)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    // In this simplified version, we take the vendor_id of the first product
    // A more complex system would handle orders per vendor or sub-orders
    let vendorId = null;
    try {
      const { data: product } = await supabaseClient
        .from('products')
        .select('vendor_id')
        .eq('id', items[0].id)
        .single();
      vendorId = product?.vendor_id;
    } catch (e) {
      console.warn("Could not fetch vendor_id:", e);
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        vendor_id: vendorId,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending_verification',
        payment_reference: paymentReference.trim(),
        subtotal,
        total,
        currency: 'XAF',
        customer_name: customerInfo.name,
        customer_email: userEmail,
        customer_phone: customerInfo.phone,
        customer_whatsapp: customerInfo.whatsapp || null,
        delivery_address: customerInfo.address,
        delivery_city: customerInfo.city,
        items: items // Keep the JSON version for convenience
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error(`Erreur base de données: ${orderError.message}`);
    }

    // Also populate order_items table for better relational integrity
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.warn("Warning: Could not create order items:", itemsError);
      // We don't throw here to not block the order if main insert worked
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      message: "Commande créée avec succès"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Manual order error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Une erreur est survenue"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400, // Changed to 400 to be better caught by frontend
    });
  }
});
