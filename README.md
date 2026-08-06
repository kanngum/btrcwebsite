# BTRC Website

Marketing and information site for BTRC. Currently a **static HTML/CSS/JS site**,
planned to migrate to **Laravel**.

Deployment follows the [Uni B Agency CI/CD Standard Operating Procedure](https://devdocs.unibagency.com).
That document is mandatory and takes precedence over anything written here.

---

## Repository layout

```
btrcwebsite/
├── .cpanel.yml                  # cPanel Git Version Control deploy tasks
├── .github/workflows/
│   ├── ci.yml                   # PR status checks (link + secret validation)
│   └── deploy.yml               # SSH deploy to cPanel on merge to main
├── .gitignore
├── README.md
└── public/                      # ← Web server document root
    ├── .htaccess                # HTTPS, security headers, caching
    ├── index.html
    ├── about.html
    ├── contact.html
    ├── news.html
    ├── programs.html
    ├── projects.html
    ├── research.html
    ├── css/
    ├── images/
    └── js/
```

### Why the site lives in `public/`

The SOP (§4.1) requires the web server document root to be the project's
`public/` directory, never the repository root. This keeps `.git`, config files,
and — after the Laravel migration — application source out of reach of the web.

It also means the migration to Laravel requires **no server reconfiguration**:
`public/` is already the document root, which is exactly where Laravel serves from.

---

## Local development

No build step and no dependencies. Either open `public/index.html` directly, or
serve the folder so that the extensionless URLs behave like production:

```bash
git clone https://github.com/kanngum/btrcwebsite.git
cd btrcwebsite/public
python3 -m http.server 8000
# http://localhost:8000
```

Under XAMPP, point a virtual host's `DocumentRoot` at `btrcwebsite/public`.

---

## Branching model (SOP §2)

```
main          <-- production; deploys automatically (PROTECTED)
  ^
develop       <-- integration branch (PROTECTED)
  ^
feature/*     <-- individual developer work
hotfix/*      <-- emergency production patches only
```

Nobody pushes to `main` or `develop` directly. Ever.

### Day-to-day

```bash
git checkout develop && git pull origin develop
git checkout -b feature/your-feature-name
# work, then:
git add <specific files>
git commit -m "feat: short description of what and why"
git push origin feature/your-feature-name
# Open a PR: base develop <- compare feature/your-feature-name
```

### Releasing

Open a PR `base: main <- compare: develop`, titled
`Release [date] — [summary]`. Once the lead developer approves and merges,
GitHub Actions deploys automatically. Watch the **Actions** tab go green, then
spot-check the live site.

### Commit message types (SOP §6)

`feat:` · `fix:` · `style:` · `refactor:` · `docs:` · `chore:` · `hotfix:`

---

## Deployment

Merging to `main` triggers `.github/workflows/deploy.yml`, which SSHes into the
cPanel server and runs:

```bash
cd ~/btrcwebsite
git fetch origin
git reset --hard origin/main   # server is forced to match GitHub exactly
git clean -fd
```

The server is **read-only**. Never edit files there via File Manager, FTP, or
`nano` — the next deploy discards those edits, and there is no record of them.

### Required GitHub Secrets

Repository → Settings → Secrets and variables → Actions

| Secret | Value |
|---|---|
| `SSH_HOST` | cPanel server hostname |
| `SSH_USERNAME` | cPanel username |
| `SSH_PRIVATE_KEY` | Full private key, including `-----BEGIN`/`-----END` lines |
| `SSH_PORT` | Usually `22` — confirm with the host |

### Required GitHub Variable

| Variable | Value |
|---|---|
| `SITE_URL` | Public URL, used by the post-deploy health check |

---

## Laravel migration

The pipeline is already shaped for it. When the time comes:

1. Scaffold Laravel so that the existing `public/` becomes Laravel's `public/`.
2. Add `.env.example` (SOP §8.2) — it is the contract listing every required
   variable with placeholder values, never real ones.
3. Uncomment the Laravel block in `.github/workflows/deploy.yml`.
4. Uncomment the Laravel block in `.cpanel.yml`.
5. Run the one-time server setup from SOP §4.5.

No document-root change and no cPanel reconfiguration is needed.
