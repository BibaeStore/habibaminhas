import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/";
  const popup = searchParams.get("popup") === "1";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (popup) {
        // Popup mode: send a message to the parent window and close
        return new NextResponse(
          `<!DOCTYPE html><html><head><title>Signing in...</title></head><body>
<script>
  try {
    if (window.opener) {
      window.opener.postMessage("auth:success", window.location.origin);
      window.close();
    } else {
      window.location.href = "/";
    }
  } catch (e) {
    window.location.href = "/";
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:40px">Signing you in&hellip; you can close this window.</p>
</body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      // Redirect flow: go back to the page the user came from
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth_failed`);
}
