// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req: Request) => {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

        // Verify the signature
        let event
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                webhookSecret ?? '',
                undefined,
                cryptoProvider
            )
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message)
            return new Response(err.message, { status: 400 })
        }

        // Initialize Supabase Client
        // We use the service role key to bypass RLS policies for admin updates
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`🔔  Event received: ${event.type}`)

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object
                console.log(`💰 PaymentIntent succeeded: ${paymentIntent.id}`)

                // Update payment status in database
                const { error: updateError } = await supabase
                    .from('payments')
                    .update({
                        status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('transaction_id', paymentIntent.id)

                if (updateError) {
                    console.error('Error updating payment:', updateError)
                    return new Response('Database update failed', { status: 500 })
                }
                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object
                console.log(`❌ PaymentIntent failed: ${paymentIntent.id}`)

                const { error: updateError } = await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('transaction_id', paymentIntent.id)

                if (updateError) {
                    console.error('Error updating payment:', updateError)
                }
                break
            }

            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: any) {
        console.error(err)
        return new Response(err.message, { status: 500 })
    }
})
