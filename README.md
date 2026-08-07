# BTRC Website

Bamenda Technological Research Center — website with a functional admin dashboard, a Node.js + Express backend (REST API), and a vanilla-JS frontend.

## Try the site (recommended)

For the admin dashboard to work and for added items to display on the site, **always open the site through the Node server** — not by double-clicking the HTML files.

```bash
# 1. Install dependencies (only the first time)
npm install

# 2. Start the server (keep this terminal running)
npm start
# or: node server.js

# 3. Open your browser to
http://localhost:3000
```

- Navigate to **Programs** → you'll see the programs (and any you add).
- Click the ⚙️ **gear icon** in the top-right navbar to open the **admin dashboard**.
- Log in with PIN: `BTRC1234`
- Add / edit / delete **Projects**, **Programs**, and **News**. Changes are saved to `data/db.json` and appear on the site immediately.

## REST API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | `{ "pin": "BTRC1234" }` → returns a Bearer token |
| GET | `/api/projects` | — | List projects |
| GET | `/api/programs` | — | List programs |
| GET | `/api/news` | — | List news |
| GET | `/api/data` | — | Full dataset (used by admin) |
| GET | `/api/health` | — | Health check |
| POST | `/api/:resource` | Bearer | Create item (projects/programs/news) |
| PUT | `/api/:resource/:id` | Bearer | Update item |
| DELETE | `/api/:resource/:id` | Bearer | Delete item |

## Static hosting fallback

If you later host on GitHub Pages (no Node server), the pages **fall back** to:
1. Data saved by the admin in **localStorage** (key `btrc_admin_data`), then
2. Bundled defaults in `js/data.js`.

This means the site still displays content, and admin edits persist in the browser. For a multi-user/public site, deploy the Node backend to a host (Render, Railway, a VPS, etc.).

## Notes

- Admin PIN: `BTRC1234`
- Newsletter submits to `btrcbambili@gmail.com`
- Contact form sends via backend SMTP (Nodemailer) if configured; falls back to `mailto:` if not.

### Configuring SMTP for Contact Form

To enable the contact form to send emails directly from the server (without opening the visitor's mail client), set these environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
CONTACT_TO=btrcbambili@gmail.com
```

For Gmail, you'll need an [App Password](https://support.google.com/accounts/answer/185833) (requires 2FA enabled on the account).
- Social links: Facebook, X, LinkedIn, WhatsApp, YouTube (TikTok placeholder reserved for later)
- Design: Vivid Indigo palette with white text on indigo backgrounds

