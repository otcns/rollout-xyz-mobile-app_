

## Separating Landing Page from the App

The cleanest approach is to **create a separate Lovable project** for the landing page. Here's why and how:

### Recommended Architecture

```text
rollout.cc          → Separate Lovable project (marketing/landing page only)
app.rollout.cc      → Current project (the actual app with database, auth, etc.)
```

### Why a Separate Project

- **No database interference**: The landing page project has no connection to your backend, no auth context, no queries running
- **Independent deploys**: Update marketing copy without risking app stability
- **Simpler codebase**: The landing page is just static HTML/CSS with a couple of links — no need for React Query, auth providers, team contexts, etc.
- **Performance**: Landing page loads instantly without pulling in the full app bundle

### Steps

1. **Create a new Lovable project** for the landing page
   - Build the landing page there (dark theme, hero video, features, testimonials, CTAs)
   - "Try For Free" CTA links to `https://app.rollout.cc/login?mode=signup`
   - "Sign In" links to `https://app.rollout.cc/login`

2. **Update DNS for your domains**
   - Point `rollout.cc` (root) → the new landing page project
   - Point `app.rollout.cc` → the current app project
   - Both configured via each project's Settings → Domains in Lovable

3. **Update the current app project**
   - Change the root route (`/`) to redirect to `/roster` (or `/login` if unauthenticated) — remove any landing page from this codebase
   - Update all hardcoded `rollout.cc` references (invite links, OAuth redirects, email templates) to use `app.rollout.cc`
   - Update `window.location.origin` references in OAuth flows to ensure they resolve correctly on the subdomain

4. **Update OAuth configuration**
   - Add `app.rollout.cc` as an authorized redirect URI in your Google OAuth console
   - Update the auth email hook redirect URLs

### What Stays in This Project

Nothing changes about your database, auth, or app logic. You just move the domain from `rollout.cc` to `app.rollout.cc` and update redirect URLs accordingly.

### Alternative: Same Project with Subdomain Detection

You *could* keep everything in one project and check `window.location.hostname` to decide what to render, but this couples your marketing site to your app deploys and still loads the full app bundle for landing page visitors. Not recommended.

