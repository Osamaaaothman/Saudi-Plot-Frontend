// Receives Stripe webhook events and keeps the `subscriptions` table in
// sync. Called directly by Stripe's servers (no Supabase user JWT), so
// verify_jwt is disabled and the Stripe-Signature header is checked
// manually instead (Stripe's documented HMAC-SHA256 scheme).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PRICE_TO_TIER: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_BASIC") ?? ""]: "basic",
  [Deno.env.get("STRIPE_PRICE_PRO") ?? ""]: "pro",
  [Deno.env.get("STRIPE_PRICE_PREMIUM") ?? ""]: "premium",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=") as [string, string]));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

async function upsertFromSubscriptionId(subscriptionId: string, fallbackUserId?: string) {
  const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const subscription = await subRes.json();
  if (!subRes.ok) return;

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const tier = PRICE_TO_TIER[priceId];
  const userId = fallbackUserId || subscription.metadata?.user_id;
  if (!userId || !tier) return;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      tier,
      status: subscription.status,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

Deno.serve(async (req) => {
  const payload = await req.text();
  const signatureHeader = req.headers.get("stripe-signature");

  if (!STRIPE_WEBHOOK_SECRET || !signatureHeader || !(await verifyStripeSignature(payload, signatureHeader, STRIPE_WEBHOOK_SECRET))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        await upsertFromSubscriptionId(session.subscription, session.client_reference_id ?? session.metadata?.user_id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await upsertFromSubscriptionId(subscription.id);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
