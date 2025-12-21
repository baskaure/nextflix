"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

export function Navbar() {
  const { isAuthenticated, user, logout, loading } = useUser();

  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[1.6rem] font-semibold tracking-[0.2em] text-red-600">
            NEXTFLIX
          </Link>
          <nav className="hidden items-center gap-5 text-[0.8rem] font-medium sm:flex">
            <Link href="/" className="text-white underline underline-offset-4">
              Accueil
            </Link>
            <button className="text-zinc-300 hover:text-white">Univers</button>
            <button className="text-zinc-300 hover:text-white">Baromètres</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-xs text-zinc-500">Chargement...</span>
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-xs text-zinc-400 sm:block">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800/70"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              Connexion
            </Link>
          )}
          <p className="hidden text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500 sm:block">
            Projet communautaire – non officiel
          </p>
        </div>
      </div>
    </header>
  );
}

