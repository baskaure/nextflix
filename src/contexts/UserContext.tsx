"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User, UserData, SignatureData, DirectionVerdict, QuestionnaireData } from "@/types/user";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type UserContextType = {
  user: User | null;
  userData: UserData;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addSignature: (data: SignatureData) => Promise<void>;
  addDirectionVerdict: (data: DirectionVerdict) => Promise<void>;
  addQuestionnaire: (data: QuestionnaireData) => Promise<void>;
  toggleFavorite: (universeId: string) => Promise<void>;
  toggleAlert: (universeId: string) => Promise<void>;
  hasSigned: (universeId: string) => boolean;
  hasAnsweredDirections: (universeId: string) => boolean;
  hasAnsweredQuestionnaire: (universeId: string) => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    signatures: [],
    directions: [],
    questionnaires: [],
    favorites: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Charger l'utilisateur et ses données au démarrage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase n'est pas configuré. L'authentification ne fonctionnera pas.");
      setLoading(false);
      return;
    }

    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setUserData({
          signatures: [],
          directions: [],
          questionnaires: [],
          favorites: [],
          alerts: [],
        });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Charger le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError);
      }

      const userProfile: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: profile?.name || supabaseUser.user_metadata?.name,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
      };

      setUser(userProfile);

      // Charger toutes les données utilisateur
      await loadUserData(supabaseUser.id);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Charger les signatures
      const { data: signatures } = await supabase
        .from("signatures")
        .select("*")
        .eq("user_id", userId);

      // Charger les verdicts de directions
      const { data: directions } = await supabase
        .from("direction_verdicts")
        .select("*")
        .eq("user_id", userId);

      // Charger les questionnaires
      const { data: questionnaires } = await supabase
        .from("questionnaires")
        .select("*")
        .eq("user_id", userId);

      // Charger les favoris
      const { data: favorites } = await supabase
        .from("favorites")
        .select("universe_id")
        .eq("user_id", userId);

      // Charger les alertes
      const { data: alerts } = await supabase
        .from("alerts")
        .select("universe_id")
        .eq("user_id", userId);

      setUserData({
        signatures:
          signatures?.map((s) => ({
            universeId: s.universe_id,
            q1_exists: s.q1_exists as "oui" | "non" | "mitige",
            q2_intensity: s.q2_intensity as "curiosite" | "importante" | "essentielle",
            q3_profile: s.q3_profile as "decouverte" | "regulier" | "longue-date",
            submittedAt: s.submitted_at,
          })) || [],
        directions:
          directions?.map((d) => ({
            universeId: d.universe_id,
            directionId: d.direction_id,
            verdict: d.verdict as "support" | "reject" | "wishlist" | "comment",
            q4_poster_verdict: d.q4_poster_verdict as "oui" | "non" | "neutre" | undefined,
            q5_fidelity: d.q5_fidelity as "oui" | "non" | undefined,
            q6_preferred_format: d.q6_preferred_format as "film" | "serie" | "anime" | "miniserie" | "aucun" | undefined,
            submittedAt: d.submitted_at,
          })) || [],
        questionnaires:
          questionnaires?.map((q) => ({
            universeId: q.universe_id,
            q7_redLines: q.q7_red_lines || [],
            q8_nonNegotiables: q.q8_non_negotiables || [],
            q9_feeling: q.q9_feeling || "",
            q10_vision: q.q10_vision || "",
            submittedAt: q.submitted_at,
          })) || [],
        favorites: favorites?.map((f) => f.universe_id) || [],
        alerts: alerts?.map((a) => a.universe_id) || [],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.error("Supabase n'est pas configuré. Impossible de se connecter.");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.error("Supabase n'est pas configuré. Impossible de s'inscrire.");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "",
          },
        },
      });

      if (error) {
        console.error("Register error:", error);
        return false;
      }

      if (data.user) {
        // Le profil sera créé automatiquement par le trigger
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData({
      signatures: [],
      directions: [],
      questionnaires: [],
      favorites: [],
      alerts: [],
    });
  };

  const addSignature = async (data: SignatureData) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("signatures").upsert(
        {
          user_id: user.id,
          universe_id: data.universeId,
          q1_exists: data.q1_exists,
          q2_intensity: data.q2_intensity,
          q3_profile: data.q3_profile,
        },
        {
          onConflict: "user_id,universe_id",
        }
      );

      if (error) {
        console.error("Error saving signature:", error);
        return;
      }

      // Recharger les données
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const addDirectionVerdict = async (data: DirectionVerdict) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("direction_verdicts").insert({
        user_id: user.id,
        universe_id: data.universeId,
        direction_id: data.directionId,
        verdict: data.verdict,
        q4_poster_verdict: data.q4_poster_verdict || null,
        q5_fidelity: data.q5_fidelity || null,
        q6_preferred_format: data.q6_preferred_format || null,
      });

      if (error) {
        console.error("Error saving direction verdict:", error);
        return;
      }

      // Recharger les données
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error saving direction verdict:", error);
    }
  };

  const addQuestionnaire = async (data: QuestionnaireData) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("questionnaires").upsert(
        {
          user_id: user.id,
          universe_id: data.universeId,
          q7_red_lines: data.q7_redLines,
          q8_non_negotiables: data.q8_nonNegotiables,
          q9_feeling: data.q9_feeling,
          q10_vision: data.q10_vision,
        },
        {
          onConflict: "user_id,universe_id",
        }
      );

      if (error) {
        console.error("Error saving questionnaire:", error);
        return;
      }

      // Recharger les données
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
    }
  };

  const toggleFavorite = async (universeId: string) => {
    if (!user) return;

    const isFavorite = userData.favorites.includes(universeId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("universe_id", universeId);

        if (error) {
          console.error("Error removing favorite:", error);
          return;
        }
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          universe_id: universeId,
        });

        if (error) {
          console.error("Error adding favorite:", error);
          return;
        }
      }

      // Recharger les données
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const toggleAlert = async (universeId: string) => {
    if (!user) return;

    const hasAlert = userData.alerts.includes(universeId);

    try {
      if (hasAlert) {
        const { error } = await supabase
          .from("alerts")
          .delete()
          .eq("user_id", user.id)
          .eq("universe_id", universeId);

        if (error) {
          console.error("Error removing alert:", error);
          return;
        }
      } else {
        const { error } = await supabase.from("alerts").insert({
          user_id: user.id,
          universe_id: universeId,
        });

        if (error) {
          console.error("Error adding alert:", error);
          return;
        }
      }

      // Recharger les données
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error toggling alert:", error);
    }
  };

  const hasSigned = (universeId: string) => {
    return userData.signatures.some((s) => s.universeId === universeId);
  };

  const hasAnsweredDirections = (universeId: string) => {
    return userData.directions.some((d) => d.universeId === universeId);
  };

  const hasAnsweredQuestionnaire = (universeId: string) => {
    return userData.questionnaires.some((q) => q.universeId === universeId);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        addSignature,
        addDirectionVerdict,
        addQuestionnaire,
        toggleFavorite,
        toggleAlert,
        hasSigned,
        hasAnsweredDirections,
        hasAnsweredQuestionnaire,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
