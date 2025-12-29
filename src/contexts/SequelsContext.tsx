"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { FanSequel, FanSequelCreate } from "@/types/sequels";
import { useUser } from "./UserContext";

type SequelsContextType = {
  createSequel: (data: FanSequelCreate) => Promise<FanSequel | null>;
  signSequel: (sequelId: string) => Promise<boolean>;
  unsignSequel: (sequelId: string) => Promise<boolean>;
  hasSignedSequel: (sequelId: string) => boolean;
  getSequelsByUniverse: (universeId: string) => Promise<FanSequel[]>;
  getAllSequels: (sortBy?: "signatures" | "recent") => Promise<FanSequel[]>;
  getSequel: (sequelId: string) => Promise<FanSequel | null>;
};

const SequelsContext = createContext<SequelsContextType | undefined>(undefined);

export function SequelsProvider({ children }: { children: React.ReactNode }) {
  const { user, userData } = useUser();
  const [signedSequels, setSignedSequels] = useState<Set<string>>(new Set());

  const hasSignedSequel = useCallback(
    (sequelId: string) => {
      return signedSequels.has(sequelId);
    },
    [signedSequels]
  );

  const createSequel = async (data: FanSequelCreate): Promise<FanSequel | null> => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      const { data: sequel, error } = await supabase
        .from("fan_sequels")
        .insert({
          creator_id: user.id,
          universe_id: data.universeId,
          title: data.title,
          description: data.description,
          format: data.format,
          poster_url: data.posterUrl || null,
          backdrop_url: data.backdropUrl || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating sequel:", error);
        return null;
      }

      // Charger le créateur
      const { data: creator } = await supabase
        .from("user_profiles")
        .select("name")
        .eq("id", sequel.creator_id)
        .single();

      return {
        id: sequel.id,
        creatorId: sequel.creator_id,
        creatorName: creator?.name || undefined,
        universeId: sequel.universe_id,
        title: sequel.title,
        description: sequel.description,
        format: sequel.format,
        posterUrl: sequel.poster_url || undefined,
        backdropUrl: sequel.backdrop_url || undefined,
        status: sequel.status,
        signatureCount: 0,
        hasSigned: false,
        createdAt: sequel.created_at,
        updatedAt: sequel.updated_at,
      };
    } catch (error) {
      console.error("Error creating sequel:", error);
      return null;
    }
  };

  const signSequel = async (sequelId: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from("sequel_signatures").insert({
        user_id: user.id,
        sequel_id: sequelId,
      });

      if (error) {
        console.error("Error signing sequel:", error);
        return false;
      }

      setSignedSequels((prev) => new Set(prev).add(sequelId));
      return true;
    } catch (error) {
      console.error("Error signing sequel:", error);
      return false;
    }
  };

  const unsignSequel = async (sequelId: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("sequel_signatures")
        .delete()
        .eq("user_id", user.id)
        .eq("sequel_id", sequelId);

      if (error) {
        console.error("Error unsigning sequel:", error);
        return false;
      }

      setSignedSequels((prev) => {
        const next = new Set(prev);
        next.delete(sequelId);
        return next;
      });
      return true;
    } catch (error) {
      console.error("Error unsigning sequel:", error);
      return false;
    }
  };

  const getSequelsByUniverse = async (universeId: string): Promise<FanSequel[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const { data: sequels, error } = await supabase
        .from("fan_sequels")
        .select("*")
        .eq("universe_id", universeId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sequels:", error);
        return [];
      }

      const sequelIds = sequels.map((s) => s.id);
      const { data: signatures } = await supabase
        .from("sequel_signatures")
        .select("sequel_id")
        .in("sequel_id", sequelIds);

      const signatureCounts = new Map<string, number>();
      signatures?.forEach((sig) => {
        signatureCounts.set(sig.sequel_id, (signatureCounts.get(sig.sequel_id) || 0) + 1);
      });

      const userSignedIds = new Set(
        user
          ? (
              await supabase
                .from("sequel_signatures")
                .select("sequel_id")
                .eq("user_id", user.id)
                .in("sequel_id", sequelIds)
            ).data?.map((s) => s.sequel_id) || []
          : []
      );

      const creatorIds = [...new Set(sequels.map((s) => s.creator_id))];
      const { data: creators } = await supabase
        .from("user_profiles")
        .select("id, name")
        .in("id", creatorIds);

      const creatorMap = new Map(creators?.map((c) => [c.id, c.name]) || []);

      return sequels.map((sequel) => ({
        id: sequel.id,
        creatorId: sequel.creator_id,
        creatorName: creatorMap.get(sequel.creator_id) || undefined,
        universeId: sequel.universe_id,
        title: sequel.title,
        description: sequel.description,
        format: sequel.format,
        posterUrl: sequel.poster_url || undefined,
        backdropUrl: sequel.backdrop_url || undefined,
        status: sequel.status,
        signatureCount: signatureCounts.get(sequel.id) || 0,
        hasSigned: userSignedIds.has(sequel.id),
        createdAt: sequel.created_at,
        updatedAt: sequel.updated_at,
      }));
    } catch (error) {
      console.error("Error fetching sequels:", error);
      return [];
    }
  };

  const getAllSequels = async (sortBy: "signatures" | "recent" = "signatures"): Promise<FanSequel[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const { data: sequels, error } = await supabase
        .from("fan_sequels")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sequels:", error);
        return [];
      }

      const sequelIds = sequels.map((s) => s.id);
      const { data: signatures } = await supabase
        .from("sequel_signatures")
        .select("sequel_id")
        .in("sequel_id", sequelIds);

      const signatureCounts = new Map<string, number>();
      signatures?.forEach((sig) => {
        signatureCounts.set(sig.sequel_id, (signatureCounts.get(sig.sequel_id) || 0) + 1);
      });

      const userSignedIds = new Set(
        user
          ? (
              await supabase
                .from("sequel_signatures")
                .select("sequel_id")
                .eq("user_id", user.id)
                .in("sequel_id", sequelIds)
            ).data?.map((s) => s.sequel_id) || []
          : []
      );

      const creatorIds = [...new Set(sequels.map((s) => s.creator_id))];
      const { data: creators } = await supabase
        .from("user_profiles")
        .select("id, name")
        .in("id", creatorIds);

      const creatorMap = new Map(creators?.map((c) => [c.id, c.name]) || []);

      const mapped = sequels.map((sequel) => ({
        id: sequel.id,
        creatorId: sequel.creator_id,
        creatorName: creatorMap.get(sequel.creator_id) || undefined,
        universeId: sequel.universe_id,
        title: sequel.title,
        description: sequel.description,
        format: sequel.format,
        posterUrl: sequel.poster_url || undefined,
        backdropUrl: sequel.backdrop_url || undefined,
        status: sequel.status,
        signatureCount: signatureCounts.get(sequel.id) || 0,
        hasSigned: userSignedIds.has(sequel.id),
        createdAt: sequel.created_at,
        updatedAt: sequel.updated_at,
      }));

      if (sortBy === "signatures") {
        return mapped.sort((a, b) => b.signatureCount - a.signatureCount);
      }
      return mapped;
    } catch (error) {
      console.error("Error fetching sequels:", error);
      return [];
    }
  };

  const getSequel = async (sequelId: string): Promise<FanSequel | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: sequel, error } = await supabase
        .from("fan_sequels")
        .select("*")
        .eq("id", sequelId)
        .single();

      if (error || !sequel) {
        console.error("Error fetching sequel:", error);
        return null;
      }

      const { data: signatures } = await supabase
        .from("sequel_signatures")
        .select("user_id")
        .eq("sequel_id", sequelId);

      const signatureCount = signatures?.length || 0;
      const hasSigned =
        user && signatures?.some((sig) => sig.user_id === user.id) ? true : false;

      const { data: creator } = await supabase
        .from("user_profiles")
        .select("name")
        .eq("id", sequel.creator_id)
        .single();

      return {
        id: sequel.id,
        creatorId: sequel.creator_id,
        creatorName: creator?.name || undefined,
        universeId: sequel.universe_id,
        title: sequel.title,
        description: sequel.description,
        format: sequel.format,
        posterUrl: sequel.poster_url || undefined,
        backdropUrl: sequel.backdrop_url || undefined,
        status: sequel.status,
        signatureCount,
        hasSigned,
        createdAt: sequel.created_at,
        updatedAt: sequel.updated_at,
      };
    } catch (error) {
      console.error("Error fetching sequel:", error);
      return null;
    }
  };

  return (
    <SequelsContext.Provider
      value={{
        createSequel,
        signSequel,
        unsignSequel,
        hasSignedSequel,
        getSequelsByUniverse,
        getAllSequels,
        getSequel,
      }}
    >
      {children}
    </SequelsContext.Provider>
  );
}

export function useSequels() {
  const context = useContext(SequelsContext);
  if (context === undefined) {
    throw new Error("useSequels must be used within a SequelsProvider");
  }
  return context;
}

