import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

export async function GET(req: Request) {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB_API_KEY manquante" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  const endpoint = query
    ? `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=fr&include_adult=false`
    : `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=fr`;

  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Erreur TMDB", status: res.status }, { status: 502 });
  }

  const data = await res.json();
  const results = data?.results || [];

  const items = results.map((r: any) => ({
    tmdbId: r.id,
    title: r.title,
    overview: r.overview,
    releaseDate: r.release_date,
    posterUrl: r.poster_path ? `${TMDB_IMG_BASE}/w500${r.poster_path}` : null,
    backdropUrl: r.backdrop_path ? `${TMDB_IMG_BASE}/w780${r.backdrop_path}` : null,
    popularity: r.popularity,
    voteAverage: r.vote_average,
  }));

  return NextResponse.json({ items });
}


