import { supabase } from "./supabaseClient";

export async function listProjects() {
  return supabase.from("projects").select("*").order("updated_at", { ascending: false });
}

// Reads the caller's current project count and their tier's limit (via the
// my_project_limit() RPC, which is scoped server-side to auth.uid() — see
// the enforce_project_limit_by_tier migration). limit is null = unlimited.
export async function getProjectUsage() {
  const [{ count, error: countError }, { data: limit, error: limitError }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.rpc("my_project_limit"),
  ]);
  const error = countError || limitError;
  if (error) return { error: error.message };
  return { used: count ?? 0, limit };
}

export async function saveProject(userId, name, payload) {
  return supabase.from("projects").insert({ user_id: userId, name, payload }).select().single();
}

export async function deleteProject(id) {
  return supabase.from("projects").delete().eq("id", id);
}
