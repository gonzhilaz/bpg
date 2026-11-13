# 13C License Authority & Kill-Switch Controller

Dedicated serverless license management authority for **13C Crypto Payment Gateway**. Hosted independently on **Vercel** to maintain 100% developer sovereignty over deployed client instances.

---

## ⚡ Deployment to Vercel (1-Click)

1. Push this folder to your personal GitHub repository (e.g. `github.com/your-username/13c-license-server`).
2. Go to **[vercel.com](https://vercel.com)** -> **Add New Project** -> Select `13c-license-server`.
3. Set Environment Variables (optional, defaults provided):
   * `DEV_PRIVATE_KEY`: Your Ed25519 32-byte hex private key (default pre-configured).
   * `DEV_PUBLIC_KEY`: Your Ed25519 32-byte hex public key (hardcoded in the Gateway).
4. Deploy! Your controller is live at `https://your-project.vercel.app`.

---

## 🛡️ Developer Control Features

1. **Issue Signed Licenses**:
   * Open the dashboard in browser.
   * Enter developer passcode: `developer-root` (or custom passcode).
   * Input client name (e.g. "Captain Client"), domain, validity duration, and click **"Sign & Generate Token"**.
   * Give the generated `13C-LIC-...` string to your client.
2. **Heartbeat Monitoring**:
   * The client's gateway backend pings `/api/verify` every 6 hours.
   * You see live pings, client IP, and last-seen timestamps on the dashboard.
3. **Instant Remote Kill-Switch**:
   * If the client hasn't completed payment or violates agreements, click **"Kill Switch"**.
   * The client's gateway immediately freezes all checkout creation and payment processing with HTTP 402 (*Access Revoked by Developer*).
   * Click **"Restore"** anytime to unfreeze the system.
