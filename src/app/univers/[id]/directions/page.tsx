import DirectionsClient from "./DirectionsClient";
import { getUniverseById, type Universe } from "@/lib/universes";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type DirectionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DirectionsPage({ params }: DirectionsPageProps) {
  const { id } = await params;
  let posterOverride: string | undefined;
  let backdropOverride: string | undefined;
  let titleOverride: string | undefined;
  let directionsOverride:
    | {
        id: string;
        label: string;
        format: "film" | "serie" | "anime" | "miniserie";
        tagline: string;
        emotionalTag: string;
        backdropOverride?: string;
        titleOverride?: string;
      }[]
    | undefined;
  let universe: Universe | undefined = getUniverseById(id);

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
              "Univers de démonstration non encore configuré dans le baromètre. Ces directions illustrent le module de test créatif.",
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
          "Univers de démonstration non encore configuré dans le baromètre. Ces directions illustrent le module de test créatif.",
      };
    }
  }

  // Proposer 3 directions basées sur des films tendances TMDB pour varier les affichages
  if (TMDB_API_KEY) {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=fr`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const picks = (data?.results || []).slice(0, 3);
        if (picks.length > 0) {
          directionsOverride = picks.map((m: any, idx: number) => ({
            id: `tmdb-${m.id}-${idx}`,
            label: m.title || `Direction ${idx + 1}`,
            format: "film",
            tagline: m.overview || "Direction proposée basée sur une tendance TMDB.",
            emotionalTag: "Proposition inspirée TMDB",
            backdropOverride: m.backdrop_path
              ? `${TMDB_IMG_BASE}/w1280${m.backdrop_path}`
              : m.poster_path
              ? `${TMDB_IMG_BASE}/w780${m.poster_path}`
              : undefined,
            titleOverride: m.title || undefined,
          }));
        }
      }
    } catch {
      // ignore
    }
  }

  return (
    <DirectionsClient
      universe={universe}
      posterOverride={posterOverride}
      backdropOverride={backdropOverride}
      titleOverride={titleOverride}
      directionsOverride={directionsOverride}
    />
  );
}

