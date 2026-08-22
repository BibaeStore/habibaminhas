"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Runs a server action, refreshes the screen, and reports what happened.
 *
 * Every social page needs this identically, and the important detail is that it
 * invalidates **all** queries rather than only the calling page's. Approving a reel
 * changes the "waiting for you" count in the shared header, and publishing a photo changes
 * this week's progress — both of which live in a different component from the button that
 * was pressed. Scoping the invalidation to one key is how a page ends up showing a number
 * that contradicts the strip directly above it.
 */
export function useAct() {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  function act(
    fn: () => Promise<unknown>,
    message?: string | ((result: unknown) => string),
  ) {
    startTransition(async () => {
      try {
        const result = await fn();
        await queryClient.invalidateQueries();
        if (message) setNotice(typeof message === "function" ? message(result) : message);
      } catch (e) {
        setNotice((e as Error).message);
      }
    });
  }

  return { act, pending, notice, setNotice };
}
