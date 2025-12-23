import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

export async function GET(req: Request) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante côté serveur." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!title) {
    return NextResponse.json(
      { error: "Paramètre 'title' requis." },
      { status: 400 }
    );
  }

  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      title
    )}&language=fr&include_adult=false${year ? `&year=${year}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB", status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const result = data?.results?.[0];

    if (!result) {
      return NextResponse.json(
        { error: "Aucun résultat pour ce titre." },
        { status: 404 }
      );
    }

    const posterUrl = result.poster_path
      ? `${TMDB_IMG_BASE}/w500${result.poster_path}`
      : null;
    const backdropUrl = result.backdrop_path
      ? `${TMDB_IMG_BASE}/w780${result.backdrop_path}`
      : null;

    return NextResponse.json({
      tmdbId: result.id,
      title: result.title,
      originalTitle: result.original_title,
      overview: result.overview,
      releaseDate: result.release_date,
      posterUrl,
      backdropUrl,
      popularity: result.popularity,
      voteAverage: result.vote_average,
      voteCount: result.vote_count,
    });
  } catch (error) {
    console.error("TMDB API error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}


