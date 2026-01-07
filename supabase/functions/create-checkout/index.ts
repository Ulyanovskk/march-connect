import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
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
    address: string;
    city: string;
  };
  paymentMethod: 'card' | 'paypal';
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
    const { items, customerInfo, paymentMethod }: CheckoutRequest = await req.json();

    if (!items || items.length === 0) {
      throw new Error("Aucun article dans le panier");
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

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending',
        subtotal,
        total,
        currency: 'XAF',
        customer_name: customerInfo.name,
        customer_email: userEmail,
        customer_phone: customerInfo.phone,
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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists in Stripe
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create line items for Stripe (convert XAF to cents equivalent)
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'xaf',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price), // XAF is a zero-decimal currency
      },
      quantity: item.quantity,
    }));

    // Create Checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-confirmation?order_id=${order.id}&status=success`,
      cancel_url: `${req.headers.get("origin")}/payment?status=cancelled`,
      metadata: {
        order_id: order.id,
      },
    };

    // Add PayPal if requested
    if (paymentMethod === 'paypal') {
      sessionConfig.payment_method_types = ['paypal'];
    } else {
      sessionConfig.payment_method_types = ['card'];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update order with payment reference
    await supabaseClient
      .from('orders')
      .update({ payment_reference: session.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
