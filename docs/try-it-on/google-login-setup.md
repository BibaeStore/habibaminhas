# Google Login Setup — Step-by-Step (What YOU Do)
**For:** Phase 8 Virtual Try Room
**Created:** 11 June 2026
**Who does this:** Habiba Minhas (owner) — these are dashboard steps, no coding
**Time needed:** ~15–20 minutes

---

## ⚠️ Read This First — Important Reassurance

This is **Google Sign-In (OAuth)** — it lets customers log in with their Gmail.

- It is **100% FREE.**
- It does **NOT** ask for a credit card or billing.
- It is **completely different** from Google Cloud billing / Vertex AI (the thing that kept rejecting your card).
- Creating these login credentials will **never charge you anything.**

You are only telling Google "allow my website to use Gmail as a login button." That's free forever.

---

## The Big Picture (3 Steps)

```
STEP 1 (Supabase)  → Copy your "Callback URL"
STEP 2 (Google)    → Create login credentials, paste the Callback URL, copy Client ID + Secret
STEP 3 (Supabase)  → Paste Client ID + Secret, turn Google ON
```

Do them in this order so you don't have to go back and forth.

---

## STEP 1 — Get Your Callback URL (Supabase)

1. Go to **https://supabase.com** → log in → open your **Habiba Minhas** project.
2. Left menu → **Authentication**.
3. Click **Sign In / Providers** (or **Providers**).
4. Find **Google** in the list and click it.
5. You will see a field called **"Callback URL (for OAuth)"**. It looks like:
   ```
   https://ftrwdknlckzcwbibdicu.supabase.co/auth/v1/callback
   ```
6. **Copy this URL.** Keep it — you need it in Step 2. (Leave this tab open.)

---

## STEP 2 — Create Google Login Credentials (Google Cloud Console)

> This is the part that feels technical, but it's just filling forms. No payment anywhere.

### 2a. Open the Console
1. Go to **https://console.cloud.google.com**
2. Log in with the Gmail you want to own this (e.g. your business Gmail).
3. At the top, create a project (or pick one): click the project dropdown → **New Project** → name it **Habiba Minhas** → **Create**. Wait a few seconds, then select it.

### 2b. Set Up the Consent Screen (one-time)
This is what customers see when they click "Sign in with Google."

1. Left menu → **APIs & Services** → **OAuth consent screen**.
2. Choose **External** → **Create**.
3. Fill the required fields:
   - **App name:** Habiba Minhas
   - **User support email:** your email
   - **Developer contact email:** your email
   - (Logo and the rest are optional — skip.)
4. Click **Save and Continue**.
5. **Scopes** page → just click **Save and Continue** (the default email + profile is enough).
6. **Test users** page → click **Save and Continue** (skip for now).
7. Back on the summary → click **Publish App** → confirm.
   - ✅ For basic email/profile login, **no Google verification is required.** Publishing just means any Gmail user can log in (not only test users).

### 2c. Create the OAuth Client ID
1. Left menu → **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** (top) → **OAuth client ID**.
3. **Application type:** **Web application**.
4. **Name:** Habiba Minhas Web
5. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   - `https://habibaminhas.com`
   - `http://localhost:3000` (for testing on your computer)
6. Under **Authorized redirect URIs**, click **+ Add URI** and paste the **Callback URL from Step 1**:
   - `https://ftrwdknlckzcwbibdicu.supabase.co/auth/v1/callback`
7. Click **Create**.
8. A popup shows your **Client ID** and **Client Secret**.
   - **Copy both.** (You can also download them.) Keep them safe — treat the secret like a password.

---

## STEP 3 — Turn Google ON in Supabase

1. Go back to the Supabase tab (Authentication → Providers → Google from Step 1).
2. Toggle **Google** to **Enabled**.
3. Paste your **Client ID** into the "Client ID" field.
4. Paste your **Client Secret** into the "Client Secret" field.
5. Click **Save**.

### Also set allowed redirect URLs (so login returns to your site)
1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://habibaminhas.com`
3. Under **Redirect URLs**, click add and include:
   - `https://habibaminhas.com/**`
   - `http://localhost:3000/**` (for testing)
4. **Save.**

---

## ✅ Done — What Happens Next

Once you've finished all three steps, tell me **"Google login is set up."**

Then **I** handle the code side (your job is done):
- Add the `app/auth/callback/route.ts` route that catches the return from Google.
- Add the "Sign in with Google" button + logic in the try-on modal.
- Wire the session check into the API so limits work per Gmail account.

---

## Quick Reference — What You Copied

| Item | From | Goes To |
|------|------|---------|
| Callback URL | Supabase (Step 1) | Google "Authorized redirect URIs" (Step 2c) |
| Client ID | Google (Step 2c) | Supabase Google provider (Step 3) |
| Client Secret | Google (Step 2c) | Supabase Google provider (Step 3) |

---

## If You Get Stuck

- **"redirect_uri_mismatch" error during login** → the Callback URL in Google (Step 2c #6) doesn't exactly match Supabase's. Re-copy it, no trailing spaces.
- **Can't find "Publish App"** → it's on the OAuth consent screen summary page. Until published, only "test users" you add can log in.
- **It asks me to verify the app / submit for review** → only happens for *sensitive* scopes. For basic email + profile (what we use), you can ignore/skip — publishing is enough.
- **Anywhere it asks for a payment card** → STOP. Basic OAuth never needs one. You may be on the wrong screen (Billing instead of Credentials). We do not enable billing.
