import { getUniverseById, type Universe } from "@/lib/universes";
import { getUniverseStatistics } from "@/lib/statistics";
import BarometerClient from "./BarometerClient";

type BarometerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BarometerPage({ params }: BarometerPageProps) {
  const { id } = await params;

  let universe: Universe | undefined = getUniverseById(id);
  const isFallback = !universe;

  if (!universe) {
    universe = {
      id,
      title: `Univers démo – ${id}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Ces données sont purement illustratives.",
    };
  }

  // Récupérer les statistiques réelles
  let statistics;
  try {
    statistics = await getUniverseStatistics(id);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    // Fallback avec des valeurs par défaut
    statistics = {
      signatureCount: 0,
      essentialShare: 0,
      rejectRebootShare: 0,
      validatedDirectionShare: 0,
      preferredFormat: { film: 0, serie: 0, anime: 0, miniserie: 0, aucun: 0 },
      topRedLines: [],
      topNonNegotiables: [],
      dominantFeeling: null,
    };
  }

  return (
    <BarometerClient
      universe={universe}
      statistics={statistics}
      isFallback={isFallback}
    />
  );
}
