# Pinterest — getting Standard access

**Status: this is the only thing blocking Pinterest publishing.** The code is finished and
proven; the app is not yet allowed to create pins in production.

---

## What is actually wrong

A real reel publish on **2026-08-14** reached Pinterest's API and was refused:

> Apps with Trial access may not create Pins in production `https://api.pinterest.com` —
> use API Sandbox `https://api-sandbox.pinterest.com` instead.

Pinterest apps start on **Trial access**. On Trial, every pin and board you create exists
only as a *sandbox entity visible to you alone* — it is not a real pin and nobody can see
it. Publishing for real requires **Standard access**, which is granted by a Pinterest
review.

Nothing in this repository can work around it. The OAuth connection, the board, the token
and the pin request are all already correct — the same run published fine to Instagram and
Facebook.

---

## What you need before you start

| Thing | Value |
|---|---|
| App ID | **1600536** |
| Pinterest account | @habibaminhas_official |
| Board pins go to | "Habiba Minhas" |
| Privacy policy URL | `https://habibaminhas.com/legal/privacy/` |
| Terms URL | `https://habibaminhas.com/legal/terms/` |
| Website | `https://habibaminhas.com` |

---

## The steps

### 1. Sign in to the developer portal

Go to **https://developers.pinterest.com** and sign in with the Pinterest account that owns
the app — the same one connected in the admin (@habibaminhas_official). Open **My apps** and
select app **1600536**.

### 2. Check your app details are current

The upgrade form asks you to confirm what was submitted for Trial access. Make sure:

- The **privacy policy link** is `https://habibaminhas.com/legal/privacy/` — not a
  placeholder. Pinterest checks that this loads.
- The **redirect URI** matches what the code sends. In production that is
  `https://habibaminhas.com/api/social/pinterest/callback`.
- The **use case description** describes what the app really does. A version you can paste
  is in the next section.

### 3. Record the demo video — the part people get stuck on

**A video is mandatory**, even though you are the only user of this app. Pinterest wants to
see the app completing an action using their API, with a correct OAuth flow and no sensitive
data being stored. A screen recording is fine; so is a terminal recording.

Record this sequence, roughly 60–90 seconds, no narration needed:

1. The admin at `/admin/social`, on **Platforms**, showing Pinterest **not** connected.
2. Click **Connect Pinterest** — show the real Pinterest OAuth consent screen, with the
   requested scopes visible.
3. Approve, and show the redirect back to the admin now reading
   *"@habibaminhas_official · pinning to Habiba Minhas"*.
4. Show **choosing a board** from the picker.
5. Show a pin being created and the resulting pin.

Step 5 is the awkward one: on Trial you cannot create a real pin, which is the very thing you
are trying to demonstrate. **Sandbox mode exists for exactly this** — see below.

### Sandbox mode, for the recording only

Pinterest's own refusal message points at `api-sandbox.pinterest.com`. The sandbox is
functionally identical to production; boards and pins created there are simply visible to
nobody. That is enough to film the feature working.

Add this to `.env.local` and restart the dev server (either name works):

```bash
PINTEREST_SANDBOX=true
# PINTEREST_USE_SANDBOX=true also works
```

The browser caches the connection status, so **hard-refresh the admin** (Ctrl + Shift + R)
after restarting or the banner will not appear even though the switch is on.

Note that disconnecting Pinterest also switches its **Photos** and **Reels** toggles off in
the platform registry, and reconnecting does *not* switch them back on. Turn them on again
before recording, or Post Now will not target Pinterest at all.

Then, **before recording, you must reconnect Pinterest.** Sandbox and production hold
separate data and separate tokens — your current token addresses production, and the
sandbox has never heard of it. So: Disconnect → Connect Pinterest → approve. That mints a
sandbox token, and the board picker will then show sandbox boards. There may be none, in
which case use **Create board** in the picker; that is a good thing to have on camera anyway.

While it is on, the Platforms tab shows a red banner saying nothing published is real. That
banner is the safeguard — it is the only thing distinguishing a sandbox pin from a real one,
since a sandbox pin succeeds and returns a normal-looking permalink.

**When the recording is done:**

1. Remove `PINTEREST_SANDBOX` from `.env.local`
2. Restart the dev server
3. **Disconnect and reconnect Pinterest again** — otherwise the app is left holding a
   sandbox token and every real publish will fail
4. Re-select the production board

The red banner disappearing is your confirmation you are back on the real API.

### 4. Submit the upgrade

On the app card in **My apps**, click **Upgrade**. Confirm the app information, upload the
video, and submit.

### 5. Wait

Reviews are currently slow — developers report **two to four weeks**, sometimes longer, and
the status simply reads *"Upgrade to Standard access pending"* throughout. That is normal at
the moment and does not mean anything is wrong.

If it passes a month with no movement, post on the Pinterest Business Community developer
forum with your app ID. That is where Pinterest staff actually respond, and threads there
regularly get unstuck that way.

### 6. When it is approved — do nothing

No code change, no redeploy, no reconnect. The same requests that are being refused today
will simply start succeeding. Pinterest will appear alongside Facebook and Instagram in the
Published tab automatically.

---

## A use-case description you can paste

> Habiba Minhas Clothing (SMC-Private) Limited operates the e-commerce store
> habibaminhas.com, selling handcrafted Pakistani stitched suits. This app is used solely by
> our own business, for our own Pinterest business account, to publish our own product
> photography and short videos to our own board.
>
> It is a first-party, single-account integration. There is no third-party access, no user
> sign-up, and no end users other than ourselves. We use the API to create image and video
> pins for products already listed on our website, each linking back to that product's page.
>
> We store only the OAuth access and refresh tokens issued to our own account, in our own
> database, used exclusively to publish on our own behalf. We do not collect, store or
> process any Pinterest user's personal data, and we do not read or store data belonging to
> any other Pinterest account.
>
> Scopes requested: `pins:read`, `pins:write`, `boards:read`, `boards:write`,
> `user_accounts:read` — the minimum required to select a board and publish a pin.

---

## Meanwhile

Post Now and Approve keep working normally for Instagram and Facebook. Each run also records
a Pinterest failure on the row, with Pinterest's exact message.

If those failure rows become annoying, switch Pinterest off for photo and video in the
platform registry and switch it back on the day approval lands:

```sql
-- pause Pinterest until Standard access is granted
update social_platforms
set photo_enabled = false, video_enabled = false, updated_at = now()
where key = 'pinterest';
```

Nothing else needs changing, and the connection and board selection are untouched by this.

---

Related: [`README.md`](./README.md) · [`TRACKER.md`](./TRACKER.md) ·
[`06-TIKTOK.md`](./06-TIKTOK.md)
