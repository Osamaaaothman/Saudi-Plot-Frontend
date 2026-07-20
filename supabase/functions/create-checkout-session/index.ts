// Creates a Stripe Checkout Session (subscription mode) for the signed-in
// user and returns its URL. The frontend (src/lib/stripe.js) redirects the
// browser there. Requires a valid Supabase user JWT (verify_jwt: true).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!STRIPE_SECRET_KEY) return json({ error: "stripe_not_configured" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing_auth" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return json({ error: "unauthorized" }, 401);
  const user = userData.user;

  let priceId: string | undefined;
  try {
    ({ priceId } = await req.json());
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (!priceId) return json({ error: "missing_price_id" }, 400);

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${SITE_URL}/projects?checkout=success`);
  params.set("cancel_url", `${SITE_URL}/#pricing`);
  params.set("client_reference_id", user.id);
  params.set("metadata[user_id]", user.id);
  if (existingSub?.stripe_customer_id) {
    params.set("customer", existingSub.stripe_customer_id);
  } else if (user.email) {
    params.set("customer_email", user.email);
  }

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await stripeRes.json();
  if (!stripeRes.ok) return json({ error: session.error?.message ?? "stripe_error" }, 502);

  return json({ url: session.url });
});
