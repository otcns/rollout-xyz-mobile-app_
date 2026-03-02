// Public edge function to fetch invite metadata (team name, inviter name) without auth
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up invite with team and inviter info
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invite_links")
      .select("team_id, invited_by, expires_at, used_at, invitee_name, role")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ error: "Invalid invite link" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry / used
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This invite has expired", expired: true }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (invite.used_at) {
      return new Response(JSON.stringify({ error: "This invite has already been used", used: true }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch team name
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("name, avatar_url")
      .eq("id", invite.team_id)
      .single();

    // Fetch inviter name
    const { data: inviter } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", invite.invited_by)
      .single();

    return new Response(JSON.stringify({
      team_name: team?.name ?? null,
      team_avatar: team?.avatar_url ?? null,
      inviter_name: inviter?.full_name ?? null,
      invitee_name: invite.invitee_name ?? null,
      role: invite.role,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
