import { supabase } from "./supabaseClient";

export async function listProjects() {
  return supabase.from("projects").select("*").order("updated_at", { ascending: false });
}

export async function saveProject(userId, name, payload) {
  return supabase.from("projects").insert({ user_id: userId, name, payload }).select().single();
}

export async function deleteProject(id) {
  return supabase.from("projects").delete().eq("id", id);
}
