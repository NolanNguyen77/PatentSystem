import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading and error states
 * Usage example:
 * 
 * const { execute, loading, error } = useAPI(titleAPI.create);
 * 
 * const handleCreate = async () => {
 *   const result = await execute(titleData);
 *   if (result.data) {
 *     // Success
 *   }
 * };
 */

interface UseAPIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAPI<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options?: UseAPIOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);

        if (result.error) {
          setError(result.error);
          options?.onError?.(result.error);
          return result;
        }

        setData(result.data);
        options?.onSuccess?.(result.data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return { error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for handling multiple API states
 * Useful for components that need to track multiple API calls independently
 */
export function useAPIState() {
  const [states, setStates] = useState<{
    [key: string]: {
      loading: boolean;
      error: string | null;
      data: any;
    };
  }>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loading },
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error },
    }));
  }, []);

  const setData = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], data },
    }));
  }, []);

  const getState = useCallback(
    (key: string) => {
      return (
        states[key] || {
          loading: false,
          error: null,
          data: null,
        }
      );
    },
    [states]
  );

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const newStates = { ...prev };
        delete newStates[key];
        return newStates;
      });
    } else {
      setStates({});
    }
  }, []);

  return {
    setLoading,
    setError,
    setData,
    getState,
    reset,
  };
}
