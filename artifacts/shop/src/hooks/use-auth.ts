import { useGetMe } from "@workspace/api-client-react";

export function useAuth() {
  const query = useGetMe();
  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.user,
    refetch: query.refetch,
  };
}
