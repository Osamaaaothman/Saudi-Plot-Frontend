import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

// session: undefined while the initial session hasn't resolved yet, null
// once resolved with nobody signed in, or the Supabase session object.
export const useAuthStore = create(() => ({
  session: undefined,
  loading: true,
}));

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ session, loading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, loading: false });
});

export function signUp(email, password, fullName) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

export function signOut() {
  return supabase.auth.signOut();
}
