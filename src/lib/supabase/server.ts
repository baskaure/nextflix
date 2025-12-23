import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Client Supabase pour les composants serveur
// Note: Pour les statistiques publiques, on utilise l'anon key
// Les policies RLS doivent permettre la lecture publique des agrégats
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase n'est pas configuré");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

