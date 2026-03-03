const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email, phone, team_name, invitee_name } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviteUrl = `https://rollout.cc/join/${token}`;

    if (!email) {
      // No email provided — return the link for manual sharing
      return new Response(
        JSON.stringify({
          success: true,
          message: `Invite link generated for ${phone || "unknown"}`,
          url: inviteUrl,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const firstName = invitee_name?.split(" ")[0] || "";
    const greeting = firstName ? `Hi ${firstName},` : "Hi,";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <!-- Dark header -->
        <tr><td style="background-color:#0d0d0d;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <img src="https://rollout.cc/rollout-logo-white.png" alt="ROLLOUT" height="36" style="height:36px;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="background-color:#f5f0e8;padding:40px;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#0d0d0d;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#0d0d0d;">
            You've been invited to join <strong>${team_name || "a team"}</strong> on Rollout — the platform for music companies to manage their artists, teams, and operations.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background-color:#0d0d0d;border-radius:9999px;padding:14px 32px;">
              <a href="${inviteUrl}" target="_blank" style="color:#f2ead9;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
                Accept Invitation
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#666;">
            This invite expires in 7 days. If you didn't expect this, you can ignore this email.
          </p>
          <p style="margin:0;font-size:12px;color:#999;">
            <a href="${inviteUrl}" style="color:#999;word-break:break-all;">${inviteUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollout <accounts@rollout.cc>",
        to: [email],
        subject: `You've been invited to join ${team_name || "a team"} on Rollout`,
        html: htmlBody,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Failed to send email via Resend");
    }

    console.log("Email sent successfully:", resendData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invite email sent to ${email}`,
        url: inviteUrl,
        email_id: resendData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("send-invite-notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
