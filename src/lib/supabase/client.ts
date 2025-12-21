import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Pour le développement, on crée un client avec des valeurs par défaut si les variables ne sont pas définies
// Cela évite que l'app plante, mais l'authentification ne fonctionnera pas
const defaultUrl = "https://placeholder.supabase.co";
const defaultKey = "placeholder-key";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase URL ou Anon Key manquants !\n" +
    "Crée un fichier .env.local à la racine du projet avec :\n" +
    "NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase\n" +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key\n\n" +
    "Voir SUPABASE_SETUP.md pour plus d'infos."
  );
}

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey
);

// Export pour vérifier si Supabase est configuré
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

