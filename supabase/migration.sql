-- Migration SQL pour Nextflix MVP
-- À exécuter dans Supabase SQL Editor si les colonnes Q4, Q5, Q6 n'existent pas encore

-- 1. Ajouter les colonnes Q4, Q5, Q6 à direction_verdicts (si elles n'existent pas)
ALTER TABLE public.direction_verdicts 
ADD COLUMN IF NOT EXISTS q4_poster_verdict TEXT CHECK (q4_poster_verdict IN ('oui', 'non', 'neutre')),
ADD COLUMN IF NOT EXISTS q5_fidelity TEXT CHECK (q5_fidelity IN ('oui', 'non')),
ADD COLUMN IF NOT EXISTS q6_preferred_format TEXT CHECK (q6_preferred_format IN ('film', 'serie', 'anime', 'miniserie', 'aucun'));

-- 2. Mettre à jour les policies pour permettre la lecture publique des statistiques
-- (nécessaire pour le compteur de signatures et le baromètre)

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.signatures;
DROP POLICY IF EXISTS "Public can view signature counts" ON public.signatures;
DROP POLICY IF EXISTS "Users can view their own direction verdicts" ON public.direction_verdicts;
DROP POLICY IF EXISTS "Public can view direction verdicts" ON public.direction_verdicts;
DROP POLICY IF EXISTS "Users can view their own questionnaires" ON public.questionnaires;
DROP POLICY IF EXISTS "Public can view questionnaires" ON public.questionnaires;

-- Créer les nouvelles policies pour lecture publique (statistiques uniquement)
CREATE POLICY "Public can view signature counts"
  ON public.signatures FOR SELECT
  USING (true);

CREATE POLICY "Public can view direction verdicts"
  ON public.direction_verdicts FOR SELECT
  USING (true);

CREATE POLICY "Public can view questionnaires"
  ON public.questionnaires FOR SELECT
  USING (true);

-- Les policies d'insertion/update restent privées (utilisateurs ne peuvent modifier que leurs propres données)
-- Ces policies existent déjà dans le schéma initial

