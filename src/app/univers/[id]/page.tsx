import { getUniverseById, type Universe } from "@/lib/universes";
import { getUniverseStatistics } from "@/lib/statistics";
import UniversePageClient from "./UniversePageClient";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type UniversePageProps = {
  // Avec Next.js 16, `params` est une Promise dans les composants serveur
  params: Promise<{ id: string }>;
};

export default async function UniversePage({ params }: UniversePageProps) {
  const { id } = await params;

  let universe: Universe | undefined = getUniverseById(id);
  let tmdbPoster: string | null = null;
  let tmdbBackdrop: string | null = null;
  let tmdbTitle: string | null = null;

  // Fallback doux pour éviter le blocage si l'ID n'est pas encore configuré
  const isFallback = !universe;
  if (!universe) {
    // Tenter de récupérer les infos TMDB si l'ID est numérique
    const tmdbId = Number(id);
    if (Number.isFinite(tmdbId) && TMDB_API_KEY) {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const movie = await res.json();
          tmdbTitle = movie?.title || null;
          tmdbPoster = movie?.poster_path
            ? `${TMDB_IMG_BASE}/w500${movie.poster_path}`
            : null;
          tmdbBackdrop = movie?.backdrop_path
            ? `${TMDB_IMG_BASE}/w1280${movie.backdrop_path}`
            : tmdbPoster;
          universe = {
            id,
            title: movie?.title || `Univers démo – ${id}`,
            support: 60,
            emotion: "Épique",
            description:
              movie?.overview ||
              "Univers de démonstration non encore configuré dans le baromètre. Cet écran illustre la fiche univers type.",
          };
        }
      } catch {
        // ignore, fallback demo
      }
    }
    if (!universe) {
      universe = {
        id,
        title: `Univers démo – ${id}`,
        support: 60,
        emotion: "Épique",
        description:
          "Univers de démonstration non encore configuré dans le baromètre. Cet écran illustre la fiche univers type.",
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
    <UniversePageClient
      universe={universe}
      isFallback={isFallback}
      signatureCount={statistics.signatureCount}
      posterOverride={tmdbPoster || undefined}
      backdropOverride={tmdbBackdrop || undefined}
      statsSupport={statistics.supportShare}
      titleOverride={tmdbTitle || undefined}
    />
  );
}

