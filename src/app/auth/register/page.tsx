"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useUser();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      const success = await register(email, password, name || undefined);
      if (success) {
        router.push("/");
      } else {
        setError("Cet email est déjà utilisé ou une erreur est survenue.");
        setLoading(false);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-10">
          <Link href="/" className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition">
            Retour à l'accueil
          </Link>
          <span className="text-[1.6rem] font-semibold tracking-[0.2em] text-red-600">NEXTFLIX</span>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-5 pt-24 pb-16">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-8 shadow-xl shadow-black/60">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Inscription</h1>
            <p className="text-sm text-zinc-400">
              Crée ton compte pour donner ta voix et influencer les suites idéales.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-800/70 bg-red-950/30 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium text-zinc-400">
                Nom (optionnel)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Ton nom"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-zinc-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="ton@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium text-zinc-400">
                Mot de passe (min. 6 caractères)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <div className="border-t border-zinc-900 pt-4 text-center text-sm text-zinc-400">
            <p>
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="font-medium text-red-400 hover:text-red-300">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800/70 bg-black/50 p-3 text-[0.7rem] text-zinc-500">
            <p>
              <strong className="text-zinc-400">Note MVP :</strong> Les comptes sont stockés localement dans ton navigateur. En production, l'authentification sera sécurisée avec hash des mots de passe.
              </p>
            </div>
            <p className="text-center text-xs text-amber-400/90">
              Projet communautaire – non officiel
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

