"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Runs on every page. When a page loads inside a popup window and the URL
 * contains a Supabase OAuth `?code=`, this component exchanges the code,
 * notifies the parent window, and closes the popup — regardless of which
 * URL Supabase chose to deliver the code to.
 */
export function PopupAuthHandler() {
  useEffect(() => {
    // Only act when we are inside a popup opened by another window
    if (!window.opener) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    // The /auth/callback route already handles codes delivered there server-side.
    // For every other page (e.g. the site root when Supabase falls back to the
    // Site URL), we handle it here client-side.
    if (window.location.pathname === "/auth/callback") return;

    const supabase = createClient();
    supabase.auth
      .exchangeCodeForSession(code)
      .then(() => {
        // Tell the parent window auth succeeded, then close the popup
        try {
          window.opener.postMessage("auth:success", window.location.origin);
        } catch {
          // Cross-origin opener — unlikely for same-site popup, safe to ignore
        }
        window.close();
      })
      .catch(() => {
        // Exchange failed — close popup so the parent's close-poll re-checks
        window.close();
      });
  }, []);

  return null;
}
