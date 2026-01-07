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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { items, customerInfo, paymentMethod, paymentReference }: ManualOrderRequest = await req.json();

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

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    // Create order with pending_verification status
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending_verification', // Needs manual verification
        payment_reference: paymentReference.trim(),
        subtotal,
        total,
        currency: 'XAF',
        customer_name: customerInfo.name,
        customer_email: userEmail,
        customer_phone: customerInfo.phone,
        customer_whatsapp: customerInfo.whatsapp,
        delivery_address: customerInfo.address,
        delivery_city: customerInfo.city,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Erreur lors de la création de la commande");
    }

    // Get payment info based on method
    let paymentInfo = {};
    if (paymentMethod === 'orange_money') {
      paymentInfo = {
        method: 'Orange Money',
        verificationMessage: 'Votre paiement sera vérifié sous 24h. Vous recevrez une confirmation par SMS/WhatsApp.'
      };
    } else if (paymentMethod === 'mtn_momo') {
      paymentInfo = {
        method: 'MTN Mobile Money',
        verificationMessage: 'Votre paiement sera vérifié sous 24h. Vous recevrez une confirmation par SMS/WhatsApp.'
      };
    } else if (paymentMethod === 'binance') {
      paymentInfo = {
        method: 'Binance',
        verificationMessage: 'Votre paiement crypto sera vérifié sous 24h. Vous recevrez une confirmation par email/WhatsApp.'
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id,
      paymentInfo
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Manual order error:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
