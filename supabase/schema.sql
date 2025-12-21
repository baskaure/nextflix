-- Schéma de base de données pour Nextflix MVP

-- Table des utilisateurs (utilise Supabase Auth, cette table stocke les infos supplémentaires)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des signatures (réponses aux 3 questions rapides)
CREATE TABLE IF NOT EXISTS public.signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  q1_exists TEXT NOT NULL CHECK (q1_exists IN ('oui', 'non', 'mitige')),
  q2_intensity TEXT NOT NULL CHECK (q2_intensity IN ('curiosite', 'importante', 'essentielle')),
  q3_profile TEXT NOT NULL CHECK (q3_profile IN ('decouverte', 'regulier', 'longue-date')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, universe_id) -- 1 signature par utilisateur par univers
);

-- Table des verdicts sur les directions créatives
CREATE TABLE IF NOT EXISTS public.direction_verdicts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  direction_id TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('support', 'reject', 'wishlist', 'comment')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questionnaires "vrais fans"
CREATE TABLE IF NOT EXISTS public.questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  q7_red_lines TEXT[] NOT NULL,
  q8_non_negotiables TEXT[] NOT NULL,
  q9_feeling TEXT,
  q10_vision TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, universe_id) -- 1 questionnaire par utilisateur par univers
);

-- Table des favoris
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, universe_id) -- Pas de doublons
);

-- Table des alertes
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, universe_id) -- Pas de doublons
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_signatures_user_universe ON public.signatures(user_id, universe_id);
CREATE INDEX IF NOT EXISTS idx_direction_verdicts_user_universe ON public.direction_verdicts(user_id, universe_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_user_universe ON public.questionnaires(user_id, universe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);

-- RLS (Row Level Security) - Les utilisateurs ne peuvent voir/modifier que leurs propres données
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direction_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour signatures
CREATE POLICY "Users can view their own signatures"
  ON public.signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signatures"
  ON public.signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures"
  ON public.signatures FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour direction_verdicts
CREATE POLICY "Users can view their own direction verdicts"
  ON public.direction_verdicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own direction verdicts"
  ON public.direction_verdicts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour questionnaires
CREATE POLICY "Users can view their own questionnaires"
  ON public.questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires"
  ON public.questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaires"
  ON public.questionnaires FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour alerts
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

