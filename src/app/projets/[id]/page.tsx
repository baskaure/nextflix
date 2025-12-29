"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/contexts/ProjectsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import { getUniverseById } from "@/lib/universes";
import { placeholderPoster } from "@/lib/posters";

export default function ProjetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProject, signProject, unsignProject, contributeToProject } = useProjects();
  const { isAuthenticated } = useUser();
  const [project, setProject] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [signing, setSigning] = React.useState(false);
  const [contributing, setContributing] = React.useState(false);
  const [contributionAmount, setContributionAmount] = React.useState("");
  const [showContributionForm, setShowContributionForm] = React.useState(false);

  const projectId = params.id as string;

  React.useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const data = await getProject(projectId);
    setProject(data);
    setLoading(false);
  };

  const handleSign = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/projets/${projectId}`);
      return;
    }

    setSigning(true);
    if (project.hasSigned) {
      await unsignProject(projectId);
    } else {
      await signProject(projectId);
    }
    await loadProject();
    setSigning(false);
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/projets/${projectId}`);
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setContributing(true);
    const success = await contributeToProject({
      projectId,
      amount,
    });

    if (success) {
      setContributionAmount("");
      setShowContributionForm(false);
      await loadProject();
    }
    setContributing(false);
  };

  const formatType = (type: string) => {
    switch (type) {
      case "court-metrage":
        return "Court-métrage";
      case "film":
        return "Film";
      case "serie":
        return "Série";
      default:
        return type;
    }
  };

  const getFundingProgress = () => {
    if (!project?.fundingGoal) return null;
    const progress = (project.totalContributions / project.fundingGoal) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
          <div className="text-center text-zinc-400">Chargement...</div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-8 text-center">
            <p className="text-zinc-400">Projet introuvable.</p>
            <Link
              href="/projets"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Retour aux projets
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const universe = getUniverseById(project.universeId);
  const backdrop = project.backdropUrl || placeholderPoster;
  const fundingProgress = getFundingProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-6">
          <Link
            href="/projets"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            ← Retour aux projets
          </Link>
        </div>

        <div
          className="relative mb-6 h-96 overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)] sm:h-[28rem]"
          style={
            backdrop
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent 55%), radial-gradient(circle at top left, rgba(248,113,113,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(24,24,27,0.95), transparent 55%), url(${backdrop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!backdrop && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                  {formatType(project.projectType)}
                </span>
                <span className="text-sm text-zinc-300">
                  {project.signatureCount} signature{project.signatureCount > 1 ? "s" : ""}
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
            </div>
            <div className="text-sm text-zinc-200">
              <p>Univers : {universe?.title || project.universeId}</p>
              {project.creatorName && <p>Créé par {project.creatorName}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {project.fundingGoal && (
            <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60">
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Financement</h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Objectif : {project.fundingGoal}€</span>
                  <span className="font-semibold text-zinc-200">
                    {Math.round(project.totalContributions)}€ collectés
                  </span>
                </div>
              </div>
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${fundingProgress || 0}%` }}
                />
              </div>
              {fundingProgress !== null && (
                <p className="text-xs text-zinc-400">
                  {Math.round(fundingProgress)}% de l'objectif atteint
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-8 shadow-xl shadow-black/60">
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">Description</h2>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <div className="space-y-4 border-t border-zinc-900 pt-6">
              <button
                onClick={handleSign}
                disabled={signing}
                className={`w-full rounded-md px-6 py-3 text-sm font-semibold shadow-lg shadow-black/40 transition disabled:cursor-not-allowed disabled:shadow-none ${
                  project.hasSigned
                    ? "border border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800/70"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {signing
                  ? "Traitement..."
                  : project.hasSigned
                  ? "Retirer ma signature"
                  : "Signer ce projet"}
              </button>

              {project.fundingGoal && (
                <>
                  {!showContributionForm ? (
                    <button
                      onClick={() => setShowContributionForm(true)}
                      className="w-full rounded-md border border-amber-500/70 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20"
                    >
                      Contribuer au financement
                    </button>
                  ) : (
                    <form onSubmit={handleContribute} className="space-y-3">
                      <div>
                        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-zinc-400">
                          Montant (€)
                        </label>
                        <input
                          id="amount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          placeholder="Ex: 25"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowContributionForm(false);
                            setContributionAmount("");
                          }}
                          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-center text-sm font-medium text-zinc-200 transition hover:bg-zinc-800/70"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={contributing}
                          className="flex-1 rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
                        >
                          {contributing ? "Traitement..." : "Contribuer"}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Note: Le paiement sera traité via un système de paiement sécurisé (à
                        implémenter avec Stripe ou similaire).
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

