/**
 * The magic-link email for signing in without Google. Table layout and inline
 * styles only, so it renders the same in every mail client.
 */

const C = { ink: "#0a1c27", paper: "#f7f6f2", brand: "#0b776d", lagoon: "#3ccfbc", stone: "#56656e", line: "#e6e3dc" };
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function signInEmail(url: string) {
  const subject = "Your GoRoam sign-in link";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:${C.paper};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tap the button to sign in to GoRoam. The link works once and expires in 24 hours.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
    <tr><td align="center" style="padding:32px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
        <tr><td style="padding:0 6px 18px;font-family:${SANS};font-size:20px;font-weight:600;letter-spacing:-0.02em;color:${C.ink};"><span style="color:${C.brand};">Go</span>Roam</td></tr>
        <tr><td style="border-radius:24px;background:#ffffff;border:1px solid ${C.line};padding:34px 30px;">
          <h1 style="margin:0;font-family:${SANS};font-size:26px;line-height:1.15;font-weight:500;letter-spacing:-0.02em;color:${C.ink};">Sign in to <span style="color:${C.brand};">GoRoam</span></h1>
          <p style="margin:14px 0 26px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.stone};">Tap the button below to sign in. No password needed.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-radius:999px;background:${C.ink};">
              <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">Sign in to GoRoam &rarr;</a>
            </td>
          </tr></table>
          <p style="margin:26px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.stone};">This link works once and expires in 24 hours. If the button doesn't work, copy this into your browser:<br><a href="${url}" style="color:${C.brand};word-break:break-all;">${url}</a></p>
        </td></tr>
        <tr><td style="padding:22px 8px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.stone};">
          Didn't ask to sign in? You can safely ignore this email; nobody can sign in without this link.<br>
          GoRoam · Gurgaon, India · <a href="mailto:jitesh@goroam.world" style="color:${C.stone};">jitesh@goroam.world</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `Sign in to GoRoam\n\nOpen this link to sign in (it works once and expires in 24 hours):\n${url}\n\nDidn't ask to sign in? You can ignore this email.\n\nGoRoam · jitesh@goroam.world`;
  return { subject, html, text };
}
