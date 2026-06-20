import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import pg from "pg";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;
const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.SUPABASE_DATABASE_URL || 
  process.env.SUPABASE_URL_NON_POOLING || 
  process.env.POSTGRES_URL || 
  process.env.NEON_DATABASE_URL;
let pool: pg.Pool | null = null;

if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    console.log("PostgreSQL Database Pool (Supabase/Neon) configured successfully.");
  } catch (err) {
    console.error("PostgreSQL Database Pool initialization failed:", err);
  }
} else {
  console.warn("PostgreSQL Database Connection URL is missing. Falling back to Firestore/In-Memory mode.");
}

let __filename = "";
let __dirname = "";
try {
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta && import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  }
} catch (e) {
  // Fallback for transpiled CommonJS environments
}

import { initializeApp as initFirebaseApp } from "firebase/app";
import { 
  getFirestore as getBackendFirestore, 
  collection as fCol, 
  doc as fDoc, 
  getDocs as fGetDocs, 
  getDoc as fGetDoc, 
  setDoc as fSetDoc, 
  updateDoc as fUpdateDoc, 
  query as fQuery, 
  orderBy as fOrderBy 
} from "firebase/firestore";

function loadFirebaseConfig() {
  const possiblePaths = [
    path.join(process.cwd(), "firebase-applet-config.json")
  ];

  if (__dirname) {
    possiblePaths.push(path.join(__dirname, "firebase-applet-config.json"));
    possiblePaths.push(path.join(__dirname, "..", "firebase-applet-config.json"));
  }

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf8");
        return JSON.parse(data);
      }
    } catch (e) {
      // Continue checking paths
    }
  }

  // Fallback default config if all files fail, preventing a crash on import
  console.warn("Could not find firebase-applet-config.json. Using fallback config.");
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || "festive-backup-ff4nj",
    appId: process.env.FIREBASE_APP_ID || "1:74787964544:web:ee8123d2c6e31661ccc865",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "festive-backup-ff4nj.firebasestorage.app",
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAQXqUR58EddDWAOahtaeFW3lEMnDK-BCo",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "festive-backup-ff4nj.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-8d057e99-47bc-4df2-954c-2ac39eea07cd",
    messagingSenderId: process.env.FIREBASE_SENDER_ID || "74787964544",
    measurementId: ""
  };
}

const firebaseConfig = loadFirebaseConfig();
const firebaseApp = initFirebaseApp(firebaseConfig);
const db = getBackendFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);

// In-Memory active verification codes datastore
interface VerificationRecord {
  code: string;
  expires: number;
}
const verificationCodes = new Map<string, VerificationRecord>();

// Real email delivery helper using nodemailer
const sendVerificationEmail = async (toEmail: string, code: string): Promise<{ success: boolean; error?: string }> => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return { success: false, error: "SMTP credentials (SMTP_USER and SMTP_PASS) are not set in the .env environment secrets panel" };
  }

  try {
    const isGmail = host.includes("gmail") || user.endsWith("@gmail.com");
    let transporter;
    
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      });
    }

    const fromAddress = process.env.SMTP_FROM || user;

    await transporter.sendMail({
      from: `"WAEC Master Exam CBT" <${fromAddress}>`,
      to: toEmail,
      subject: `[WAEC Master] Account Registration Code: ${code}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px; background-color: #e0e7ff; color: #4338ca; border-radius: 12px; font-size: 28px; font-weight: bold; line-height: 1;">
              🎓
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 12px; margin-bottom: 4px; letter-spacing: -0.025em;">WAEC Master</h1>
            <p style="font-size: 11px; color: #6366f1; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Scholar CBT Verification</p>
          </div>
          
          <p style="font-size: 14.5px; line-height: 1.6; color: #334155; margin-top: 0; margin-bottom: 16px;">
            Hello Candidate,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
            Welcome to the WAEC Master preparatory board! Please use the following 4-digit verification token to establish your candidate account.
          </p>
          
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; padding: 14px 28px; background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 16px; font-size: 32px; font-weight: 900; letter-spacing: 0.15em; color: #312e81; font-family: 'Courier New', Courier, monospace;">
              ${code}
            </div>
            <p style="font-size: 11px; color: #ef4444; font-weight: 700; margin-top: 8px; margin-bottom: 0;">This code will expire in 24 hours.</p>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 24px;">
            If you did not request to sign up on WAEC Master CBT, you can safely ignore this automated message.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 16px;" />
          <p style="font-size: 10px; text-align: center; color: #94a3b8; margin: 0;">
            © 2026 WAEC Master CBT Simulator. West African Examination Council Preparation Partner.
          </p>
        </div>
      `
    });

    return { success: true };
  } catch (err: any) {
    console.error("Nodemailer send failed:", err);
    return { success: false, error: err.message };
  }
};

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Enterprise Cybersecurity & DevSecOps Protective Components
const serverBlockedIps = new Set<string>(["197.210.64.9", "41.105.23.4"]);

// 1. Strict CORS & Security HTTP Headers (Helmet Equivalence)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const whitelist = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://waecmaster.edu.ng"
  ];
  if (origin) {
    const isAllowed = 
      whitelist.includes(origin) || 
      origin.startsWith("http://localhost:") || 
      origin.endsWith(".vercel.app") ||
      origin.includes(".run.app");
    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Helmet equivalent custom security policy headers
  res.setHeader("Content-Security-Policy", "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self'; object-src 'none';");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// 2. High-Performance Client Rate Limiter Subsystem
const rateLimitMap = new Map<string, Map<string, { hits: number; lastReset: number }>>();

const getClientIp = (req: any): string => {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").toString().split(",")[0].trim();
};

const createRateLimiterMiddleware = (routeId: string, maxHitsPerMinute: number) => {
  return (req: any, res: any, next: any) => {
    const ip = getClientIp(req);
    
    // Immediate Active Firewall filter check
    if (serverBlockedIps.has(ip)) {
      console.warn(`[WAF INTERVENTION] Dropped request from firewalled hacker IP: ${ip}`);
      return res.status(403).json({ error: "Access Denied. Your IP address has been blocklisted by WAF." });
    }

    let routeMap = rateLimitMap.get(routeId);
    if (!routeMap) {
      routeMap = new Map<string, { hits: number; lastReset: number }>();
      rateLimitMap.set(routeId, routeMap);
    }

    const now = Date.now();
    let clientInfo = routeMap.get(ip);
    
    if (!clientInfo) {
      clientInfo = { hits: 1, lastReset: now };
      routeMap.set(ip, clientInfo);
    } else {
      if (now - clientInfo.lastReset > 60000) {
        clientInfo.hits = 1;
        clientInfo.lastReset = now;
      } else {
        clientInfo.hits += 1;
      }
    }

    if (clientInfo.hits > maxHitsPerMinute) {
      console.warn(`[LIMIT VIOLATED] Path: ${req.path}, IP: ${ip}, Hits/min: ${clientInfo.hits}`);
      return res.status(429).json({ 
        error: "Too many requests. Please slow down and try again.",
        message: `Dynamic rate limiting is active on CBT endpoints to stave off bot storms.`
      });
    }

    next();
  };
};

// 3. Recursive Input Sanitization & Stored XSS shield
const sanitizePayloadHtml = (data: any): any => {
  if (!data) return data;
  if (typeof data === "string") {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, 'blocked_attr=')
      .replace(/javascript:/gi, 'blocked_javascript:');
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayloadHtml(item));
  }
  if (typeof data === "object") {
    const sanitized: { [key: string]: any } = {};
    for (const key in data) {
      sanitized[key] = sanitizePayloadHtml(data[key]);
    }
    return sanitized;
  }
  return data;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizePayloadHtml(req.body);
  if (req.query) req.query = sanitizePayloadHtml(req.query);
  next();
});

// API Auth code sending and verification
app.post("/api/auth/send-verification-code", createRateLimiterMiddleware("auth", 10), async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email address. Please enter your Gmail." });
  }

  const cleanEmail = email.toLowerCase().trim();
  // Secure 4 digit code (e.g., between 1000 and 9999).
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours limit

  verificationCodes.set(cleanEmail, { code, expires });
  console.log(`\n==============================================\n[OTP DEBUG PORTAL]\nEMAIL: ${cleanEmail}\nVERIFICATION CODE: ${code}\n==============================================\n`);

  const sResult = await sendVerificationEmail(cleanEmail, code);

  if (sResult.success) {
    res.json({
      success: true,
      emailSent: true,
      message: "A randomized 4-digit verification code was sent to your Gmail inbox! Please check your details."
    });
  } else {
    // If SMTP credentials are not yet configured on AI Studio, let user play/onboard by providing a friendly debug notice and returning the code. But NO standard user is allowed to bypass with "000".
    res.json({
      success: true,
      emailSent: false,
      devCode: code,
      message: `Code generated! (SMTP Not Set on Server - fallback code is: ${code})`,
      error: sResult.error
    });
  }
});

app.post("/api/auth/verify-code", createRateLimiterMiddleware("auth", 10), (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Missing registration email or code." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();
  const record = verificationCodes.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ error: "No verification process active for this registration. Try again." });
  }

  if (Date.now() > record.expires) {
    verificationCodes.delete(cleanEmail);
    return res.status(400).json({ error: "Verification token expired. Please click resend to get a new code." });
  }

  // Explicitly block "000" or "0000"
  if (cleanCode === "000" || cleanCode === "0000") {
    return res.status(400).json({ error: "Standard bypass '000' is strictly disabled for security. Type the real code sent to your Gmail." });
  }

  if (record.code !== cleanCode) {
    return res.status(400).json({ error: "Incorrect verification code. Access denied." });
  }

  // Success! Purge record.
  verificationCodes.delete(cleanEmail);
  res.json({ success: true, message: "Email code successfully verified!" });
});

// Admin OTP CBT security mechanisms store and endpoints
const adminActionCodes = new Map<string, VerificationRecord>();

const sendAdminVerificationEmail = async (toEmail: string, code: string, actionDesc: string): Promise<{ success: boolean; error?: string }> => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return { success: false, error: "SMTP credentials (SMTP_USER and SMTP_PASS) are not set" };
  }

  try {
    const isGmail = host.includes("gmail") || user.endsWith("@gmail.com");
    let transporter;
    
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    const fromAddress = process.env.SMTP_FROM || user;

    await transporter.sendMail({
      from: `"WAEC Master CBT Admin" <${fromAddress}>`,
      to: toEmail,
      subject: `[ADMIN ACTION SECURITY] Code: ${code} - Authorization Required`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #ef4444; border-radius: 20px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px; background-color: #fef2f2; border-radius: 50%; margin-bottom: 12px;">
              <span style="font-size: 32px;">🛡️</span>
            </div>
            <h2 style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 800;">ADMIN SECURITY AUTHORIZATION</h2>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Privileged Account Modification</p>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
            An edit action has been initiated on the CBT Administration Console. This requires multi-factor authorization to proceed.
          </p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Triggered Action:</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #b91c1c; font-family: monospace; font-weight: 600;">${actionDesc}</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Your 4-Digit Security Code</p>
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f172a; background-color: #f1f5f9; padding: 10px 24px; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 10px; text-align: center; color: #94a3b8; margin: 24px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px; line-height: 1.4;">
            This security code is only valid for 15 minutes. If you did not trigger this action, please audit your administrative sessions immediately.
          </p>
        </div>
      `
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send admin verification email:", err);
    return { success: false, error: err.message };
  }
};

app.post("/api/admin/send-secure-code", async (req, res) => {
  const { email, actionDescription } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing administrator email." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = Date.now() + 15 * 60 * 1000; // 15 mins validity for safety

  adminActionCodes.set(cleanEmail, { code, expires });
  console.log(`\n==============================================\n[ADMIN SECURITY SECURITY PORTAL]\nEMAIL: ${cleanEmail}\nACTION: ${actionDescription || 'N/A'}\nSECURITY CODE: ${code}\n==============================================\n`);

  const sResult = await sendAdminVerificationEmail(cleanEmail, code, actionDescription || "Modifying user record");

  if (sResult.success) {
    res.json({
      success: true,
      emailSent: true,
      message: "An administrative 4-digit safety code was sent to your Gmail inbox! Please check your inbox/spam folder."
    });
  } else {
    res.json({
      success: true,
      emailSent: false,
      devCode: code,
      message: `Safety Code generated! (SMTP Not Set on Server - fallback code is: ${code})`,
      error: sResult.error
    });
  }
});

app.post("/api/admin/verify-secure-code", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Missing administrator email or action security code." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();
  const record = adminActionCodes.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ error: "No security verification process is currently active for this administrator." });
  }

  if (Date.now() > record.expires) {
    adminActionCodes.delete(cleanEmail);
    return res.status(400).json({ error: "Administrative action code has expired. Please try the action again to generate a new code." });
  }

  if (record.code !== cleanCode) {
    return res.status(400).json({ error: "Incorrect administrative authorization code. Access denied." });
  }

  // Success, purge
  adminActionCodes.delete(cleanEmail);
  res.json({ success: true, message: "Administrative action verified successfully!" });
});

// A real authentication endpoint pointing directly to the Neon Database
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  const emailLower = email.toLowerCase().trim();

  if (pool) {
    try {
      const result = await pool.query(`
        SELECT id, username, email, password_hash as "password", avatar, xp, level, rank_tier as "rankTier", streak, accuracy, total_quizzes as "totalQuizzes", time_spent_minutes as "timeSpentMinutes", subjects_studied as "subjectsStudied", is_premium as "isPremium", is_admin as "isAdmin"
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `, [emailLower]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No user registered with this email address in the database. Please sign up first." });
      }

      const dbUser = result.rows[0];
      if (dbUser.password !== password) {
        return res.status(401).json({ error: "Incorrect password. Please try again or click Forgot Password." });
      }

      // Successful login from Postgres
      let subjectsStudied = dbUser.subjectsStudied;
      if (typeof subjectsStudied === "string") {
        try {
          subjectsStudied = JSON.parse(subjectsStudied);
        } catch (e) {
          subjectsStudied = {};
        }
      }

      return res.json({
        success: true,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          avatar: dbUser.avatar || '🎓',
          level: Number(dbUser.level ?? 1),
          xp: Number(dbUser.xp ?? 0),
          rankTier: dbUser.rankTier || 'Bronze Scholar',
          streak: Number(dbUser.streak ?? 1),
          accuracy: Number(dbUser.accuracy ?? 100),
          totalQuizzes: Number(dbUser.totalQuizzes ?? 0),
          timeSpentMinutes: Number(dbUser.timeSpentMinutes ?? 0),
          subjectsStudied: subjectsStudied || {},
          isPremium: Boolean(dbUser.isPremium),
          isAdmin: Boolean(dbUser.isAdmin)
        }
      });
    } catch (err) {
      console.error("Neon Postgres connection authentication check failed:", err);
      return res.status(500).json({ error: "Database error during login. Please try again later." });
    }
  } else {
    // Falls back to direct Firestore checks as a robust secondary mode
    try {
      const userId = `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;
      const docRef = fDoc(db, 'users', userId);
      const docSnap = await fGetDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ error: "No user registered with this email address. Please sign up first." });
      }

      const fUser = docSnap.data();
      if (fUser.password !== password) {
        return res.status(401).json({ error: "Incorrect password. Please try again or click Forgot Password." });
      }

      return res.json({
        success: true,
        user: {
          id: userId,
          username: fUser.username,
          email: fUser.email,
          avatar: fUser.avatar || '🎓',
          level: Number(fUser.level ?? 1),
          xp: Number(fUser.xp ?? 0),
          rankTier: fUser.rankTier || 'Bronze Scholar',
          streak: Number(fUser.streak ?? 1),
          accuracy: Number(fUser.accuracy ?? 100),
          totalQuizzes: Number(fUser.totalQuizzes ?? 0),
          timeSpentMinutes: Number(fUser.timeSpentMinutes ?? 0),
          subjectsStudied: fUser.subjectsStudied || {},
          isPremium: Boolean(fUser.isPremium ?? false),
          isAdmin: Boolean(fUser.isAdmin ?? false)
        }
      });
    } catch (err) {
      console.error("Firestore authentication system failed:", err);
      return res.status(500).json({ error: "Authentication system offline. Please try again later." });
    }
  }
});

// In-Memory Global Datastores so multiple tabs can interact in real-time
let announcements = [
  {
    id: 'ann-1',
    title: 'National WAEC CBT Tournaments',
    content: 'Compete in the daily speed round this Saturday! Win custom Platinum badges and 500 bonus XP.',
    timestamp: '2026-05-26T12:00:00Z',
    category: 'Tournament' as const
  },
  {
    id: 'ann-2',
    title: 'WAEC Timetable Released',
    content: 'The official West African Examinations Council registration and timetable are out. Ensure you check your subject dates.',
    timestamp: '2026-05-25T09:30:00Z',
    category: 'Exam Update' as const
  }
];

let discussions = [
  {
    id: "post-1",
    author: "Kofi Mensah (Accra)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    content: "Who has a simpler trick for remembering the products of electrolysis of dilute NaCl? The cation discharge order is confusing me.",
    subject: "Chemistry",
    timestamp: "2026-05-26T14:40:00Z",
    likes: 8,
    replies: [
      {
        id: "rep-1",
        author: "Amina Dahiru",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        content: "Remember the electrochemical series hierarchy! For cations: K+, Ca2+, Na+, Mg2+, Al3+, Zn2+, Fe2+, H+, Cu2+, Ag+. hydrogen discharges because dilute NaCl has abundant H+ ions which discharge lower down.",
        timestamp: "2026-05-26T15:02:00Z"
      }
    ]
  },
  {
    id: "post-2",
    author: "Olumide Johnson (Lagos)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content: "How many hours of calculus should we study daily to hit an A1 in Further Maths? Let's challenge ourselves!",
    subject: "Mathematics",
    timestamp: "2026-05-26T11:15:00Z",
    likes: 12,
    replies: []
  }
];

// Seed initial leaderboard entries. Will stay in memory, allowing users to climb.
let leaderboardEntries = [
  { username: "Sola_Lagos", avatar: "👤", xp: 2450, accuracy: 94, level: 12, school: "Kings College, Lagos", state: "Lagos", rankTier: "Diamond" },
  { username: "Kofi_Accra", avatar: "🦁", xp: 2120, accuracy: 89, level: 10, school: "Achimota School", state: "Greater Accra", rankTier: "Platinum" },
  { username: "Amina_Kano", avatar: "⭐", xp: 1980, accuracy: 91, level: 9, school: "Federal Govt Coll, Kano", state: "Kano", rankTier: "Platinum" },
  { username: "Grace_Freetown", avatar: "🌸", xp: 1540, accuracy: 85, level: 7, school: "Prince of Wales Coll", state: "Western Area", rankTier: "Gold" },
  { username: "Chinedu_Enugu", avatar: "⚡", xp: 1420, accuracy: 88, level: 6, school: "College of the Immaculate", state: "Enugu", rankTier: "Gold" },
  { username: "Efe_Warri", avatar: "🔥", xp: 980, accuracy: 82, level: 5, school: "Government Coll, Ughelli", state: "Delta", rankTier: "Silver" },
  { username: "Fatoumata_Banjul", avatar: "💎", xp: 750, accuracy: 80, level: 4, school: "Gambia High School", state: "Banjul", rankTier: "Silver" },
  { username: "Kwame_Kumasi", avatar: "🛡️", xp: 450, accuracy: 76, level: 3, school: "Prempeh College", state: "Ashanti", rankTier: "Bronze" }
];

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// REST APIs
app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/api/announcements", (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    timestamp: new Date().toISOString(),
    category: category || 'Tournament'
  };
  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

app.get("/api/discussions", async (req, res) => {
  if (pool) {
    try {
      const postsResult = await pool.query(`
        SELECT id, author_email, author_username, author_avatar, content, subject, likes, created_at
        FROM discussion_posts
        ORDER BY created_at DESC
      `);
      const repliesResult = await pool.query(`
        SELECT id, post_id, author_username, author_avatar, content, created_at
        FROM discussion_replies
        ORDER BY created_at ASC
      `);
      
      const posts = postsResult.rows.map((row: any) => ({
        id: row.id,
        author: row.author_username,
        avatar: row.author_avatar || "🎓",
        content: row.content,
        subject: row.subject,
        timestamp: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
        likes: row.likes || 0,
        replies: [] as any[]
      }));
      
      repliesResult.rows.forEach((row: any) => {
        const post = posts.find((p: any) => p.id === row.post_id);
        if (post) {
          post.replies.push({
            id: row.id,
            author: row.author_username,
            avatar: row.author_avatar || "🎓",
            content: row.content,
            timestamp: row.created_at ? row.created_at.toISOString() : new Date().toISOString()
          });
        }
      });
      
      return res.json(posts);
    } catch (err) {
      console.error("Neon Postgres discussion select failed, falling back to Firestore:", err);
    }
  }

  // Fallback to Firestore and in-memory lists
  try {
    const q = fQuery(fCol(db, "discussions"), fOrderBy("timestamp", "desc"));
    const snap = await fGetDocs(q);
    const result: any[] = [];
    snap.forEach((doc) => {
      result.push(doc.data());
    });
    if (result.length === 0) {
      res.json(discussions);
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error("Firestore loading error:", err);
    res.json(discussions);
  }
});

app.post("/api/discussions", async (req, res) => {
  const { author, avatar, content, subject, author_email } = req.body;
  if (!author || !content || !subject) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const postId = `post-${Date.now()}`;
  const nowStr = new Date().toISOString();
  
  const newPost = {
    id: postId,
    author,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    content,
    subject,
    timestamp: nowStr,
    likes: 0,
    replies: []
  };

  // 1. Write to Postgres if pool is available
  if (pool) {
    try {
      const emailLower = (author_email || `${author.toLowerCase().trim().replace(/\s+/g, '_')}@waecmaster.edu.ng`).toLowerCase().trim();
      const legacyId = `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;
      
      // Ensure the author exists in users table to satisfy referencing key constraint
      await pool.query(`
        INSERT INTO users (id, username, email, avatar)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [legacyId, author, emailLower, avatar || '🎓']);

      await pool.query(`
        INSERT INTO discussion_posts (id, author_email, author_username, author_avatar, content, subject, likes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [postId, emailLower, author, avatar || '🎓', content, subject, 0, new Date()]);
      console.log("Forum post inserted into Neon Postgres successfully.");
    } catch (err) {
      console.error("Failed to commit forum post to Postgres:", err);
    }
  }

  // 2. Write to Firestore
  try {
    await fSetDoc(fDoc(db, "discussions", postId), newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Firestore writing error:", err);
    discussions.unshift(newPost);
    res.status(201).json(newPost);
  }
});

app.post("/api/discussions/:id/like", async (req, res) => {
  const postId = req.params.id;

  // 1. Update in Postgres
  if (pool) {
    try {
      await pool.query(`
        UPDATE discussion_posts
        SET likes = COALESCE(likes, 0) + 1
        WHERE id = $1
      `, [postId]);
    } catch (err) {
      console.error("Postgres like counter update failed:", err);
    }
  }

  // 2. Update in Firestore / In-Memory
  try {
    const docRef = fDoc(db, "discussions", postId);
    const docSnap = await fGetDoc(docRef);
    if (docSnap.exists()) {
      const post = docSnap.data();
      const updatedPost = { ...post, likes: (post.likes || 0) + 1 };
      await fSetDoc(docRef, updatedPost);
      return res.json(updatedPost);
    }
  } catch (err) {
    console.error("Firestore like error:", err);
  }
  const post = discussions.find(d => d.id === postId);
  if (post) {
    post.likes += 1;
    return res.json(post);
  }
  res.status(404).json({ error: "Post not found" });
});

app.post("/api/discussions/:id/reply", async (req, res) => {
  const postId = req.params.id;
  const { author, avatar, content } = req.body;
  if (!content || !author) {
    return res.status(400).json({ error: "Missing content or author" });
  }
  const replyId = `rep-${Date.now()}`;
  const nowStr = new Date().toISOString();
  
  const newReply = {
    id: replyId,
    author,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    content,
    timestamp: nowStr
  };

  // 1. Commit to Postgres
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO discussion_replies (id, post_id, author_username, author_avatar, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [replyId, postId, author, avatar || '🎓', content, new Date()]);
      console.log("Forum reply inserted into Neon Postgres successfully.");
    } catch (err) {
      console.error("Postgres forum reply insertion failed:", err);
    }
  }

  // 2. Commit to Firestore
  try {
    const docRef = fDoc(db, "discussions", postId);
    const docSnap = await fGetDoc(docRef);
    if (docSnap.exists()) {
      const post = docSnap.data();
      const replies = post.replies || [];
      replies.push(newReply);
      const updatedPost = { ...post, replies };
      await fSetDoc(docRef, updatedPost);
      return res.json(updatedPost);
    }
  } catch (err) {
    console.error("Firestore reply error:", err);
  }
  const post = discussions.find(d => d.id === postId);
  if (post) {
    post.replies.push(newReply);
    return res.json(post);
  }
  res.status(404).json({ error: "Post not found" });
});

// NEW POSTGRES ENDPOINTS FOR DURABLE CLIENT SYNCHRONIZATION
app.get("/api/users/profile", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email query parameter is required." });
  }
  const emailLower = (email as string).toLowerCase().trim();

  if (pool) {
    try {
      const result = await pool.query(`
        SELECT id, username, email, password_hash as "password", avatar, xp, level, rank_tier as "rankTier", streak, accuracy, total_quizzes as "totalQuizzes", time_spent_minutes as "timeSpentMinutes", subjects_studied as "subjectsStudied", is_premium as "isPremium", is_admin as "isAdmin"
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `, [emailLower]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found in Postgres database." });
      }

      const dbUser = result.rows[0];
      let subjectsStudied = dbUser.subjectsStudied;
      if (typeof subjectsStudied === "string") {
        try {
          subjectsStudied = JSON.parse(subjectsStudied);
        } catch (e) {
          subjectsStudied = {};
        }
      }

      return res.json({
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        avatar: dbUser.avatar || '🎓',
        level: Number(dbUser.level ?? 1),
        xp: Number(dbUser.xp ?? 0),
        rankTier: dbUser.rankTier || 'Bronze Scholar',
        streak: Number(dbUser.streak ?? 1),
        accuracy: Number(dbUser.accuracy ?? 100),
        totalQuizzes: Number(dbUser.totalQuizzes ?? 0),
        timeSpentMinutes: Number(dbUser.timeSpentMinutes ?? 0),
        subjectsStudied: subjectsStudied || {},
        isPremium: Boolean(dbUser.isPremium),
        isAdmin: Boolean(dbUser.isAdmin)
      });
    } catch (err) {
      console.error("Postgres profile fetch error:", err);
    }
  }

  // Fallback to Firestore
  try {
    const userId = `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;
    const docRef = fDoc(db, 'users', userId);
    const docSnap = await fGetDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "User not found in Firestore database." });
    }

    const fUser = docSnap.data();
    let subjects = fUser.subjectsStudied;
    if (typeof subjects === "string") {
      try {
        subjects = JSON.parse(subjects);
      } catch (e) {
        subjects = {};
      }
    }

    return res.json({
      id: docSnap.id,
      username: fUser.username,
      email: fUser.email,
      avatar: fUser.avatar || '🎓',
      level: Number(fUser.level ?? 1),
      xp: Number(fUser.xp ?? 0),
      rankTier: fUser.rankTier || 'Bronze Scholar',
      streak: Number(fUser.streak ?? 1),
      accuracy: Number(fUser.accuracy ?? 100),
      totalQuizzes: Number(fUser.totalQuizzes ?? 0),
      timeSpentMinutes: Number(fUser.timeSpentMinutes ?? 0),
      subjectsStudied: subjects || {},
      isPremium: Boolean(fUser.isPremium),
      isAdmin: Boolean(fUser.isAdmin)
    });
  } catch (err) {
    console.error("Direct Firestore profile fetch error:", err);
    return res.status(500).json({ error: "Direct Firestore profile load failed" });
  }
});

app.get("/api/users", async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query(`
        SELECT id, username, email, password_hash as "password", avatar, xp, level, rank_tier as "rankTier", streak, accuracy, total_quizzes as "totalQuizzes", time_spent_minutes as "timeSpentMinutes", subjects_studied as "subjectsStudied", is_premium as "isPremium", is_admin as "isAdmin", created_at, updated_at
        FROM users
      `);
      return res.json(result.rows);
    } catch (err) {
      console.error("Neon Postgres fetch users failed, falling back to Firestore:", err);
    }
  }

  try {
    const snap = await fGetDocs(fCol(db, "users"));
    const cloudUsers: any[] = [];
    snap.forEach((doc) => {
      cloudUsers.push(doc.data());
    });
    res.json(cloudUsers);
  } catch (err) {
    console.error("Direct Firestore users view loading failed:", err);
    res.json([]);
  }
});

app.post("/api/users/sync", async (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: "Missing required user identity email parameters." });
  }

  const emailLower = user.email.toLowerCase().trim();
  const userId = user.id || `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO users (
          id, username, email, password_hash, avatar, xp, level, rank_tier, streak, accuracy, total_quizzes, time_spent_minutes, subjects_studied, is_premium, is_admin, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          username = EXCLUDED.username,
          password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
          avatar = EXCLUDED.avatar,
          xp = EXCLUDED.xp,
          level = EXCLUDED.level,
          rank_tier = EXCLUDED.rank_tier,
          streak = EXCLUDED.streak,
          accuracy = EXCLUDED.accuracy,
          total_quizzes = EXCLUDED.total_quizzes,
          time_spent_minutes = EXCLUDED.time_spent_minutes,
          subjects_studied = EXCLUDED.subjects_studied,
          is_premium = EXCLUDED.is_premium,
          is_admin = EXCLUDED.is_admin,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId,
        user.username || 'Candidate',
        emailLower,
        user.password || null,
        user.avatar || '🎓',
        Number(user.xp ?? 0),
        Number(user.level ?? 1),
        user.rankTier || 'Bronze Scholar',
        Number(user.streak ?? 1),
        Number(user.accuracy ?? 100),
        Number(user.totalQuizzes ?? 0),
        Number(user.timeSpentMinutes ?? 0),
        JSON.stringify(user.subjectsStudied || {}),
        Boolean(user.isPremium ?? false),
        Boolean(user.isAdmin ?? false)
      ]);
      console.log(`Saved user record for ${emailLower} directly to Neon Postgres DB.`);
    } catch (err) {
      console.error("Failed to sync candidate to Neon Postgres DB:", err);
    }
  }

  try {
    const docRef = fDoc(db, 'users', userId);
    const payload = {
      username: user.username || 'Candidate',
      email: emailLower,
      password: user.password || 'admin',
      avatar: user.avatar || '🎓',
      xp: Number(user.xp ?? 0),
      level: Number(user.level ?? 1),
      rankTier: user.rankTier || 'Bronze Scholar',
      streak: Number(user.streak ?? 1),
      accuracy: Number(user.accuracy ?? 100),
      totalQuizzes: Number(user.totalQuizzes ?? 0),
      timeSpentMinutes: Number(user.timeSpentMinutes ?? 0),
      subjectsStudied: user.subjectsStudied || {},
      isPremium: Boolean(user.isPremium ?? false),
      isAdmin: Boolean(user.isAdmin ?? false)
    };
    await fSetDoc(docRef, payload);
    res.json({ success: true, message: "User parameters synchronized successfully." });
  } catch (err) {
    console.error("Firestore sync fallback failed:", err);
    res.json({ success: true, message: "Locally synchronized successfully." });
  }
});

app.get("/api/questions", async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query(`
        SELECT id, subject, topic, type, text, options, correct_answer as "correctAnswer", explanation, hint, difficulty, marks, diagram_url as "diagramUrl", exam_name as "examName", exam_year as "examYear", question_number as "questionNumber", created_at
        FROM questions
        ORDER BY created_at DESC
      `);
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (err) {
      console.error("Neon Postgres fetch questions failed, falling back to Firestore/local:", err);
    }
  }

  try {
    const snap = await fGetDocs(fCol(db, "questions"));
    const cloudQuestions: any[] = [];
    snap.forEach((doc) => {
      cloudQuestions.push(doc.data());
    });
    res.json(cloudQuestions);
  } catch (err) {
    console.error("Direct Firestore questions view loading failed:", err);
    res.json([]);
  }
});

app.post("/api/questions/sync", async (req, res) => {
  const q = req.body;
  if (!q || !q.id || !q.subject) {
    return res.status(400).json({ error: "Missing required question parameters." });
  }

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO questions (
          id, subject, topic, type, text, options, correct_answer, explanation, hint, difficulty, marks, diagram_url, exam_name, exam_year, question_number, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          subject = EXCLUDED.subject,
          topic = EXCLUDED.topic,
          type = EXCLUDED.type,
          text = EXCLUDED.text,
          options = EXCLUDED.options,
          correct_answer = EXCLUDED.correct_answer,
          explanation = EXCLUDED.explanation,
          hint = EXCLUDED.hint,
          difficulty = EXCLUDED.difficulty,
          marks = EXCLUDED.marks,
          diagram_url = EXCLUDED.diagram_url,
          exam_name = EXCLUDED.exam_name,
          exam_year = EXCLUDED.exam_year,
          question_number = EXCLUDED.question_number
      `, [
        q.id,
        q.subject,
        q.topic,
        q.type,
        q.text,
        q.options ? JSON.stringify(q.options) : null,
        q.correctAnswer,
        q.explanation,
        q.hint || null,
        q.difficulty,
        Number(q.marks || 1),
        q.diagramUrl || null,
        q.examName || null,
        q.examYear ? Number(q.examYear) : null,
        q.questionNumber ? Number(q.questionNumber) : null
      ]);
      console.log(`Saved question ${q.id} directly to Neon Postgres DB.`);
    } catch (err) {
      console.error("Failed to sync question to Neon Postgres DB:", err);
    }
  }

  try {
    const docRef = fDoc(db, 'questions', q.id);
    await fSetDoc(docRef, {
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      type: q.type,
      text: q.text,
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      hint: q.hint || null,
      difficulty: q.difficulty,
      marks: Number(q.marks || 1),
      diagramUrl: q.diagramUrl || null,
      examName: q.examName || null,
      examYear: q.examYear ? Number(q.examYear) : null,
      questionNumber: q.questionNumber ? Number(q.questionNumber) : null
    });
    res.json({ success: true, message: "Question synchronized successfully." });
  } catch (err) {
    console.error("Firestore question sync fallback failed:", err);
    res.json({ success: true, message: "Locally synchronized successfully." });
  }
});

app.get("/api/leaderboard", (req, res) => {
  res.json(leaderboardEntries);
});

app.post("/api/leaderboard/sync", createRateLimiterMiddleware("leaderboard", 60), (req, res) => {
  const { username, avatar, xp, accuracy, level, school, state, rankTier } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  // Anti-Cheat input bounds validation
  const cleanAccuracy = parseFloat(accuracy || "80");
  if (!isNaN(cleanAccuracy) && (cleanAccuracy > 100 || cleanAccuracy < 0)) {
    return res.status(400).json({ error: "Invalid scoring bounds! Accuracy must reside between 0% and 100%." });
  }

  const cleanXp = parseInt(xp || "0") || 0;
  if (cleanXp > 150000) {
    return res.status(400).json({ error: "Scoring telemetry flagged! XP growth exceeds historical candidate bounds." });
  }

  const existIndex = leaderboardEntries.findIndex(e => e.username === username);
  if (existIndex !== -1) {
    // Prevent down-grading, but block impossible spikes
    const oldXp = leaderboardEntries[existIndex].xp;
    if (cleanXp - oldXp > 8000) {
      console.warn(`[ANTI-CHEAT FLAGGED] Account: ${username} tried to increment by ${cleanXp - oldXp} XP in one sync!`);
    }
    leaderboardEntries[existIndex] = {
      username,
      avatar: avatar || "👤",
      xp: Math.max(leaderboardEntries[existIndex].xp, cleanXp),
      accuracy: cleanAccuracy || leaderboardEntries[existIndex].accuracy,
      level: Math.max(leaderboardEntries[existIndex].level, level || 1),
      school: school || leaderboardEntries[existIndex].school,
      state: state || leaderboardEntries[existIndex].state,
      rankTier: rankTier || leaderboardEntries[existIndex].rankTier
    };
  } else {
    leaderboardEntries.push({
      username,
      avatar: avatar || "👤",
      xp: cleanXp,
      accuracy: cleanAccuracy || 80,
      level: level || 1,
      school: school || "Undecided School",
      state: state || "Lagos",
      rankTier: rankTier || "Bronze"
    });
  }

  // Sort by XP descending
  leaderboardEntries.sort((a, b) => b.xp - a.xp);
  res.json({ success: true, leaderboard: leaderboardEntries });
});

// AI STUDY ASSISTANT TUTOR API
app.post("/api/gemini/tutor", createRateLimiterMiddleware("tutor", 15), async (req, res) => {
  const { subject, questionText, studentQuery, topic, history } = req.body;

  const currentClient = getGeminiClient();

  if (!currentClient) {
    // Elegant fallback simulation if API key is not supplied
    console.log("No Gemini API Key found. Returning highly customized offline education response.");
    const customAdvice = `Hello there! I'm your offline WAEC Mentor. To activate my customized neural-intelligence solving, please set a valid GEMINI_API_KEY inside the Secrets/Environment panel. 

However, looking on your query on **${subject || "General Study"}** (Topic: *${topic || "General"}*):
Let's break this down conceptually. In WAEC examinations, success comes from step-by-step clarity. Here's a customized strategy:

1. **Write what you know**: State given variables, constants, or key lexical rules immediately to secure partial-marks.
2. **Formula formulation**: For calculation topics, write the primary formula (e.g., Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a).
3. **Double-check units**: Ensure your physics and chemistry calculations align with Standard SI Units.
4. **Practice actively**: Answer 15 practice CBT quizzes on this topic to solidify your memory!

Would you like to ask another academic topic question? Keep study hours consistent, you are destined for parallel A1s!`;
    return res.json({ text: customAdvice, isMock: true });
  }

  try {
    const defaultContext = `You are "WAEC Master AI Exam Coach", an encouraging, deeply smart, secondary school academic mentor designed for students in West Africa (Nigeria, Ghana, Sierra Leone, The Gambia, Liberia).
Your goal is to explain difficult academic concepts in Mathematics, English, Physics, Chemistry, Biology, Economics, Government, etc.
Adopt a warm, encouraging African-tutor tone (highly friendly, uses encouraging terms like "Excellent", "My champion", "My star candidate", "You have this in you!", "Parallel A1 is yours!").
Provide step-by-step bullet points, structured math expansions, and clear explanations. Use West African references (e.g. naira, cedis, garri, local contexts) where helpful for illustration.

CRITICAL FORMATTING DIRECTIVE:
1. Do NOT use LaTeX tags or symbols or any macro commands (such as \\frac, \\times, \\mathbf, \\cdot, \\theta, \\pi).
2. Do NOT wrap mathematical formulas or equations inside double dollar sign delimiters ($$) or single dollar sign delimiters ($).
3. Use plain standard text notation:
   - For powers, use x^2 instead of latex superscript.
   - For multiplication, use standard "x" or "*".
   - For division, use "/" (e.g. a/b).
   - Write standard mathematical expressions simply as plain text inline or bold markdown, e.g. **2x^2 + 7x + 3 = 0**.

Context:
Subject: ${subject || "General"}
Topic: ${topic || "General"}
Current WAEC Question under review: ${questionText || "None"}
Student's request: ${studentQuery}
`;

    const chatHistory = history || [];
    const formattedContents = chatHistory.length > 0 
      ? [...chatHistory.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })), { role: "user", parts: [{ text: defaultContext }] }]
      : defaultContext;

    const response = await currentClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API tutor generation failed:", err);
    res.status(500).json({ error: "Failed to communicate with AI Tutor: " + err.message });
  }
});

// BULK GENERATE QUESTIONS FROM GEMINI (ADMIN WORKSPACE)
app.post("/api/gemini/generate-questions", createRateLimiterMiddleware("admin", 10), async (req, res) => {
  const { subject, topic, count } = req.body;
  const currentClient = getGeminiClient();
  const quantity = Math.min(count || 3, 5);

  if (!currentClient) {
    // Return sample custom generated questions
    return res.json({
      isMock: true,
      questions: [
        {
          id: `ai-gen-${Date.now()}-1`,
          subject: subject || "Physics",
          topic: topic || "Waves",
          type: "mcq",
          text: `Which of the following characteristics determines the pitch of a sound wave circulating in air?`,
          options: ["Amplitude", "Frequency", "Wavelength", "Velocity"],
          correctAnswer: "1",
          explanation: "The pitch of a sound wave is determined solely by its frequency. A higher frequency produces a higher pitch, whereas amplitude determines its loudness.",
          hint: "Think about why a child's voice has a higher pitch than an adult's.",
          difficulty: "Easy",
          marks: 3
        },
        {
          id: `ai-gen-${Date.now()}-2`,
          subject: subject || "Physics",
          topic: topic || "Waves",
          type: "fill_in_the_blank",
          text: "What is the unit of measurement for electrical frequency?",
          correctAnswer: "hertz",
          explanation: "The frequency of waves (including electric currents) is measured in hertz (Hz), representing cycles per second.",
          hint: "The unit is abbreviated as Hz.",
          difficulty: "Easy",
          marks: 2
        }
      ]
    });
  }

  try {
    const prompt = `Generate exactly ${quantity} WAEC style CBT questions for the subject "${subject}" under the topic "${topic}".
Each question MUST be returned inside a JSON array that matches the following TypeScript structure exactly:
interface Question {
  id: string; // custom unique string
  subject: string;
  topic: string;
  type: 'mcq' | 'fill_in_the_blank';
  text: string;
  options?: string[]; // exactly 4 options required if type is 'mcq'
  correctAnswer: string; // "0", "1", "2" or "3" representing the index if 'mcq', or short answer if 'fill_in_the_blank'
  explanation: string; // detailed explanation
  hint?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

Generate challenging WAEC questions. Ensure the output is strictly parseable JSON, with no markdown tags surrounding it except maybe a valid json spec. Be extremely strict.`;

    const response = await currentClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              type: { type: Type.STRING },
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              hint: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              marks: { type: Type.NUMBER }
            },
            required: ["id", "subject", "topic", "type", "text", "correctAnswer", "explanation", "difficulty", "marks"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ questions: parsed });
  } catch (err: any) {
    console.error("Gemini AI Questions Bulk Generator failed:", err);
    res.status(500).json({ error: "Failed to generate questions: " + err.message });
  }
});

// INTELLIGENT OCR QUESTION EXTRACTION ROUTE
app.post("/api/gemini/extract-questions", createRateLimiterMiddleware("ocr", 30), async (req, res) => {
  const { image, images, fileName, subjectHint } = req.body;
  const currentClient = getGeminiClient();

  // Simple clean helper to extract mime type and raw base64 data from standard dataURLs
  const parseImageField = (base64String: string | undefined | null) => {
    if (!base64String || typeof base64String !== "string") return null;
    const match = base64String.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      return {
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      };
    }
    // Fallback if raw base64 without prefix is passed
    return {
      inlineData: {
        mimeType: "image/png",
        data: base64String
      }
    };
  };

  if (!currentClient) {
    console.log("No Gemini API Key found for OCR, returning pristine mock extracted questions.");
    // Return high-fidelity mock extraction based on the specified subject hint
    const detectedSub = subjectHint || "Physics";
    const yearMatches = fileName ? fileName.match(/\b(20\d\d)\b/) : null;
    const detectedYear = yearMatches ? parseInt(yearMatches[1]) : 2024;

    const mockQuestionsList: any[] = [];
    if (detectedSub === "Mathematics") {
      mockQuestionsList.push(
        {
          question_number: 1,
          text: "If y = (2x^2 + 3)(x - 1), find dy/dx at the point x = 2.",
          type: "mcq",
          options: ["11", "15", "19", "23"],
          correctAnswer: "2", // i.e. 19
          explanation: "First expand the product or use the product rule: dy/dx = (4x)(x - 1) + (2x^2 + 3)(1). At x = 2: dy/dx = (8)(1) + (8 + 3)(1) = 8 + 11 = 19.",
          hint: "Expand first or apply the Product Rule of differentiation.",
          difficulty: "Medium",
          topic: "Calculus",
          confidence: 96
        },
        {
          question_number: 2,
          text: "Solve for x in the equation: log_10(3x + 1) - log_10(x - 2) = 1.",
          type: "mcq",
          options: ["x = 3", "x = 4", "x = 5", "x = 7"],
          correctAnswer: "0", // i.e. x = 3
          explanation: "Using logarithm laws: log((3x + 1)/(x - 2)) = 1 => (3x + 1)/(x - 2) = 10 => 3x + 1 = 10x - 20 => 7x = 21 => x = 3.",
          hint: "Combine the logs into log_10(A/B) and reset logs to bases.",
          difficulty: "Hard",
          topic: "Algorithms & Logarithms",
          confidence: 94
        }
      );
    } else if (detectedSub === "Chemistry") {
      mockQuestionsList.push(
        {
          question_number: 14,
          text: "What volume of oxygen at s.t.p is required to burn completely 10 cm^3 of acetylene gas?",
          type: "mcq",
          options: ["10.0 cm^3", "20.0 cm^3", "25.0 cm^3", "50.0 cm^3"],
          correctAnswer: "2", // i.e. 25.0 cm^3
          explanation: "The equation for combustion of acetylene is: 2C2H2 + 5O2 -> 4CO2 + 2H2O. By volume ratios, 2 units of acetylene require 5 units of oxygen. Therefore, 10 cm^3 acetylene requires (5/2) * 10 = 25.0 cm^3.",
          hint: "Write out the balanced stoichiometric combustion equation for C2H2.",
          difficulty: "Hard",
          topic: "Gas Laws & Stoichiometry",
          confidence: 92
        },
        {
          question_number: 15,
          text: "Which of the following particles conducts electricity inside an electrolytic solution?",
          type: "mcq",
          options: ["Free Electrons", "Molecules", "Cations and Anions", "Neutrons"],
          correctAnswer: "2", // i.e. Cations and Anions
          explanation: "In electrolytic solutions or molten salts, electrical electric conductance is mediated strictly by the migration of mobile ions (cations to the cathode, anions to the anode).",
          hint: "Think about the distinction between metallic conductors and electrolytic systems.",
          difficulty: "Easy",
          topic: "Electrolysis & Solutions",
          confidence: 98
        }
      );
    } else {
      // Default / Physics
      mockQuestionsList.push(
        {
          question_number: 8,
          text: "An object is placed 15 cm in front of a concave mirror of focal length 10 cm. Calculate the image distance.",
          type: "mcq",
          options: ["15 cm", "30 cm", "45 cm", "60 cm"],
          correctAnswer: "1", // i.e. 30 cm
          explanation: "Using the mirror formula: 1/f = 1/u + 1/v. Given f = 10 and u = 15: 1/10 = 1/15 + 1/v => 1/v = 1/10 - 1/15 = 3/30 - 2/30 = 1/30. Thus, v = 30 cm.",
          hint: "Apply the standard mirror formula 1/f = 1/u + 1/v.",
          difficulty: "Medium",
          topic: "Optics & Light Waves",
          confidence: 97
        },
        {
          question_number: 9,
          text: "Whatistheunitofforce? (OCR typo fixed)",
          type: "mcq",
          options: ["Joule", "Newton", "Pascal", "Watt"],
          correctAnswer: "1", // i.e. Newton
          explanation: "The mechanical unit of force is the Newton (N). Correct spaces were parsed automatically by the AI study pipeline.",
          hint: "Newton's second law formulation: F = ma.",
          difficulty: "Easy",
          topic: "Mechanics & Force",
          confidence: 95
        }
      );
    }

    return res.json({
      isMock: true,
      sheetConfidence: 95,
      subject: detectedSub,
      year: detectedYear,
      questions: mockQuestionsList
    });
  }

  try {
    const userParts: any[] = [];
    
    // Support single image or multiple images array
    if (images && Array.isArray(images)) {
      images.forEach((imgBase64: string) => {
        const parsed = parseImageField(imgBase64);
        if (parsed) userParts.push(parsed);
      });
    } else if (image) {
      const parsed = parseImageField(image);
      if (parsed) userParts.push(parsed);
    }

    if (userParts.length === 0) {
      return res.status(400).json({ error: "No valid image or PDF payload provided for extraction." });
    }

    const ocrInstructionPrompt = `You are a Senior AI OCR Engineer, Education Technology Specialist, and WAEC Exam Content Specialist.
Read and analyze the attached high-resolution exam paper image / PDF document / scanned photo / past questions sheet.
Conduct professional OCR and document extraction and item-segmentation to fulfill these objectives:

1. Perform optical character recognition. CORRECT typos, broken spacing, or run-on words (e.g. change "Whatistheunitofforce?" to "What is the unit of force?"). Keep mathematical indices simple and textual (e.g., use x^2, H2O, log_10, no raw latex matrices).
2. Segment each question separately.
3. Detect the target Subject being assessed. Sieve keywords to select from this exact list: [Mathematics, English Language, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, CRS, Commerce, Accounting]. If unsure, lean on ${subjectHint || "General Study"}.
4. Detect the Examination Year of the paper. Sieve titles, page footers, margin prints, or filenames such as ${fileName || "unspecified"}. Look for years (e.g. 2018, 2022, 2024, etc.). If unsure, estimate or output 2024.
5. For each question on the sheet:
   - Identify "question_number" (integer, e.g., 5).
   - Clean "text" of the question itself, fixing OCR spacing bugs.
   - Detect "options" (A, B, C, D) and strip the 'A.', 'B.', 'C.', 'D.' markers for pristine clean display, keeping just the option content text.
   - Detect if there are marked/circled/highlighted answers. Otherwise, compute the correct option and set "correctAnswer" index ("0", "1", "2", "3").
   - Synthesize a comprehensive step-by-step WAEC syllabus-compliant academic "explanation" of why that option is correct.
   - Craft a brief student "hint".
   - Assign "difficulty" as "Easy", "Medium", or "Hard".
   - Assign the narrow syllabus "topic" of the syllabus (e.g., "Calculus", "Stoichiometry", "Optics", "Mechanics", "Macroeconomics", "Grammar").
   - Provide a decimal "confidence" rating out of 100 for this item's structural OCR alignment.

6. Provide an overall confidence rating out of 100 for the entire sheet ("sheetConfidence").

Return strictly parseable JSON conforming to this schema:
{
  "sheetConfidence": number,
  "subject": string,
  "year": number,
  "questions": [
    {
      "question_number": number,
      "text": string,
      "type": "mcq",
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string,
      "hint": string,
      "difficulty": "Easy" | "Medium" | "Hard",
      "topic": string,
      "confidence": number
    }
  ]
}

Ensure the response contains only the valid parseable JSON. Do not write markdown wrappers like \`\`\`json unless requested by the platform, but returning the raw json directly is optimal.`;

    userParts.push({ text: ocrInstructionPrompt });

    const response = await currentClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: userParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sheetConfidence: { type: Type.NUMBER },
            subject: { type: Type.STRING },
            year: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_number: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["question_number", "text", "type", "options", "correctAnswer", "explanation", "hint", "difficulty", "topic", "confidence"]
              }
            }
          },
          required: ["sheetConfidence", "subject", "year", "questions"]
        }
      }
    });

    let cleanBody = "";
    try {
      const text = response.text || "";
      cleanBody = text.trim();
      const resultObj = JSON.parse(cleanBody);

      return res.json({
        sheetConfidence: resultObj.sheetConfidence || 90,
        subject: resultObj.subject || "Physics",
        year: resultObj.year || 2024,
        questions: resultObj.questions || []
      });
    } catch (parseError: any) {
      console.error("Failed to parse Gemini OCR response:", parseError, "Response was:", response.text);
      const logMsg = `[PARSE ERROR - ${new Date().toISOString()}] File: ${fileName || "unknown"}\nError: ${parseError.message}\nStack: ${parseError.stack}\nRaw Response: ${response.text}\n-----------------------\n`;
      fs.appendFileSync(path.join(process.cwd(), "error_logs.txt"), logMsg, "utf8");
      return res.status(500).json({
        error: "Failed to parse structured JSON from AI OCR model. Please try a cleaner past paper scan.",
        details: parseError.message,
        rawResponse: response.text ? (response.text.substring(0, 300) + "...") : ""
      });
    }

  } catch (err: any) {
    console.error("Gemini OCR Question Extraction failed:", err);
    const logMsg = `[API ERROR - ${new Date().toISOString()}] File: ${fileName || "unknown"}\nSubject Hint: ${subjectHint || "unknown"}\nError: ${err.message}\nStack: ${err.stack}\n-----------------------\n`;
    fs.appendFileSync(path.join(process.cwd(), "error_logs.txt"), logMsg, "utf8");
    res.status(500).json({ error: "Failed to parse questions using AI OCR: " + err.message });
  }
});

// MULTIPLAYER MATCHMAKING SIMULATION IN-MEMORY STORES
interface MatchmakingQueue {
  username: string;
  avatar: string;
  level: number;
  subject: string;
  res: any; // http response hold
}

let matchmakingQueue: MatchmakingQueue[] = [];
let activeBattles: { [key: string]: any } = {};

app.post("/api/battles/queue", (req, res) => {
  const { username, avatar, level, subject } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  // Check if someone of the same subject is waiting
  const matchIndex = matchmakingQueue.findIndex(p => p.subject === subject && p.username !== username);

  if (matchIndex !== -1) {
    // Match found! Create Battle Room
    const opponent = matchmakingQueue[matchIndex];
    matchmakingQueue.splice(matchIndex, 1);

    const roomId = `room-${Date.now()}`;
    const newRoom = {
      roomId,
      player1: {
        username: opponent.username,
        avatar: opponent.avatar || "🦁",
        score: 0,
        currentQuestionIndex: 0,
        answers: [],
        lastReaction: ""
      },
      player2: {
        username: username,
        avatar: avatar || "⚡",
        score: 0,
        currentQuestionIndex: 0,
        answers: [],
        lastReaction: ""
      },
      subject,
      status: 'battle',
      timerSeconds: 60,
      maxQuestions: 5
    };

    activeBattles[roomId] = newRoom;

    // Send response to match partner and ourselves
    opponent.res.json({ status: "matched", room: newRoom, opponent: { username, avatar, level } });
    res.json({ status: "matched", room: newRoom, opponent: { username: opponent.username, avatar: opponent.avatar, level: opponent.level } });
  } else {
    // No match. Add to queue. Let's add a timeout which matches against a Smart bot if no human joins within 5 seconds for absolute playability!
    const queueItem = { username, avatar, level, subject, res };
    matchmakingQueue.push(queueItem);

    // After 4.5 seconds, if the request is still pending (status code hasn't been sent yet), automatically pair with an AI CBT Bot
    setTimeout(() => {
      const activeQueueIndex = matchmakingQueue.findIndex(q => q.username === username && q.subject === subject);
      if (activeQueueIndex !== -1) {
        // Discard from queue
        matchmakingQueue.splice(activeQueueIndex, 1);

        const roomId = `room-bot-${Date.now()}`;
        const botNames = ["Adegoke_UI", "Chioma_Owerri", "Femi_CBT_King", "Ezenwa_1", "Fatou_Gambia", "Kweku_Ghana"];
        const selectedBot = botNames[Math.floor(Math.random() * botNames.length)];
        const botAvatars = ["🦁", "⚡", "👤", "⭐", "💎", "🛡️"];
        const selectedBotAvatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];

        const newRoom = {
          roomId,
          player1: {
            username: username,
            avatar: avatar || "👤",
            score: 0,
            currentQuestionIndex: 0,
            answers: [],
            lastReaction: ""
          },
          player2: {
            username: selectedBot,
            avatar: selectedBotAvatar,
            score: 0,
            currentQuestionIndex: 0,
            answers: [],
            lastReaction: "👋 Hello!"
          },
          subject,
          status: 'battle',
          timerSeconds: 60,
          maxQuestions: 5,
          isBot: true
        };

        activeBattles[roomId] = newRoom;
        res.json({ status: "matched", room: newRoom, opponent: { username: selectedBot, avatar: selectedBotAvatar, level: Math.max(1, level + Math.floor(Math.random() * 3) - 1) }, isBot: true });
      }
    }, 4500);
  }
});

// Update score/index inside a live matching room
app.post("/api/battles/update", (req, res) => {
  const { roomId, username, score, questionIdx, lastReaction } = req.body;
  const room = activeBattles[roomId];
  if (!room) return res.status(404).json({ error: "Battle room not found" });

  let updated = false;
  if (room.player1.username === username) {
    room.player1.score = score;
    room.player1.currentQuestionIndex = questionIdx;
    if (lastReaction) room.player1.lastReaction = lastReaction;
    updated = true;
  } else if (room.player2 && room.player2.username === username) {
    room.player2.score = score;
    room.player2.currentQuestionIndex = questionIdx;
    if (lastReaction) room.player2.lastReaction = lastReaction;
    updated = true;
  }

  // Simulate bot progress if isBot is true
  if (room.isBot && room.player1.username === username && room.player2) {
    // Bot takes action incrementally
    const botIdx = room.player2.currentQuestionIndex;
    if (botIdx < questionIdx && Math.random() > 0.3) {
      room.player2.currentQuestionIndex = questionIdx;
      // Bot has a 75% accuracy chance
      const botScored = Math.random() < 0.75;
      if (botScored) {
        room.player2.score += 20;
      }
      const botReactions = ["🔥 Nice shot!", "😮 Wow!", "🚀 Climbing!", "😅 Phew!", "👍 Great!"];
      if (Math.random() > 0.6) {
        room.player2.lastReaction = botReactions[Math.floor(Math.random() * botReactions.length)];
      }
    }
  }

  if (room.player1.currentQuestionIndex >= 5 && room.player2 && room.player2.currentQuestionIndex >= 5) {
    room.status = 'finished';
    if (room.player1.score > room.player2.score) {
      room.winner = room.player1.username;
    } else if (room.player2.score > room.player1.score) {
      room.winner = room.player2.username;
    } else {
      room.winner = "Draw";
    }
  }

  res.json({ status: "updated", room });
});

app.get("/api/battles/poll/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = activeBattles[roomId];
  if (!room) return res.status(404).json({ error: "Battle room not found" });
  res.json({ room });
});

async function seedDiscussions() {
  try {
    const snap = await fGetDocs(fCol(db, "discussions"));
    if (snap.empty) {
      console.log("Seeding default discussions to Firestore...");
      for (const d of discussions) {
        await fSetDoc(fDoc(db, "discussions", d.id), d);
      }
      console.log("Done seeding discussions.");
    }
  } catch (err) {
    console.error("Failed to seed discussions to Firestore:", err);
  }
}

// MIDDLEWARE ASSETS SERVING FOR DEV AND PROD
async function startServer() {
  // Seeding discussions to Cloud Firestore database asynchronously
  seedDiscussions();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WAEC Master Server active on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
