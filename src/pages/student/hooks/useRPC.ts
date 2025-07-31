// src/pages/student/hooks/useRPC.ts
import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/utility";

export const useRPC = <T = any>(
  functionName: string,
  params?: Record<string, any>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    if (options?.enabled === false) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const { data: result, error: rpcError } = await supabaseClient.rpc(
        functionName,
        params
      );
      
      if (rpcError) throw rpcError;
      
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      setError(err as Error);
      options?.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [functionName, JSON.stringify(params), options?.enabled]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
};