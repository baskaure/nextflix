"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSequels } from "@/contexts/SequelsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import { getUniverseById } from "@/lib/universes";
import type { Universe } from "@/lib/universes";
import { universesBySection } from "@/lib/universes";

export default function CreerSuitePage() {
  const router = useRouter();
  const { createSequel } = useSequels();
  const { isAuthenticated } = useUser();
  const [universeId, setUniverseId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [format, setFormat] = React.useState<"film" | "serie" | "anime" | "miniserie">("film");
  const [posterUrl, setPosterUrl] = React.useState("");
  const [backdropUrl, setBackdropUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/suites/creer");
    }
  }, [isAuthenticated, router]);

  const allUniverses: Universe[] = Object.values(universesBySection).flat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !description.trim() || !universeId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    const sequel = await createSequel({
      universeId,
      title: title.trim(),
      description: description.trim(),
      format,
      posterUrl: posterUrl.trim() || undefined,
      backdropUrl: backdropUrl.trim() || undefined,
    });

    if (sequel) {
      router.push(`/suites/${sequel.id}`);
    } else {
      setError("Une erreur est survenue lors de la création de la suite.");
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-6">
          <Link
            href="/suites"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            ← Retour aux suites
          </Link>
        </div>

        <div className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-8 shadow-xl shadow-black/60">
          <div>
            <h1 className="text-2xl font-semibold">Créer une suite</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Propose une suite que tu aimerais voir pour un univers existant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-800/70 bg-red-950/30 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="universe" className="text-sm font-medium text-zinc-400">
                Univers <span className="text-red-400">*</span>
              </label>
              <select
                id="universe"
                value={universeId}
                onChange={(e) => setUniverseId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="">Sélectionner un univers</option>
                {allUniverses.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-zinc-400">
                Titre de la suite <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Ex: No Game No Life – Saison 2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-zinc-400">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Décris la suite que tu aimerais voir..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="format" className="text-sm font-medium text-zinc-400">
                Format <span className="text-red-400">*</span>
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="film">Film</option>
                <option value="serie">Série</option>
                <option value="anime">Animé</option>
                <option value="miniserie">Mini-série</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="posterUrl" className="text-sm font-medium text-zinc-400">
                URL de l'affiche (optionnel)
              </label>
              <input
                id="posterUrl"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="backdropUrl" className="text-sm font-medium text-zinc-400">
                URL de l'image de fond (optionnel)
              </label>
              <input
                id="backdropUrl"
                type="url"
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <Link
                href="/suites"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-center text-sm font-medium text-zinc-200 transition hover:bg-zinc-800/70"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              >
                {loading ? "Création..." : "Créer la suite"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

