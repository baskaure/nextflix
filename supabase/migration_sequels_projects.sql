-- Migration pour ajouter les fonctionnalités de suites et projets de fans

-- Table des suites créées par les fans
CREATE TABLE IF NOT EXISTS public.fan_sequels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('film', 'serie', 'anime', 'miniserie')),
  poster_url TEXT,
  backdrop_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des signatures pour les suites
CREATE TABLE IF NOT EXISTS public.sequel_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sequel_id UUID REFERENCES public.fan_sequels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sequel_id) -- 1 signature par utilisateur par suite
);

-- Table des projets de fans (courts-métrages/films)
CREATE TABLE IF NOT EXISTS public.fan_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  universe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('court-metrage', 'film', 'serie')),
  poster_url TEXT,
  backdrop_url TEXT,
  funding_goal DECIMAL(10, 2), -- Objectif de financement en euros
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'funded', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des signatures pour les projets
CREATE TABLE IF NOT EXISTS public.project_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.fan_projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id) -- 1 signature par utilisateur par projet
);

-- Table des contributions financières (cagnotte)
CREATE TABLE IF NOT EXISTS public.project_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.fan_projects(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id TEXT, -- ID du paiement Stripe ou autre
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_fan_sequels_universe ON public.fan_sequels(universe_id);
CREATE INDEX IF NOT EXISTS idx_fan_sequels_creator ON public.fan_sequels(creator_id);
CREATE INDEX IF NOT EXISTS idx_fan_sequels_status ON public.fan_sequels(status);
CREATE INDEX IF NOT EXISTS idx_sequel_signatures_sequel ON public.sequel_signatures(sequel_id);
CREATE INDEX IF NOT EXISTS idx_sequel_signatures_user ON public.sequel_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_projects_universe ON public.fan_projects(universe_id);
CREATE INDEX IF NOT EXISTS idx_fan_projects_creator ON public.fan_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_fan_projects_status ON public.fan_projects(status);
CREATE INDEX IF NOT EXISTS idx_project_signatures_project ON public.project_signatures(project_id);
CREATE INDEX IF NOT EXISTS idx_project_signatures_user ON public.project_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_project_contributions_project ON public.project_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contributions_user ON public.project_contributions(user_id);

-- RLS (Row Level Security)
ALTER TABLE public.fan_sequels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequel_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contributions ENABLE ROW LEVEL SECURITY;

-- Policies pour fan_sequels
CREATE POLICY "Public can view fan sequels"
  ON public.fan_sequels FOR SELECT
  USING (true);

CREATE POLICY "Users can create fan sequels"
  ON public.fan_sequels FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own fan sequels"
  ON public.fan_sequels FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own fan sequels"
  ON public.fan_sequels FOR DELETE
  USING (auth.uid() = creator_id);

-- Policies pour sequel_signatures
CREATE POLICY "Public can view sequel signatures"
  ON public.sequel_signatures FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own sequel signatures"
  ON public.sequel_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sequel signatures"
  ON public.sequel_signatures FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour fan_projects
CREATE POLICY "Public can view fan projects"
  ON public.fan_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create fan projects"
  ON public.fan_projects FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own fan projects"
  ON public.fan_projects FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own fan projects"
  ON public.fan_projects FOR DELETE
  USING (auth.uid() = creator_id);

-- Policies pour project_signatures
CREATE POLICY "Public can view project signatures"
  ON public.project_signatures FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own project signatures"
  ON public.project_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project signatures"
  ON public.project_signatures FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour project_contributions
CREATE POLICY "Users can view their own contributions"
  ON public.project_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view contribution totals for projects"
  ON public.project_contributions FOR SELECT
  USING (payment_status = 'completed');

CREATE POLICY "Users can insert their own contributions"
  ON public.project_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
  ON public.project_contributions FOR UPDATE
  USING (auth.uid() = user_id);

-- Fonction pour calculer le total des contributions d'un projet
CREATE OR REPLACE FUNCTION public.get_project_total_contributions(project_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) 
     FROM public.project_contributions 
     WHERE project_id = project_uuid 
     AND payment_status = 'completed'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour compter les signatures d'une suite
CREATE OR REPLACE FUNCTION public.get_sequel_signature_count(sequel_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT COUNT(*) 
     FROM public.sequel_signatures 
     WHERE sequel_id = sequel_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour compter les signatures d'un projet
CREATE OR REPLACE FUNCTION public.get_project_signature_count(project_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT COUNT(*) 
     FROM public.project_signatures 
     WHERE project_id = project_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

