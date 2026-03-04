

## Two Changes

### 1. Grandfathered premium account

Add `is_grandfathered boolean default false` to `team_subscriptions`. Then in `check-subscription/index.ts`, after fetching the `sub` row, short-circuit if `is_grandfathered` is true — return Icon plan with 15 seats, permanent active status. Finally, set the flag to true for your team via a data migration.

**Files:**
- DB migration: `ALTER TABLE team_subscriptions ADD COLUMN is_grandfathered boolean NOT NULL DEFAULT false;`
- Second migration: `UPDATE team_subscriptions SET is_grandfathered = true WHERE team_id = (SELECT id FROM teams WHERE ... )` — we'll need to identify your team. Alternatively we set it by looking up your user.
- `supabase/functions/check-subscription/index.ts`: After line 54 (fetching `sub`), add:
```typescript
if (sub?.is_grandfathered) {
  return new Response(JSON.stringify({
    plan: "icon", seat_limit: 15, status: "active",
    is_trialing: false, trial_days_left: 0,
    current_period_end: "2099-12-31T00:00:00Z",
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
}
```

### 2. Artist avatar in new_artist email

The issue is that the `new_artist` notification email doesn't include the artist's profile picture at all — the notification payload has no `avatar_url` field, and the email template for `new_artist` renders only text.

**Fix chain:**
1. **`NotificationPayload` interface** in `send-notification/index.ts`: Add `artist_avatar_url?: string`
2. **`new_artist` email template** in `getSubjectAndContent` + `buildHtml`: Add an avatar card showing the artist's image (circular, 64px) next to the artist name
3. **`notifyNewArtist`** in `src/lib/notifications.ts`: Accept `avatarUrl` parameter and pass it through as `artist_avatar_url`
4. **`useCreateArtist`** in `src/hooks/useArtists.ts`: Pass `variables.avatar_url` to `notifyNewArtist`

The email will render a card like:
```
[Avatar Image]  New artist name
                Added to your roster
```

