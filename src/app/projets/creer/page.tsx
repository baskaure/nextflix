"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/contexts/ProjectsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import type { Universe } from "@/lib/universes";
import { universesBySection } from "@/lib/universes";

export default function CreerProjetPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const { isAuthenticated } = useUser();
  const [universeId, setUniverseId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectType, setProjectType] = React.useState<"court-metrage" | "film" | "serie">("film");
  const [posterUrl, setPosterUrl] = React.useState("");
  const [backdropUrl, setBackdropUrl] = React.useState("");
  const [fundingGoal, setFundingGoal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/projets/creer");
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

    const project = await createProject({
      universeId,
      title: title.trim(),
      description: description.trim(),
      projectType,
      posterUrl: posterUrl.trim() || undefined,
      backdropUrl: backdropUrl.trim() || undefined,
      fundingGoal: fundingGoal ? parseFloat(fundingGoal) : undefined,
    });

    if (project) {
      router.push(`/projets/${project.id}`);
    } else {
      setError("Une erreur est survenue lors de la création du projet.");
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
            href="/projets"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            ← Retour aux projets
          </Link>
        </div>

        <div className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-8 shadow-xl shadow-black/60">
          <div>
            <h1 className="text-2xl font-semibold">Créer un projet</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Propose un court-métrage ou un film que tu vas réaliser
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
                Titre du projet <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Ex: No Game No Life – Fan Film"
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
                placeholder="Décris ton projet..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="projectType" className="text-sm font-medium text-zinc-400">
                Type de projet <span className="text-red-400">*</span>
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="court-metrage">Court-métrage</option>
                <option value="film">Film</option>
                <option value="serie">Série</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="fundingGoal" className="text-sm font-medium text-zinc-400">
                Objectif de financement (€) (optionnel)
              </label>
              <input
                id="fundingGoal"
                type="number"
                min="0"
                step="0.01"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Ex: 5000"
              />
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
                href="/projets"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-center text-sm font-medium text-zinc-200 transition hover:bg-zinc-800/70"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              >
                {loading ? "Création..." : "Créer le projet"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

