---
name: Email pipeline
description: Unified email sender — Gmail SMTP primary (free), Resend fallback
---

**Rule:** Use api/_lib/email.ts `sendEmail()` for all report emails. orders.ts imports from here.

**How to apply:** 
- If GMAIL_USER + GMAIL_APP_PASSWORD set → nodemailer Gmail SMTP (free, no domain verify needed)
- Else → Resend (needs RESEND_API_KEY + domain verification for dresstyle.world)
- api/_lib/resend.ts still handles `sendSubscriptionWelcomeEmail()` (subscriptions only)

**Why:** Resend requires domain verification (dresstyle.world not yet verified). Gmail SMTP is free with no domain verification required. User needs to set GMAIL_USER and GMAIL_APP_PASSWORD in Replit secrets.
