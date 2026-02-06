'use client';

import { useState, useEffect } from 'react';
import { DynamicModel } from './types';

/**
 * Hook to fetch models from /api/models.
 * Caches in memory for the lifetime of the component.
 */
export function useModels(category?: 'video' | 'image') {
  const [models, setModels] = useState<DynamicModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchModels() {
      try {
        setIsLoading(true);
        const url = category ? `/api/models?category=${category}` : '/api/models';
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch models: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setModels(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { models, isLoading, error };
}
