import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(dataDir, 'mechatronics_lab.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_academy_member INTEGER NOT NULL DEFAULT 0,
    subscription_status TEXT NOT NULL DEFAULT 'pending_verification',
    subscription_expires_at TEXT,
    owner_notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS preapproved_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    notes TEXT,
    added_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS owner_credentials (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '785502919',
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_circuits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    circuit_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Crypto helpers
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

function normalizePhone(rawPhone: string): string {
  // Strip non-digits and leading +967 or 00967 or 0
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('967')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

// Seed or update owner password to @Admin_aseel780# as requested
const existingOwner = db.prepare('SELECT * FROM owner_credentials WHERE id = 1').get() as any;
const { salt: newOwnerSalt, hash: newOwnerHash } = hashPassword('@Admin_aseel780#');
if (!existingOwner) {
  db.prepare(`
    INSERT INTO owner_credentials (id, username, phone, password_salt, password_hash, updated_at)
    VALUES (1, 'owner', '785502919', ?, ?, ?)
  `).run(newOwnerSalt, newOwnerHash, new Date().toISOString());
  console.log('✅ تم إنشاء حساب المالك (اسم المستخدم: 785502919 أو owner | كلمة المرور: @Admin_aseel780#)');
} else {
  db.prepare('UPDATE owner_credentials SET password_salt = ?, password_hash = ?, updated_at = ? WHERE id = 1')
    .run(newOwnerSalt, newOwnerHash, new Date().toISOString());
  console.log('✅ تم تحديث كلمة مرور المالك بنجاح إلى: @Admin_aseel780#');
}

// Seed sample preapproved numbers if table is empty
const preapprovedCount = db.prepare('SELECT COUNT(*) as count FROM preapproved_members').get() as any;
if (preapprovedCount?.count === 0) {
  const seedNumbers = [
    { phone: '785502919', name: 'إدارة أكاديمية الميكاترونكس', notes: 'الرقم الإداري للأكاديمية' },
    { phone: '777000111', name: 'طالب معتمد تجريبي 1', notes: 'مشترك سنوي في الأكاديمية' },
    { phone: '771234567', name: 'طالب معتمد تجريبي 2', notes: 'دفعة هندسة ميكاترونكس' },
  ];
  const insertPre = db.prepare('INSERT OR IGNORE INTO preapproved_members (phone, name, notes, added_at) VALUES (?, ?, ?, ?)');
  for (const s of seedNumbers) {
    insertPre.run(normalizePhone(s.phone), s.name, s.notes, new Date().toISOString());
  }
}

// Session middleware helpers
function getSessionUser(req: express.Request): { userId: string; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as any;
  if (!session) return null;

  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return { userId: session.user_id, role: session.user_role };
}

function requireStudentAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = getSessionUser(req);
  if (!session || (session.role !== 'student' && session.role !== 'owner')) {
    res.status(401).json({ error: 'غير مصرّح، يُرجى تسجيل الدخول' });
    return;
  }
  (req as any).session = session;
  next();
}

function requireOwnerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = getSessionUser(req);
  if (!session || session.role !== 'owner') {
    res.status(403).json({ error: 'صلاحيات المالك مطلوبة' });
    return;
  }
  (req as any).session = session;
  next();
}

// ==========================================
// 1. PUBLIC AUTH API (Students & Login)
// ==========================================

// Register new student
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, phone, password, confirmPassword, isAcademyMember } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
      res.status(400).json({ error: 'يُرجى إدخال الاسم الكامل (ثلاثي على الأقل)' });
      return;
    }

    if (!phone || typeof phone !== 'string') {
      res.status(400).json({ error: 'يُرجى إدخال رقم هاتف صحيح' });
      return;
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 8) {
      res.status(400).json({ error: 'رقم الهاتف قصير جداً، يُرجى إدخال رقم صحيح' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    // Check if phone already registered
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(cleanPhone);
    if (existing) {
      res.status(409).json({ error: 'رقم الهاتف مسجل مسبقاً، يُرجى تسجيل الدخول مباشرة' });
      return;
    }

    // Check if phone is pre-approved in Academy records
    const preapproved = db.prepare('SELECT * FROM preapproved_members WHERE phone = ?').get(cleanPhone) as any;

    let initialStatus: 'active' | 'pending_verification' | 'pending_subscription' = 'pending_subscription';
    let expiresAt: string | null = null;
    let autoApproved = false;

    if (isAcademyMember) {
      if (preapproved) {
        // Automatic immediate approval because number is verified in the academy list!
        initialStatus = 'active';
        autoApproved = true;
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        expiresAt = oneYearFromNow.toISOString();
      } else {
        // Academy member without pre-record -> Needs Owner manual verification
        initialStatus = 'pending_verification';
      }
    } else {
      // Non-member -> Needs subscription via WhatsApp
      initialStatus = 'pending_subscription';
    }

    const userId = crypto.randomUUID();
    const { salt, hash } = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, phone, full_name, password_salt, password_hash,
        is_academy_member, subscription_status, subscription_expires_at,
        owner_notes, created_at, last_login_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      cleanPhone,
      fullName.trim(),
      salt,
      hash,
      isAcademyMember ? 1 : 0,
      initialStatus,
      expiresAt,
      autoApproved ? 'تم التفعيل التلقائي لمطابقة رقم الهاتف مع سجل الأكاديمية' : '',
      now,
      now
    );

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    db.prepare('INSERT INTO sessions (token, user_id, user_role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
      .run(token, userId, 'student', now, sessionExpiry);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: cleanPhone,
        fullName: fullName.trim(),
        isAcademyMember: Boolean(isAcademyMember),
        subscriptionStatus: initialStatus,
        subscriptionExpiresAt: expiresAt,
        autoApproved,
      },
      message: autoApproved
        ? 'مرحباً بك! تم التحقق التلقائي من اشتراكك بنجاح وتفعيل حسابك.'
        : isAcademyMember
        ? 'تم إنشاء الحساب بنجاح وهو الآن بانتظار التحقق من اشتراكك في الأكاديمية.'
        : 'تم إنشاء الحساب بنجاح وهو بانتظار إتمام اشتراكك في الأكاديمية.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إنشاء الحساب' });
  }
});

// Student Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      res.status(400).json({ error: 'يُرجى إدخال رقم الهاتف وكلمة المرور' });
      return;
    }

    const cleanPhone = normalizePhone(phone);
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone) as any;

    if (!user) {
      res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
      return;
    }

    const isValid = verifyPassword(password, user.password_salt, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
      return;
    }

    // Check expiration if status is active
    let currentStatus = user.subscription_status;
    if (currentStatus === 'active' && user.subscription_expires_at) {
      if (new Date(user.subscription_expires_at).getTime() < Date.now()) {
        currentStatus = 'pending_subscription';
        db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?').run('pending_subscription', user.id);
      }
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (token, user_id, user_role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
      .run(token, user.id, 'student', now, sessionExpiry);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
        isAcademyMember: Boolean(user.is_academy_member),
        subscriptionStatus: currentStatus,
        subscriptionExpiresAt: user.subscription_expires_at,
        ownerNotes: user.owner_notes,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' });
  }
});

// Get current user session
app.get('/api/auth/me', (req, res) => {
  const session = getSessionUser(req);
  if (!session) {
    res.status(401).json({ error: 'الجلسة غير صالحة' });
    return;
  }

  if (session.role === 'owner') {
    res.json({
      role: 'owner',
      user: {
        id: 'owner',
        fullName: 'مالك المنصة - الإدارة العامة',
        phone: '785502919',
        isOwner: true,
      },
    });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  res.json({
    role: 'student',
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.full_name,
      isAcademyMember: Boolean(user.is_academy_member),
      subscriptionStatus: user.subscription_status,
      subscriptionExpiresAt: user.subscription_expires_at,
      ownerNotes: user.owner_notes,
      createdAt: user.created_at,
    },
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

// Change Student Password
app.post('/api/auth/change-password', requireStudentAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const session = (req as any).session;
    if (session.role === 'owner') {
      res.status(400).json({ error: 'يُرجى تغيير كلمة مرور المالك من لوحة التحكم' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    if (!verifyPassword(currentPassword, user.password_salt, user.password_hash)) {
      res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?').run(salt, hash, user.id);

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تغيير كلمة المرور' });
  }
});

// ==========================================
// 2. OWNER AUTH & MANAGEMENT API
// ==========================================

// Owner Login
app.post('/api/owner/login', (req, res) => {
  try {
    const { usernameOrPhone, password } = req.body;
    if (!usernameOrPhone || !password) {
      res.status(400).json({ error: 'يُرجى إدخال اسم المستخدم وكلمة المرور للمالك' });
      return;
    }

    const cleanInput = usernameOrPhone.trim();
    const cleanPhone = normalizePhone(usernameOrPhone);

    const owner = db.prepare(`
      SELECT * FROM owner_credentials 
      WHERE username = ? OR phone = ? OR phone = ?
    `).get(cleanInput, cleanInput, cleanPhone) as any;

    if (!owner) {
      res.status(401).json({ error: 'بيانات اعتماد المالك غير صحيحة' });
      return;
    }

    const isValid = verifyPassword(password, owner.password_salt, owner.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'بيانات اعتماد المالك غير صحيحة' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date().toISOString();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    db.prepare('INSERT INTO sessions (token, user_id, user_role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
      .run(token, 'owner', 'owner', now, sessionExpiry);

    res.json({
      success: true,
      token,
      owner: {
        username: owner.username,
        phone: owner.phone,
      },
    });
  } catch (err: any) {
    console.error('Owner login error:', err);
    res.status(500).json({ error: 'فشل تسجيل دخول المالك' });
  }
});

// Owner Dashboard Summary Stats
app.get('/api/owner/stats', requireOwnerAuth, (_req, res) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const activeUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'active'").get() as any).c;
    const pendingVerification = (db.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'pending_verification'").get() as any).c;
    const pendingSubscription = (db.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'pending_subscription'").get() as any).c;
    const suspendedUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'suspended'").get() as any).c;
    const preapprovedTotal = (db.prepare('SELECT COUNT(*) as c FROM preapproved_members').get() as any).c;

    res.json({
      totalUsers,
      activeUsers,
      pendingVerification,
      pendingSubscription,
      suspendedUsers,
      preapprovedTotal,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل جلب إحصائيات المالك' });
  }
});

// Owner: List and search students
app.get('/api/owner/users', requireOwnerAuth, (req, res) => {
  try {
    const search = ((req.query.search as string) || '').trim();
    const status = (req.query.status as string) || '';

    let query = 'SELECT id, phone, full_name, is_academy_member, subscription_status, subscription_expires_at, owner_notes, created_at, last_login_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND subscription_status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل استعلام قائمة الطلاب' });
  }
});

// Owner: Update student subscription status
app.patch('/api/owner/users/:id/status', requireOwnerAuth, (req, res) => {
  try {
    const userId = req.params.id;
    const { status, ownerNotes, extendMonths } = req.body;

    const allowedStatuses = ['active', 'pending_verification', 'pending_subscription', 'suspended', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ error: 'حالة غير صالحة' });
      return;
    }

    let expiresAt: string | null = null;
    if (status === 'active') {
      const months = Number(extendMonths) || 12;
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + months);
      expiresAt = expDate.toISOString();
    }

    db.prepare(`
      UPDATE users 
      SET subscription_status = ?,
          subscription_expires_at = COALESCE(?, subscription_expires_at),
          owner_notes = COALESCE(?, owner_notes)
      WHERE id = ?
    `).run(status, expiresAt, ownerNotes ?? null, userId);

    res.json({ success: true, message: 'تم تحديث حالة الطالب بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تحديث بيانات الطالب' });
  }
});

// Owner: Delete student account
app.delete('/api/owner/users/:id', requireOwnerAuth, (req, res) => {
  try {
    const userId = req.params.id;
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM saved_circuits WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ success: true, message: 'تم حذف حساب الطالب بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حذف الحساب' });
  }
});

// Owner: Preapproved members list
app.get('/api/owner/preapproved', requireOwnerAuth, (_req, res) => {
  try {
    const members = db.prepare('SELECT * FROM preapproved_members ORDER BY added_at DESC').all();
    res.json({ members });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل جلب قائمة المعتمدين' });
  }
});

// Owner: Add preapproved member
app.post('/api/owner/preapproved', requireOwnerAuth, (req, res) => {
  try {
    const { phone, name, notes } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'يُرجى إدخال رقم الهاتف' });
      return;
    }
    const cleanPhone = normalizePhone(phone);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO preapproved_members (phone, name, notes, added_at)
      VALUES (?, ?, ?, ?)
    `).run(cleanPhone, name?.trim() || null, notes?.trim() || null, now);

    // If an existing registered student with this phone is pending, auto-activate them!
    db.prepare(`
      UPDATE users 
      SET subscription_status = 'active',
          owner_notes = 'تم التفعيل التلقائي بعد إضافة الرقم إلى سجل المعتمدين'
      WHERE phone = ? AND subscription_status != 'active'
    `).run(cleanPhone);

    res.json({ success: true, message: 'تم إضافة الرقم إلى سجل المعتمدين وتحديث الحساب المرتبط إن وجد' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل إضافة الرقم المعتمد' });
  }
});

// Owner: Delete preapproved member
app.delete('/api/owner/preapproved/:id', requireOwnerAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM preapproved_members WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'تم حذف الرقم من سجل المعتمدين' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حذف الرقم' });
  }
});

// Owner: Change Owner password
app.post('/api/owner/change-password', requireOwnerAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف' });
      return;
    }

    const owner = db.prepare('SELECT * FROM owner_credentials WHERE id = 1').get() as any;
    if (!verifyPassword(currentPassword, owner.password_salt, owner.password_hash)) {
      res.status(400).json({ error: 'كلمة مرور المالك الحالية غير صحيحة' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    db.prepare('UPDATE owner_credentials SET password_salt = ?, password_hash = ?, updated_at = ? WHERE id = 1')
      .run(salt, hash, new Date().toISOString());

    res.json({ success: true, message: 'تم تحديث كلمة مرور المالك بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تغيير كلمة مرور المالك' });
  }
});

// ==========================================
// 3. STUDENT CLOUD CIRCUITS API
// ==========================================

app.get('/api/circuits', requireStudentAuth, (req, res) => {
  try {
    const session = (req as any).session;
    const circuits = db.prepare('SELECT id, name, description, circuit_json, updated_at FROM saved_circuits WHERE user_id = ? ORDER BY updated_at DESC')
      .all(session.userId);
    res.json({ circuits });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل جلب الدوائر المحفوظة' });
  }
});

app.post('/api/circuits', requireStudentAuth, (req, res) => {
  try {
    const session = (req as any).session;
    const { id, name, description, circuitJson } = req.body;
    if (!name || !circuitJson) {
      res.status(400).json({ error: 'اسم الدائرة ومحتواها مطلوبان' });
      return;
    }
    const circuitId = id || crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO saved_circuits (id, user_id, name, description, circuit_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(circuitId, session.userId, name.trim(), description?.trim() || null, typeof circuitJson === 'string' ? circuitJson : JSON.stringify(circuitJson), now);

    res.json({ success: true, id: circuitId, message: 'تم حفظ الدائرة في السحابة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حفظ الدائرة' });
  }
});

app.delete('/api/circuits/:id', requireStudentAuth, (req, res) => {
  try {
    const session = (req as any).session;
    db.prepare('DELETE FROM saved_circuits WHERE id = ? AND user_id = ?').run(req.params.id, session.userId);
    res.json({ success: true, message: 'تم حذف الدائرة' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حذف الدائرة' });
  }
});

// ==========================================
// VITE DEV / PROD INTEGRATION
// ==========================================

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const publicPath = path.resolve(process.cwd(), 'public');

  // Serve static assets from public folder
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  const server = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🇾🇪 مختبر الميكاترونكس اليمني (Yemen Mechatronics Lab)`);
    console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
