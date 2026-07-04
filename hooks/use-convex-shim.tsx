"use client";

import { useEffect, useState } from "react";

export function useQuery(action: any, params?: any) {
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    // Shim for now
    setData([]);
  }, [action, JSON.stringify(params)]);

  return data;
}

export function useMutation(action: any) {
    return async (params: any) => {
        console.log("Mutation called:", action, params);
        return "temp-id";
    };
}

import { useSession } from "next-auth/react";

export function useConvexAuth() {
    const { status } = useSession();
    return {
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
    };
}
