'use client';

import { create } from 'zustand';
import { Generation, StoreState } from './types';

export const useStore = create<StoreState>((set) => ({
  generations: [],
  addGeneration: (gen: Generation) =>
    set((state) => ({ generations: [gen, ...state.generations] })),
  updateGeneration: (id: string, updates: Partial<Generation>) =>
    set((state) => ({
      generations: state.generations.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),
  removeGeneration: (id: string) =>
    set((state) => ({
      generations: state.generations.filter((g) => g.id !== id),
    })),
}));
