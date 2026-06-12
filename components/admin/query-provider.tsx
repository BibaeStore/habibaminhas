"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AdminQueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures one client per browser session — survives admin page
  // navigation (layout persists) but is never shared across users/requests
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 60s fallback freshness until Supabase Realtime is enabled on
            // orders/products/customers (then this can become Infinity).
            // Revisits within 60s render purely from cache; older data still
            // renders instantly, then revalidates silently in the background
            // (isPending stays false — no spinner, no table remount)
            staleTime: 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
