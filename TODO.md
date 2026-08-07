# BTRC Website Update - Task Progress

## Completed [✅]

### Home Page
- [x] Replaced "B" logo with actual BTRC logo (`images/updated logo.png`) in navbar and footer (all 7 pages)
- [x] Research area hover effect sweeps full-card from left → fills right/bottom with indigo overlay

### Footer
- [x] Wired all social links to actual destinations:
  - Facebook → https://www.facebook.com/profile.php?id=61590546876796
  - X (Twitter) → https://x.com/btrcbambili
  - LinkedIn → https://www.linkedin.com/company/131034016/
  - WhatsApp → https://wa.me/237683004478
  - YouTube → https://youtube.com/@btrcbambili?si=j_jpTy-bZaXl3fdZ
- [x] TikTok placeholder slot reserved (left space, `social-placeholder` class)
- [x] Newsletter now submits to btrcbambili@gmail.com (mailto + JS handler)
- [x] Mobile footer: Quick Links & Research Areas become dropdown/accordion to reduce crowding

### Admin Panel
- [x] Hidden admin entry: small gear icon at end of navbar menu (all pages)
- [x] Functional admin dashboard (admin.html) with PIN login = **BTRC1234**
- [x] Manage Projects, Programs, News (add / edit / delete)
- [x] Node.js + Express backend (server.js) with REST APIs
- [x] Data persisted in data/db.json
- [x] localStorage fallback for static hosting (js/data.js, js/admin.js)

### Projects Page
- [x] Admin-driven (category, picture, name, short description, details link)
- [x] "View Details" navigates to provided details link (disabled if none)

### Programs Page
- [x] Admin-driven (name, picture, short description, apply button)
- [x] Named programs seeded: Research Internships, Student Research Program, Technology Workshops, Innovation Labs, Technology Training, Seminars & Conferences
- [x] "Apply Now" navigates to provided application page (falls back to contact.html)

### News Page
- [x] Admin-driven news posts (image, category, title, date, author, summary, read-more link)

### Styling
- [x] Updated primary/accent to Vivid Indigo palette
- [x] White text on indigo/primary backgrounds and derivatives
- [x] Contact page social icons in visible indigo colors

### Backend
- [x] `npm install` completed
- [x] Server tested: health OK, projects (9), programs (6), news (6)
- [x] Admin login tested: correct PIN returns success, wrong PIN returns 401
- [x] **Fixed admin write operations**: admin.js now authenticates via `/api/auth/login` to obtain a Bearer token, sends it on POST/PUT/DELETE, and persists it in sessionStorage across reloads
- [x] **Verified full CRUD flow with auth**: login → create project → delete project all succeed via API
- [x] **Admin dashboard shows current items** (fetched from `/api/data`)
- [x] **Newly added items appear on the website** (frontend pages fetch from `/api/projects`, `/api/programs`, `/api/news`)
- [x] **Fixed fallback mode mismatch**: `js/render.js` now reads admin-edited data from localStorage (same key `btrc_admin_data` the admin panel uses) before falling back to bundled `js/data.js`, so admin changes show even on static/file hosting
- [x] **Verified persistence via API**: added a program through the API → it appeared immediately in `/api/programs` (count incremented) → deleted cleanly
- [x] **Verified server serves pages**: `http://localhost:3000/programs.html` returns 200
- [x] Added `README.md` with clear instructions to open the site through the server (`npm start` → `http://localhost:3000`) so admin changes display
- [x] **Fixed invisible programs**: `js/programs-page.js` now adds the `.active` class (sets opacity 0→1) to dynamically-rendered `.reveal` cards after loading, so program cards are visible instead of stuck at opacity 0
- [x] **Contact form now sends to btrcbambili@gmail.com**: added `/api/contact` endpoint (Nodemailer) in server.js; frontend `js/script.js` posts to the API and falls back to a `mailto:` link when SMTP isn't configured or the server is unreachable
- [x] **Verified contact endpoint**: `/api/contact` returns `{ success:false, mailtoFallback:true }` when SMTP unset (frontend then uses mailto), and health check returns OK on the restarted server
- [x] **Documented SMTP setup** in README (SMTP_HOST/PORT/USER/PASS/SECURE/CONTACT_TO env vars, Gmail app password)
- [x] **Added Team management to admin panel**: new "Team" nav tab + `tab-team` panel in admin.html, `team` schema (name, role, qualifications, image, bio) in js/admin.js, list rendering shows `bio`, `/api/team` CRUD routes + team data seed in server.js/data/db.json/js/data.js
- [x] **Verified Team endpoint**: `/api/team` returns seeded team members (Founder, Co-Founder, + test entry); server restarted with new routes (PID confirmed listening on :3000)

## In Progress [🔄]
- [ ] (Nothing currently in progress)

## Pending [⬜]
- [ ] Deploy backend to a host if not using static GitHub Pages fallback
- [ ] Register actual TikTok link when available (replace the placeholder)
- [ ] Host images if GitHub Pages (currently using relative `images/` paths)

