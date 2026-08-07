/* ================================================
   BTRC - Backend Server (Node.js + Express)
   Provides REST APIs for Projects, Programs, News, Team
   ================================================ */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Admin credentials (simple PIN - for demo/static hosting fallback)
const ADMIN_PIN = 'BTRC1234';

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname)));

/* ================================================
   DATABASE HELPERS
   ================================================ */
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
} catch (err) {
    return { projects: [], programs: [], news: [], team: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function getNextId(items) {
  return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

/* ================================================
   AUTH
   ================================================ */
app.post('/api/auth/login', (req, res) => {
  const { pin } = req.body || {};
  if (pin === ADMIN_PIN) {
    res.json({ success: true, token: 'btrc-admin-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// Simple auth middleware for write operations
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer btrc-admin-')) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

/* ================================================
   GENERIC CRUD ROUTES
   ================================================ */
function createCrudRoutes(resource) {
  // GET all
  app.get(`/api/${resource}`, (req, res) => {
    const db = readDB();
    res.json(db[resource] || []);
  });

  // GET one
  app.get(`/api/${resource}/:id`, (req, res) => {
    const db = readDB();
    const item = (db[resource] || []).find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  });

  // POST create
  app.post(`/api/${resource}`, requireAuth, (req, res) => {
    const db = readDB();
    const newItem = { id: getNextId(db[resource] || []), ...req.body };
    db[resource] = db[resource] || [];
    db[resource].push(newItem);
    writeDB(db);
    res.status(201).json(newItem);
  });

  // PUT update
  app.put(`/api/${resource}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const idx = (db[resource] || []).findIndex(i => i.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    db[resource][idx] = { ...db[resource][idx], ...req.body, id: parseInt(req.params.id) };
    writeDB(db);
    res.json(db[resource][idx]);
  });

  // DELETE
  app.delete(`/api/${resource}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    db[resource] = (db[resource] || []).filter(i => i.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ success: true });
  });
}

['projects', 'programs', 'news', 'team'].forEach(createCrudRoutes);

// GET full dataset (used by admin dashboard)
app.get('/api/data', (req, res) => {
  res.json(readDB());
});

/* ================================================
   IMAGE UPLOAD ENDPOINT
   Saves an uploaded image to /uploads and returns
   the public URL (e.g. /uploads/xxx.jpg)
   ================================================ */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|gif|webp|svg)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const url = '/uploads/' + req.file.filename;
  res.json({ success: true, url });
});

/* ================================================
   CONTACT / EMAIL ENDPOINT
   Sends contact form messages to btrcbambili@gmail.com
   Configure via env vars (see README):
     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO
   ================================================ */
app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', subject = '', message = '' } = req.body || {};

  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || 'btrcbambili@gmail.com';

  // If SMTP is not configured, return a helpful message so the frontend
  // can fall back to the mailto: approach.
  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(200).json({
      success: false,
      mailtoFallback: true,
      message: 'SMTP not configured on server. Use mailto fallback.'
    });
  }

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({
      from: `"BTRC Website" <${smtpUser}>`,
      to,
      replyTo: email,
      subject: `Website Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n\n${message}`
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

/* ================================================
   HEALTH CHECK
   ================================================ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`BTRC API server running at http://localhost:${PORT}`);
});
