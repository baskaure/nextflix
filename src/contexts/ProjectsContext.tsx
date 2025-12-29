"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  FanProject,
  FanProjectCreate,
  ProjectContributionCreate,
} from "@/types/projects";
import { useUser } from "./UserContext";

type ProjectsContextType = {
  createProject: (data: FanProjectCreate) => Promise<FanProject | null>;
  signProject: (projectId: string) => Promise<boolean>;
  unsignProject: (projectId: string) => Promise<boolean>;
  contributeToProject: (data: ProjectContributionCreate) => Promise<boolean>;
  hasSignedProject: (projectId: string) => boolean;
  getProjectsByUniverse: (universeId: string) => Promise<FanProject[]>;
  getAllProjects: (sortBy?: "signatures" | "funding" | "recent") => Promise<FanProject[]>;
  getProject: (projectId: string) => Promise<FanProject | null>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [signedProjects, setSignedProjects] = useState<Set<string>>(new Set());

  const hasSignedProject = useCallback(
    (projectId: string) => {
      return signedProjects.has(projectId);
    },
    [signedProjects]
  );

  const createProject = async (data: FanProjectCreate): Promise<FanProject | null> => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      const { data: project, error } = await supabase
        .from("fan_projects")
        .insert({
          creator_id: user.id,
          universe_id: data.universeId,
          title: data.title,
          description: data.description,
          project_type: data.projectType,
          poster_url: data.posterUrl || null,
          backdrop_url: data.backdropUrl || null,
          funding_goal: data.fundingGoal || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        return null;
      }

      const { data: creator } = await supabase
        .from("user_profiles")
        .select("name")
        .eq("id", project.creator_id)
        .single();

      return {
        id: project.id,
        creatorId: project.creator_id,
        creatorName: creator?.name || undefined,
        universeId: project.universe_id,
        title: project.title,
        description: project.description,
        projectType: project.project_type,
        posterUrl: project.poster_url || undefined,
        backdropUrl: project.backdrop_url || undefined,
        fundingGoal: project.funding_goal ? Number(project.funding_goal) : undefined,
        totalContributions: 0,
        signatureCount: 0,
        hasSigned: false,
        hasContributed: false,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  };

  const signProject = async (projectId: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from("project_signatures").insert({
        user_id: user.id,
        project_id: projectId,
      });

      if (error) {
        console.error("Error signing project:", error);
        return false;
      }

      setSignedProjects((prev) => new Set(prev).add(projectId));
      return true;
    } catch (error) {
      console.error("Error signing project:", error);
      return false;
    }
  };

  const unsignProject = async (projectId: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("project_signatures")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);

      if (error) {
        console.error("Error unsigning project:", error);
        return false;
      }

      setSignedProjects((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
      return true;
    } catch (error) {
      console.error("Error unsigning project:", error);
      return false;
    }
  };

  const contributeToProject = async (
    data: ProjectContributionCreate
  ): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) return false;

    try {
      // Pour l'instant, on enregistre juste la contribution avec un statut "pending"
      // Dans une vraie implémentation, on utiliserait Stripe ou un autre service de paiement
      const { error } = await supabase.from("project_contributions").insert({
        user_id: user.id,
        project_id: data.projectId,
        amount: data.amount,
        payment_status: "pending", // À remplacer par un vrai système de paiement
      });

      if (error) {
        console.error("Error contributing to project:", error);
        return false;
      }

      // Note: Dans une vraie implémentation, on devrait attendre la confirmation du paiement
      // avant de mettre à jour le statut à "completed"
      return true;
    } catch (error) {
      console.error("Error contributing to project:", error);
      return false;
    }
  };

  const getProjectsByUniverse = async (universeId: string): Promise<FanProject[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const { data: projects, error } = await supabase
        .from("fan_projects")
        .select("*")
        .eq("universe_id", universeId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return [];
      }

      return await enrichProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  const getAllProjects = async (
    sortBy: "signatures" | "funding" | "recent" = "signatures"
  ): Promise<FanProject[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const { data: projects, error } = await supabase
        .from("fan_projects")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return [];
      }

      const enriched = await enrichProjects(projects);

      if (sortBy === "signatures") {
        return enriched.sort((a, b) => b.signatureCount - a.signatureCount);
      } else if (sortBy === "funding") {
        return enriched.sort((a, b) => {
          const aProgress = a.fundingGoal ? (a.totalContributions / a.fundingGoal) * 100 : 0;
          const bProgress = b.fundingGoal ? (b.totalContributions / b.fundingGoal) * 100 : 0;
          return bProgress - aProgress;
        });
      }
      return enriched;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  const getProject = async (projectId: string): Promise<FanProject | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: project, error } = await supabase
        .from("fan_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error || !project) {
        console.error("Error fetching project:", error);
        return null;
      }

      const enriched = await enrichProjects([project]);
      return enriched[0] || null;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  };

  const enrichProjects = async (projects: any[]): Promise<FanProject[]> => {
    const projectIds = projects.map((p) => p.id);

    // Récupérer les signatures
    const { data: signatures } = await supabase
      .from("project_signatures")
      .select("project_id, user_id")
      .in("project_id", projectIds);

    const signatureCounts = new Map<string, number>();
    signatures?.forEach((sig) => {
      signatureCounts.set(sig.project_id, (signatureCounts.get(sig.project_id) || 0) + 1);
    });

    const userSignedIds = new Set(
      user
        ? (
            await supabase
              .from("project_signatures")
              .select("project_id")
              .eq("user_id", user.id)
              .in("project_id", projectIds)
          ).data?.map((s) => s.project_id) || []
        : []
    );

    // Récupérer les contributions
    const { data: contributions } = await supabase
      .from("project_contributions")
      .select("project_id, amount")
      .in("project_id", projectIds)
      .eq("payment_status", "completed");

    const contributionTotals = new Map<string, number>();
    contributions?.forEach((contrib) => {
      contributionTotals.set(
        contrib.project_id,
        (contributionTotals.get(contrib.project_id) || 0) + Number(contrib.amount)
      );
    });

    const userContributedIds = new Set(
      user
        ? (
            await supabase
              .from("project_contributions")
              .select("project_id")
              .eq("user_id", user.id)
              .eq("payment_status", "completed")
              .in("project_id", projectIds)
          ).data?.map((c) => c.project_id) || []
        : []
    );

    // Récupérer les créateurs
    const creatorIds = [...new Set(projects.map((p) => p.creator_id))];
    const { data: creators } = await supabase
      .from("user_profiles")
      .select("id, name")
      .in("id", creatorIds);

    const creatorMap = new Map(creators?.map((c) => [c.id, c.name]) || []);

    return projects.map((project) => ({
      id: project.id,
      creatorId: project.creator_id,
      creatorName: creatorMap.get(project.creator_id) || undefined,
      universeId: project.universe_id,
      title: project.title,
      description: project.description,
      projectType: project.project_type,
      posterUrl: project.poster_url || undefined,
      backdropUrl: project.backdrop_url || undefined,
      fundingGoal: project.funding_goal ? Number(project.funding_goal) : undefined,
      totalContributions: contributionTotals.get(project.id) || 0,
      signatureCount: signatureCounts.get(project.id) || 0,
      hasSigned: userSignedIds.has(project.id),
      hasContributed: userContributedIds.has(project.id),
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  };

  return (
    <ProjectsContext.Provider
      value={{
        createProject,
        signProject,
        unsignProject,
        contributeToProject,
        hasSignedProject,
        getProjectsByUniverse,
        getAllProjects,
        getProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

