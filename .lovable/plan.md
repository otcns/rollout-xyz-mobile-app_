

## Plan: Resend Invite Emails + Branded Auth Emails

Two separate systems to set up:

### Part 1: Transactional Invite Emails (Resend)

**What**: Update the `send-invite-notification` edge function to actually send emails via Resend from `accounts@rollout.cc`.

1. **Store the Resend API key** as a secret (`RESEND_API_KEY`) — I'll request it from you via the secrets tool
2. **Update `send-invite-notification/index.ts`** to call the Resend API:
   - From: `accounts@rollout.cc`
   - Subject: "You've been invited to join {team_name} on Rollout"
   - Body: Clean HTML email with Rollout branding (dark header, logo, invite CTA button linking to `https://rollout.cc/join/{token}`)
   - Include invitee name and team name in the email body

### Part 2: Branded Auth Emails (Password Reset, Verification)

**What**: Set up custom auth email templates branded as "ROLLOUT" so password resets and verification emails feel native.

1. **Set up email domain** via Lovable Cloud email setup (sender: `accounts@rollout.cc`)
2. **Scaffold auth email templates** using the built-in tool
3. **Brand the templates** with Rollout's visual identity:
   - Colors: near-black primary (`hsl(0, 0%, 5%)`), warm cream foreground (`hsl(40, 30%, 95%)`)
   - Font: Switzer (with Arial fallback for email)
   - Logo: `rollout-logo-white.png` on dark header
   - Copy tone matching the app's professional but approachable voice
   - "ROLLOUT" branding prominent in all templates
4. **Deploy** the `auth-email-hook` edge function

### Order of Operations

1. First: Request `RESEND_API_KEY` secret from you
2. Update `send-invite-notification` with Resend integration
3. Set up email domain for auth emails
4. Scaffold + brand auth templates
5. Deploy everything

