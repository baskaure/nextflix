import { getUniverseById, type Universe } from "@/lib/universes";
import { getUniverseStatistics } from "@/lib/statistics";
import BarometerClient from "./BarometerClient";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type BarometerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BarometerPage({ params }: BarometerPageProps) {
  const { id } = await params;

  let universe: Universe | undefined = getUniverseById(id);
  const isFallback = !universe;
  let titleOverride: string | undefined;
  let posterOverride: string | undefined;
  let backdropOverride: string | undefined;

  if (!universe) {
    const tmdbId = Number(id);
    if (Number.isFinite(tmdbId) && TMDB_API_KEY) {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const movie = await res.json();
          titleOverride = movie?.title || undefined;
          posterOverride = movie?.poster_path
            ? `${TMDB_IMG_BASE}/w500${movie.poster_path}`
            : undefined;
          backdropOverride = movie?.backdrop_path
            ? `${TMDB_IMG_BASE}/w1280${movie.backdrop_path}`
            : posterOverride;
          universe = {
            id,
            title: movie?.title || `Univers démo – ${id}`,
            support: 60,
            emotion: "Épique",
            description:
              movie?.overview ||
              "Univers de démonstration non encore configuré dans le baromètre. Ces données sont purement illustratives.",
          };
        }
      } catch {
        // ignore
      }
    }
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
      supportShare: 0,
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
      titleOverride={titleOverride}
      posterOverride={posterOverride}
      backdropOverride={backdropOverride}
    />
  );
}
