import { supabase } from "./supabaseClient";

// Calls the create-checkout-session Supabase Edge Function, which holds the
// Stripe secret key server-side, and redirects the browser to the resulting
// Stripe Checkout URL. Returns { error } only when something went wrong —
// on success the browser navigates away before this promise's caller sees it.
export async function startCheckout(priceId, userId) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { priceId, userId },
  });
  if (error) return { error: error.message };
  if (!data?.url) return { error: "missing_checkout_url" };
  window.location.href = data.url;
  return { error: null };
}
