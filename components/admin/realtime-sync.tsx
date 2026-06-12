"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Which cache keys each table's changes affect
const TABLE_KEYS: Record<string, string[][]> = {
  orders:    [["orders"], ["order-stats"]],
  products:  [["products"]],
  customers: [["customers"], ["customer-stats"]],
};

/**
 * Push-driven cache freshness. When Supabase Realtime is enabled on a table
 * (Database → Replication), any INSERT/UPDATE/DELETE silently invalidates the
 * affected queries — TanStack refetches in the background without touching
 * loading state, so tables update in place: no spinner, no remount, search
 * and scroll untouched. Until Realtime is enabled this idles harmlessly and
 * the provider's 60s staleTime fallback keeps data fresh instead.
 */
export function RealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-realtime-sync");

    for (const table of Object.keys(TABLE_KEYS)) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          for (const queryKey of TABLE_KEYS[table]) {
            queryClient.invalidateQueries({ queryKey });
          }
        },
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
