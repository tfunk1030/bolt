import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

interface StorageHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setItem: (value: T) => Promise<void>;
  getItem: () => Promise<void>;
  removeItem: () => Promise<void>;
}

export function useStorage<T>(key: string, initialValue?: T): StorageHook<T> {
  const [data, setData] = useState<T | null>(initialValue || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setItem = useCallback(async (value: T) => {
    try {
      setLoading(true);
      setError(null);
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      setData(value);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save data');
    } finally {
      setLoading(false);
    }
  }, [key]);

  const getItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        setData(JSON.parse(value));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to retrieve data');
    } finally {
      setLoading(false);
    }
  }, [key]);

  const removeItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await SecureStore.deleteItemAsync(key);
      setData(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove data');
    } finally {
      setLoading(false);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    setItem,
    getItem,
    removeItem,
  };
}

export type { StorageHook };
