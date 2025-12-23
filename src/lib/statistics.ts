import { createServerClient } from "./supabase/server";

export type UniverseStatistics = {
  signatureCount: number;
  supportShare: number; // % de soutien pondéré (voir calcul)
  rejectRebootShare: number; // % qui refusent un reboot (q7_redLines inclut "reboot")
  validatedDirectionShare: number; // % qui ont validé au moins une direction
  preferredFormat: {
    film: number;
    serie: number;
    anime: number;
    miniserie: number;
    aucun: number;
  };
  topRedLines: Array<{ label: string; count: number; percentage: number }>;
  topNonNegotiables: Array<{ label: string; count: number; percentage: number }>;
  dominantFeeling: string | null;
};

const RED_LINE_LABELS: Record<string, string> = {
  reboot: "Reboot inutile",
  "tone-change": "Changement de ton",
  "characters-betrayal": "Trahison des personnages",
  "fanservice-empty": "Fan-service vide",
  "purely-commercial": "Suite purement commerciale",
  "rewrite-history": "Réécriture de l'histoire",
};

const NON_NEGOTIABLE_LABELS: Record<string, string> = {
  characters: "Personnages",
  tone: "Ton",
  continuity: "Continuité",
  universe: "Univers",
  "original-vision": "Vision originale",
};

export async function getUniverseStatistics(
  universeId: string
): Promise<UniverseStatistics> {
  const supabase = createServerClient();

  // Compter les signatures
  const { count: signatureCount } = await supabase
    .from("signatures")
    .select("*", { count: "exact", head: true })
    .eq("universe_id", universeId);

  // Calculer un soutien pondéré : existence (Q1) x intensité (Q2)
  // Q1 : oui=1, mitigé=0.5, non=0
  // Q2 : curiosité=0.33, importante=0.66, essentielle=1
  const { data: signatures } = await supabase
    .from("signatures")
    .select("q1_exists,q2_intensity")
    .eq("universe_id", universeId);

  let supportShare = 0;
  if (signatures && signatures.length > 0) {
    const weightQ1 = (v: string) => (v === "oui" ? 1 : v === "mitige" ? 0.5 : 0);
    const weightQ2 = (v: string) =>
      v === "essentielle" ? 1 : v === "importante" ? 0.66 : 0.33;

    const total = signatures.length;
    const sum = signatures.reduce((acc, s) => {
      const w1 = weightQ1(s.q1_exists as string);
      const w2 = weightQ2(s.q2_intensity as string);
      return acc + w1 * w2;
    }, 0);
    supportShare = Math.round((sum / total) * 100);
  }

  // Calculer le % qui refusent un reboot
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("q7_red_lines,q8_non_negotiables,q9_feeling")
    .eq("universe_id", universeId);

  const rejectRebootCount =
    questionnaires?.filter((q) =>
      q.q7_red_lines?.includes("reboot")
    ).length || 0;
  const rejectRebootShare =
    questionnaires && questionnaires.length > 0
      ? Math.round((rejectRebootCount / questionnaires.length) * 100)
      : 0;

  // Calculer le % qui ont validé au moins une direction
  const { data: directions } = await supabase
    .from("direction_verdicts")
    .select("verdict")
    .eq("universe_id", universeId);

  const validatedCount =
    directions?.filter((d) => d.verdict === "support").length || 0;
  const validatedDirectionShare =
    directions && directions.length > 0
      ? Math.round((validatedCount / directions.length) * 100)
      : 0;

  // Calculer le format préféré
  const { data: directionVerdicts } = await supabase
    .from("direction_verdicts")
    .select("q6_preferred_format")
    .eq("universe_id", universeId)
    .not("q6_preferred_format", "is", null);

  const formatCounts = {
    film: 0,
    serie: 0,
    anime: 0,
    miniserie: 0,
    aucun: 0,
  };

  directionVerdicts?.forEach((d) => {
    if (d.q6_preferred_format && d.q6_preferred_format in formatCounts) {
      formatCounts[d.q6_preferred_format as keyof typeof formatCounts]++;
    }
  });

  const totalFormats = directionVerdicts?.length || 0;
  const preferredFormat = {
    film: totalFormats > 0 ? Math.round((formatCounts.film / totalFormats) * 100) : 0,
    serie: totalFormats > 0 ? Math.round((formatCounts.serie / totalFormats) * 100) : 0,
    anime: totalFormats > 0 ? Math.round((formatCounts.anime / totalFormats) * 100) : 0,
    miniserie: totalFormats > 0 ? Math.round((formatCounts.miniserie / totalFormats) * 100) : 0,
    aucun: totalFormats > 0 ? Math.round((formatCounts.aucun / totalFormats) * 100) : 0,
  };

  // Top 3 lignes rouges
  const redLineCounts: Record<string, number> = {};
  questionnaires?.forEach((q) => {
    q.q7_red_lines?.forEach((line: string) => {
      redLineCounts[line] = (redLineCounts[line] || 0) + 1;
    });
  });

  const topRedLines = Object.entries(redLineCounts)
    .map(([key, count]) => ({
      label: RED_LINE_LABELS[key] || key,
      count,
      percentage:
        questionnaires && questionnaires.length > 0
          ? Math.round((count / questionnaires.length) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Top 3 non négociables
  const nonNegotiableCounts: Record<string, number> = {};
  questionnaires?.forEach((q) => {
    q.q8_non_negotiables?.forEach((item: string) => {
      nonNegotiableCounts[item] = (nonNegotiableCounts[item] || 0) + 1;
    });
  });

  const topNonNegotiables = Object.entries(nonNegotiableCounts)
    .map(([key, count]) => ({
      label: NON_NEGOTIABLE_LABELS[key] || key,
      count,
      percentage:
        questionnaires && questionnaires.length > 0
          ? Math.round((count / questionnaires.length) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Sentiment dominant
  const feelingCounts: Record<string, number> = {};
  questionnaires?.forEach((q) => {
    if (q.q9_feeling) {
      feelingCounts[q.q9_feeling] = (feelingCounts[q.q9_feeling] || 0) + 1;
    }
  });

  const dominantFeeling =
    Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const signatureCountValue =
    typeof signatureCount === "number"
      ? signatureCount
      : signatures?.length || 0;

  return {
    signatureCount: signatureCountValue,
    supportShare,
    rejectRebootShare,
    validatedDirectionShare,
    preferredFormat,
    topRedLines,
    topNonNegotiables,
    dominantFeeling,
  };
}

