
import { useState, useCallback } from 'react';

interface McpResponse<T = any> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface UseMcpReturn {
  loading: boolean;
  error: string | null;
  callTool: <T = any>(name: string, arguments_: Record<string, any>) => Promise<T | null>;
  listResources: <T = any>(type: string, query?: string) => Promise<T[] | null>;
}

const MCP_ENDPOINT = 'https://ngcfavdkmlfjvcqjqftj.supabase.co/functions/v1/mcp-tools';

export function useMcp(): UseMcpReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async <T = any>(
    method: string,
    params: Record<string, any>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(MCP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY2ZhdmRrbWxmanZjcWpxZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzY3NzEsImV4cCI6MjA1MDU1Mjc3MX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: McpResponse<T> = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result ?? null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro MCP:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const callTool = useCallback(async <T = any>(
    name: string,
    arguments_: Record<string, any>
  ): Promise<T | null> => {
    return makeRequest<T>('tools/call', {
      name,
      arguments: arguments_,
    });
  }, [makeRequest]);

  const listResources = useCallback(async <T = any>(
    type: string,
    query?: string
  ): Promise<T[] | null> => {
    const result = await makeRequest<{ resources: T[] }>('resources/list', {
      type,
      query,
    });
    return result?.resources ?? null;
  }, [makeRequest]);

  return {
    loading,
    error,
    callTool,
    listResources,
  };
}
