import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "NAHVI <onboarding@resend.dev>";
const ADMIN = process.env.ADMIN_NOTIFY_EMAIL || "abhinaypandey675@gmail.com";

async function send(subject: string, html: string, to: string = ADMIN) {
  if (!resend) {
    // No API key configured yet -- fail loudly in logs instead of silently
    // pretending the email went out. Wire up RESEND_API_KEY to activate.
    console.warn(`[email disabled] Would have sent: "${subject}" to ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Never let a notification failure break the request that triggered it.
    console.error("Email send failed:", err);
  }
}

function layout(title: string, rows: Record<string, string | undefined>) {
  const rowsHtml = Object.entries(rows)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#8890b5;font-family:monospace;font-size:12px;">${k}</td><td style="padding:6px 12px;color:#111;font-family:sans-serif;font-size:14px;">${v}</td></tr>`
    )
    .join("");
  return `
  <div style="background:#05070d;padding:32px;font-family:sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(100deg,#7b5cff,#00e5ff);padding:20px 24px;">
        <h2 style="margin:0;color:#05070d;font-family:sans-serif;">${title}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
    </div>
  </div>`;
}

/** Metadata that's optionally attached to any event -- device/IP/location context. */
export type RequestMeta = {
  ip?: string;
  userAgent?: string;
  country?: string;
};

export const notify = {
  userRegistered(user: { name?: string | null; email: string }, meta?: RequestMeta) {
    return send(
      "New user registered",
      layout("New user registered", {
        Name: user.name || "(not provided)",
        Email: user.email,
        Time: new Date().toLocaleString(),
        IP: meta?.ip,
        "Browser/device": meta?.userAgent,
        Country: meta?.country,
      })
    );
  },

  userLoggedIn(user: { name?: string | null; email: string }, meta?: RequestMeta) {
    return send(
      "User login",
      layout("User login", {
        Name: user.name || "(not provided)",
        Email: user.email,
        Time: new Date().toLocaleString(),
        IP: meta?.ip,
        "Browser/device": meta?.userAgent,
        Country: meta?.country,
      })
    );
  },

  projectRequest(req: { name: string; email: string; app?: string; budget?: string; message: string }) {
    return send(
      "New project request",
      layout("New project request", {
        Name: req.name,
        Email: req.email,
        "App of interest": req.app,
        Budget: req.budget,
        Message: req.message,
        Time: new Date().toLocaleString(),
      })
    );
  },

  contactForm(msg: { name: string; email: string; message: string }) {
    return send(
      "New contact form submission",
      layout("New contact form submission", {
        Name: msg.name,
        Email: msg.email,
        Message: msg.message,
        Time: new Date().toLocaleString(),
      })
    );
  },

  appRequest(req: { appName: string; name: string; email: string }) {
    return send(
      "New app request",
      layout("New app request", {
        App: req.appName,
        Name: req.name,
        Email: req.email,
        Time: new Date().toLocaleString(),
      })
    );
  },

  paymentCompleted(payment: { amount: string; email: string; reference?: string }) {
    return send(
      "Payment completed",
      layout("Payment completed", {
        Amount: payment.amount,
        Email: payment.email,
        Reference: payment.reference,
        Time: new Date().toLocaleString(),
      })
    );
  },

  productionError(err: { message: string; route?: string; stack?: string }) {
    return send(
      "⚠ Production error",
      layout("Production error", {
        Message: err.message,
        Route: err.route,
        Time: new Date().toLocaleString(),
        Stack: err.stack?.slice(0, 800),
      })
    );
  },
};
