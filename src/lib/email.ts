import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "mmafora@gmail.com";
const APP_NAME = "Kasi2Kasi";

function getResend() {
    if (!resend) throw new Error("Email not configured: RESEND_API_KEY is missing");
    return resend;
}

// ===== EMAIL TEMPLATES =====

function baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { display: inline-block; background: linear-gradient(135deg, #1B4332, #2D6A4F); color: white; font-weight: 700; font-size: 18px; padding: 10px 20px; border-radius: 12px; text-decoration: none; }
    h1 { color: #1A1A2E; font-size: 22px; margin: 0 0 8px; }
    h2 { color: #1A1A2E; font-size: 18px; margin: 0 0 8px; }
    p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2D6A4F, #40916C); color: white; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 14px; }
    .stat-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
    .stat-value { color: #2D6A4F; font-size: 28px; font-weight: 700; }
    .stat-label { color: #6b7280; font-size: 12px; margin-top: 4px; }
    .footer { text-align: center; padding: 24px 0 0; }
    .footer p { color: #9ca3af; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .gold { color: #D4A843; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">K2K</a>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>${APP_NAME} · Community Savings, Digitized</p>
      <p>You're receiving this because you have an account on Kasi2Kasi.</p>
    </div>
  </div>
</body>
</html>`;
}

// ===== EMAIL FUNCTIONS =====

export async function sendWelcomeEmail(to: string, name: string) {
    const html = baseTemplate(`
    <h1>Welcome to ${APP_NAME}! 🎉</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>You've joined a movement of South Africans saving smarter together. Here's what you can do next:</p>
    <hr class="divider" />
    <h2>Get Started</h2>
    <p><strong>1. Create a Stokvel</strong> — Set up your group, invite members, and set contribution amounts.</p>
    <p><strong>2. Join with a Link</strong> — Got an invite? Paste the link on your dashboard to join instantly.</p>
    <p><strong>3. Start Contributing</strong> — Track every Rand, build trust scores, and watch your pool grow.</p>
    <hr class="divider" />
    <p style="text-align: center;">
      <a href="#" class="btn">Open Kasi2Kasi</a>
    </p>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
      Questions? Reply to this email — we're here to help.
    </p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `Welcome to ${APP_NAME}, ${name}! 🎉`,
        html,
    });
}

export async function sendContributionEmail(
    to: string,
    name: string,
    groupName: string,
    amount: number,
    round: number
) {
    const html = baseTemplate(`
    <h1>Contribution Recorded ✅</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your contribution to <strong>${groupName}</strong> has been recorded successfully.</p>
    <div class="stat-box">
      <div class="stat-value">R${amount.toFixed(2)}</div>
      <div class="stat-label">Round ${round} Contribution</div>
    </div>
    <p>Your commitment score will be updated to reflect this payment. Keep it up!</p>
    <hr class="divider" />
    <p style="text-align: center;">
      <a href="#" class="btn">View Ledger</a>
    </p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `✅ R${amount.toFixed(2)} contribution recorded — ${groupName}`,
        html,
    });
}

export async function sendPayoutEmail(
    to: string,
    name: string,
    groupName: string,
    amount: number,
    round: number
) {
    const html = baseTemplate(`
    <h1>Payout Processed! 🎉</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Great news! A payout has been processed in <strong>${groupName}</strong>.</p>
    <div class="stat-box" style="background: #fffbeb; border-color: #fde68a;">
      <div class="stat-value gold">R${amount.toFixed(2)}</div>
      <div class="stat-label">Round ${round} Payout</div>
    </div>
    <p>The next round will begin shortly. Contributions will continue as scheduled.</p>
    <hr class="divider" />
    <p style="text-align: center;">
      <a href="#" class="btn">View Details</a>
    </p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `🎉 R${amount.toFixed(2)} payout — ${groupName}`,
        html,
    });
}

export async function sendJoinGroupEmail(
    to: string,
    name: string,
    groupName: string,
    memberCount: number,
    contribution: number,
    frequency: string
) {
    const html = baseTemplate(`
    <h1>Welcome to ${groupName}! 🤝</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>You've successfully joined <strong>${groupName}</strong>. Here's a quick summary:</p>
    <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Members:</strong> ${memberCount}</p>
      <p style="margin: 4px 0;"><strong>Contribution:</strong> R${contribution.toFixed(2)} / ${frequency}</p>
      <p style="margin: 4px 0;"><strong>Payout:</strong> R${(contribution * memberCount).toFixed(2)} per round</p>
    </div>
    <p>Make sure to review the group's constitution and contribute on time to keep your commitment score high.</p>
    <hr class="divider" />
    <p style="text-align: center;">
      <a href="#" class="btn">View Group</a>
    </p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `🤝 You joined ${groupName} on ${APP_NAME}`,
        html,
    });
}

export async function sendRuleAcceptedEmail(
    to: string,
    recipientName: string,
    signerName: string,
    groupName: string,
    ruleTitle: string,
    acceptedCount: number,
    totalMembers: number
) {
    const html = baseTemplate(`
    <h1>Constitution Rule Signed ✍️</h1>
    <p>Hi <strong>${recipientName}</strong>,</p>
    <p><strong>${signerName}</strong> has accepted a rule in <strong>${groupName}</strong>'s constitution.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0; font-weight: 600; color: #1A1A2E;">${ruleTitle}</p>
      <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">✅ ${acceptedCount}/${totalMembers} members have signed</p>
    </div>
    ${acceptedCount < totalMembers
            ? `<p>The group is waiting for ${totalMembers - acceptedCount} more member${totalMembers - acceptedCount !== 1 ? "s" : ""} to accept this rule.</p>`
            : `<p style="color: #2D6A4F; font-weight: 600;">🎉 All members have accepted this rule!</p>`
        }
    <hr class="divider" />
    <p style="text-align: center;">
      <a href="#" class="btn">View Constitution</a>
    </p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `✍️ ${signerName} signed a rule in ${groupName}`,
        html,
    });
}

export async function sendSupportEmail(
    userEmail: string,
    userName: string,
    subject: string,
    message: string
) {
    // Send to support inbox
    const supportHtml = baseTemplate(`
    <h1>Support Request</h1>
    <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>From:</strong> ${userName} (${userEmail})</p>
      <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
    </div>
    <hr class="divider" />
    <p>${message.replace(/\n/g, "<br />")}</p>
  `);

    await getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: SUPPORT_EMAIL,
        replyTo: userEmail,
        subject: `[Support] ${subject}`,
        html: supportHtml,
    });

    // Send confirmation to user
    const confirmHtml = baseTemplate(`
    <h1>We received your message 📬</h1>
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Thanks for reaching out. We've received your support request and will get back to you within 24–48 hours.</p>
    <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 4px 0; color: #9ca3af; font-size: 12px;">Reference: ${Date.now()}</p>
    </div>
    <p>In the meantime, you can continue using Kasi2Kasi as normal.</p>
  `);

    return getResend().emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: userEmail,
        subject: `We received your message — ${APP_NAME} Support`,
        html: confirmHtml,
    });
}
