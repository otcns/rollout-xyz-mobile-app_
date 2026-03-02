

## Fix: Invitation Links and Authentication Flow for Custom Domain

### Problem
Two issues are causing invite links to fail on the custom domain (rollout.cc):

1. **Google Sign-In redirects to Lovable's auth page** -- The JoinTeam page (and Login page) use `lovable.auth.signInWithOAuth()`, which goes through Lovable's authentication bridge. On the custom domain `rollout.cc`, this bridge doesn't work correctly and redirects users to Lovable's own login screen instead of Google.

2. **Invite links may still show preview domain** -- The Settings dialog may be rendering a cached/stale link using the preview URL.

### Solution

**1. Fix Google OAuth for custom domain (JoinTeam.tsx and Login.tsx)**

Replace `lovable.auth.signInWithOAuth("google", ...)` with direct Supabase OAuth using the `skipBrowserRedirect` pattern for custom domains:

- Detect if running on a custom domain (not `*.lovable.app`)
- On custom domain: use `supabase.auth.signInWithOAuth` with `skipBrowserRedirect: true`, then manually redirect to the Google OAuth URL
- On Lovable preview domain: keep using `lovable.auth.signInWithOAuth` so the auth bridge works in development

This applies to both:
- `src/pages/JoinTeam.tsx` (Google sign-in during invite acceptance)
- `src/pages/Login.tsx` (Google sign-in on main login page)

**2. Verify invite link generation uses correct domain**

Confirm that `TeamManagement.tsx` and `StepInviteMembers.tsx` both use `https://rollout.cc` as the base URL (this was previously fixed but we'll verify it's applied correctly).

### Technical Details

**Files to modify:**
- `src/pages/JoinTeam.tsx` -- Update `handleGoogleLogin` to use direct Supabase OAuth on custom domains
- `src/pages/Login.tsx` -- Same Google OAuth fix
- `src/components/settings/TeamManagement.tsx` -- Verify baseUrl is `https://rollout.cc`
- `src/components/onboarding/StepInviteMembers.tsx` -- Verify baseUrl is `https://rollout.cc`

**Google OAuth pattern (applied to both Login and JoinTeam):**
```typescript
const handleGoogleLogin = async () => {
  const isCustomDomain =
    !window.location.hostname.includes("lovable.app") &&
    !window.location.hostname.includes("lovableproject.com");

  if (isCustomDomain) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/join/${token}`, // or appropriate redirect
        skipBrowserRedirect: true,
      },
    });
    if (error) { toast.error(error.message); return; }
    if (data?.url) window.location.href = data.url;
  } else {
    // Use Lovable auth bridge for preview domains
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/join/${token}`,
    });
    if (error) toast.error(error.message);
  }
};
```

This ensures that on rollout.cc, users go directly to Google's sign-in page and return to the Rollout app -- never seeing Lovable's authentication screen.

