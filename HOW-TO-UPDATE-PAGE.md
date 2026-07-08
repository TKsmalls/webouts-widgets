# Updating the onboarding page (no web team needed)

The live page loads its code from GitHub via the jsDelivr CDN. The Bricks page
holds only a tiny loader (`onboarding-loader.html`), pasted once. To change the
page, you change the code in GitHub — that's it.

## The pieces
- **Repo:** `TKsmalls/webouts-widgets` (public)
- **File:** `onboarding.js` (the whole widget: styles + form + logic)
- **Live URL the page loads:** `https://cdn.jsdelivr.net/gh/TKsmalls/webouts-widgets@main/onboarding.js`
- **Bricks loader (one-time paste):** `onboarding-loader.html`

## To push an update
1. Edit `onboarding.js` (locally, or on github.com directly, or just ask Claude).
2. Commit it to the `main` branch.
3. **Purge the CDN cache** so the change goes live within seconds:
   ```
   curl "https://purge.jsdelivr.net/gh/TKsmalls/webouts-widgets@main/onboarding.js"
   ```
4. Hard-refresh the page (Cmd/Ctrl+Shift+R) to confirm.

Without the purge, jsDelivr can serve the old version for up to ~7 days.

## Notes
- No secrets live in `onboarding.js` — it only calls the public onboarding API,
  which is why a public repo is fine.
- Want code-privacy + instant deploys with no purge step? Connect a **private**
  repo to Netlify/Cloudflare Pages and point the loader at that URL instead.
  (More setup; not needed for a client-facing form.)
