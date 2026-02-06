'use client';

import { create } from 'zustand';
import { Generation, StoreState } from './types';

export const useStore = create<StoreState>((set, get) => ({
  generations: [],
  isLoaded: false,

  // Load generations from the DB API
  loadGenerations: async (category?: 'video' | 'image') => {
    try {
      const url = category
        ? `/api/generations?category=${category}&limit=100`
        : '/api/generations?limit=100';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const dbGenerations: Generation[] = data.generations.map((g: any) => ({
        id: g.id,
        modelId: g.modelId,
        modelName: g.modelName,
        prompt: g.prompt,
        status: g.status,
        output: g.output,
        error: g.error || undefined,
        createdAt: g.createdAt,
        category: g.category,
        replicateId: g.replicateId || undefined,
      }));

      set((state) => {
        // Merge DB generations with any in-flight local ones
        const localInFlight = state.generations.filter(
          (g) => (g.status === 'starting' || g.status === 'processing') && !dbGenerations.find((dg) => dg.id === g.id)
        );
        return {
          generations: [...localInFlight, ...dbGenerations],
          isLoaded: true,
        };
      });
    } catch (err) {
      console.error('Failed to load generations:', err);
    }
  },

  addGeneration: (gen: Generation) =>
    set((state) => ({ generations: [gen, ...state.generations] })),

  updateGeneration: (id: string, updates: Partial<Generation>) =>
    set((state) => ({
      generations: state.generations.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),

  removeGeneration: async (id: string) => {
    // Remove from local state immediately
    set((state) => ({
      generations: state.generations.filter((g) => g.id !== id),
    }));
    // Also delete from DB
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete generation from DB:', err);
    }
  },
}));
