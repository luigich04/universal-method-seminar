import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface BookingRecord {
  id: string;
  ticketId: string;
  stripeSessionId?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  martialSystem: string;
  experienceLevel: string;
  tierKey: string;
  tierName: string;
  amountPaid: number;
  currency: string;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED" | "CANCELLED";
  paymentMethod: string;
  attended: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Supabase Configuration from Environment Variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseClient && supabaseUrl && supabaseKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn("Supabase Client Notice:", err);
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

// MySQL Pool Configuration from environment variables
const mysqlHost = process.env.MYSQL_HOST || "127.0.0.1";
const mysqlUser = process.env.MYSQL_USER || "root";
const mysqlPassword = process.env.MYSQL_PASSWORD || "";
const mysqlDatabase = process.env.MYSQL_DATABASE || "ums_seminar";
const mysqlPort = Number(process.env.MYSQL_PORT) || 3306;

let pool: mysql.Pool | null = null;

export function getMySQLPool() {
  if (!pool && process.env.MYSQL_HOST) {
    try {
      pool = mysql.createPool({
        host: mysqlHost,
        user: mysqlUser,
        password: mysqlPassword,
        database: mysqlDatabase,
        port: mysqlPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } catch (err) {
      console.warn("MySQL Connection Notice (fallback active):", err);
      pool = null;
    }
  }
  return pool;
}

// ── JSON Fallback Helper ──
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "crm_bookings.json");

// Safe JSON Write Helper (Supports Vercel Read-Only File System & /tmp fallback)
function safeWriteJSON(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (fsErr: any) {
    if (fsErr?.code === "EROFS" || fsErr?.message?.includes("read-only")) {
      try {
        const tmpPath = path.join("/tmp", "crm_bookings.json");
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      } catch (tmpErr) {
        console.warn("Vercel read-only filesystem notice:", tmpErr);
      }
    } else {
      console.warn("FS write notice:", fsErr);
    }
  }
}

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialSeed: BookingRecord[] = [
        {
          id: "seed-1",
          ticketId: "UMS-8492",
          fullName: "Marco Rossi",
          email: "marco.rossi@bjj-academy.it",
          phone: "+39 340 1234567",
          address: "Roma (RM), Italia",
          martialSystem: "BJJ (Brazilian Jiu-Jitsu)",
          experienceLevel: "Advanced / Cintura Nera",
          tierKey: "full",
          tierName: "Full Seminar (2 Days)",
          amountPaid: 140,
          currency: "EUR",
          paymentStatus: "PAID",
          paymentMethod: "stripe_card",
          attended: true,
          notes: "Istruttore cintura nera BJJ. Richiede posto prima fila per riprese video.",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "seed-2",
          ticketId: "UMS-3921",
          fullName: "Alessandro Conti",
          email: "alessandro.conti@gmail.com",
          phone: "+39 335 9876543",
          address: "Milano (MI), Italia",
          martialSystem: "Wing Tsun",
          experienceLevel: "3 - 5 Anni Esperienza",
          tierKey: "day1",
          tierName: "Day 1 Pass — Perceive",
          amountPaid: 80,
          currency: "EUR",
          paymentStatus: "PAID",
          paymentMethod: "google_pay",
          attended: false,
          notes: "Interessato alla biomeccanica di Chris Collins.",
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ];
      safeWriteJSON(DB_FILE, initialSeed);
    }
  } catch (err) {
    console.warn("Directory notice:", err);
  }
}

export function getAllBookingsLocal(): BookingRecord[] {
  ensureDirectoryExists();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as BookingRecord[];
  } catch (err) {
    return [];
  }
}

// ── Async Database Operations (Supabase + MySQL + Local JSON Fallback) ──

export async function getAllBookingsAsync(): Promise<BookingRecord[]> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from("bookings").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          ticketId: r.ticket_id,
          stripeSessionId: r.stripe_session_id || "",
          fullName: r.full_name,
          email: r.email,
          phone: r.phone || "",
          address: r.address || "",
          martialSystem: r.martial_system || "",
          experienceLevel: r.experience_level || "",
          tierKey: r.tier_key,
          tierName: r.tier_name,
          amountPaid: Number(r.amount_paid),
          currency: r.currency || "EUR",
          paymentStatus: r.payment_status || "PAID",
          paymentMethod: r.payment_method || "stripe",
          attended: Boolean(r.attended),
          notes: r.notes || "",
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Supabase query notice:", err);
    }
  }

  const p = getMySQLPool();
  if (p) {
    try {
      const [rows] = await p.query<any[]>(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return rows.map((r) => ({
        id: r.id,
        ticketId: r.ticket_id,
        stripeSessionId: r.stripe_session_id || "",
        fullName: r.full_name,
        email: r.email,
        phone: r.phone || "",
        address: r.address || "",
        martialSystem: r.martial_system || "",
        experienceLevel: r.experience_level || "",
        tierKey: r.tier_key,
        tierName: r.tier_name,
        amountPaid: Number(r.amount_paid),
        currency: r.currency || "EUR",
        paymentStatus: r.payment_status || "PAID",
        paymentMethod: r.payment_method || "stripe",
        attended: Boolean(r.attended),
        notes: r.notes || "",
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
    } catch (err) {
      console.warn("MySQL query notice, using local DB:", err);
    }
  }
  return getAllBookingsLocal();
}

export async function saveBookingAsync(
  record: Partial<BookingRecord> & { email: string }
): Promise<BookingRecord> {
  const ticketId = record.ticketId || `UMS-${Math.floor(1000 + Math.random() * 9000)}`;
  const recordId = record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from("bookings").upsert(
        {
          id: recordId,
          ticket_id: ticketId,
          stripe_session_id: record.stripeSessionId || null,
          full_name: record.fullName || "Partecipante",
          email: record.email,
          phone: record.phone || "",
          address: record.address || "",
          martial_system: record.martialSystem || "BJJ",
          experience_level: record.experienceLevel || "Intermediate",
          tier_key: record.tierKey || "full",
          tier_name: record.tierName || "Full Seminar (2 Days)",
          amount_paid: record.amountPaid !== undefined ? record.amountPaid : 140,
          currency: record.currency || "EUR",
          payment_status: record.paymentStatus || "PAID",
          payment_method: record.paymentMethod || "stripe",
          attended: record.attended ? true : false,
          notes: record.notes || "",
          updated_at: now,
        },
        { onConflict: "ticket_id" }
      );
    } catch (err) {
      console.warn("Supabase upsert notice:", err);
    }
  }

  const p = getMySQLPool();
  if (p) {
    try {
      const query = `
        INSERT INTO bookings 
        (id, ticket_id, stripe_session_id, full_name, email, phone, address, martial_system, experience_level, tier_key, tier_name, amount_paid, currency, payment_status, payment_method, attended, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        full_name=VALUES(full_name), email=VALUES(email), phone=VALUES(phone), notes=VALUES(notes), updated_at=NOW()
      `;
      await p.execute(query, [
        recordId,
        ticketId,
        record.stripeSessionId || null,
        record.fullName || "Partecipante",
        record.email,
        record.phone || "",
        record.address || "",
        record.martialSystem || "BJJ",
        record.experienceLevel || "Intermediate",
        record.tierKey || "full",
        record.tierName || "Full Seminar (2 Days)",
        record.amountPaid !== undefined ? record.amountPaid : 140,
        record.currency || "EUR",
        record.paymentStatus || "PAID",
        record.paymentMethod || "stripe",
        record.attended ? 1 : 0,
        record.notes || "",
      ]);
    } catch (err) {
      console.warn("MySQL insert notice, using local file:", err);
    }
  }

  // Also save locally for 100% data durability
  ensureDirectoryExists();
  const bookings = getAllBookingsLocal();
  const existingIndex = bookings.findIndex((b) => b.ticketId === ticketId);

  const fullRecord: BookingRecord = {
    id: recordId,
    ticketId,
    stripeSessionId: record.stripeSessionId || "",
    fullName: record.fullName || "Partecipante",
    email: record.email,
    phone: record.phone || "",
    address: record.address || "",
    martialSystem: record.martialSystem || "BJJ",
    experienceLevel: record.experienceLevel || "Intermediate",
    tierKey: record.tierKey || "full",
    tierName: record.tierName || "Full Seminar (2 Days)",
    amountPaid: record.amountPaid !== undefined ? record.amountPaid : 140,
    currency: record.currency || "EUR",
    paymentStatus: record.paymentStatus || "PAID",
    paymentMethod: record.paymentMethod || "stripe",
    attended: record.attended !== undefined ? record.attended : false,
    notes: record.notes || "",
    createdAt: record.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    bookings[existingIndex] = fullRecord;
  } else {
    bookings.unshift(fullRecord);
  }
  safeWriteJSON(DB_FILE, bookings);
  return fullRecord;
}

export async function updateBookingNotesAsync(ticketId: string, notes: string) {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from("bookings").update({ notes, updated_at: new Date().toISOString() }).eq("ticket_id", ticketId);
    } catch (err) {
      console.warn("Supabase update notes notice:", err);
    }
  }
  const p = getMySQLPool();
  if (p) {
    try {
      await p.execute("UPDATE bookings SET notes = ? WHERE ticket_id = ?", [notes, ticketId]);
    } catch (err) {
      console.warn("MySQL update notes notice:", err);
    }
  }
  ensureDirectoryExists();
  const bookings = getAllBookingsLocal();
  const index = bookings.findIndex((b) => b.ticketId === ticketId);
  if (index >= 0) {
    bookings[index].notes = notes;
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  }
}

export async function toggleAttendanceAsync(ticketId: string, attended: boolean) {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from("bookings").update({ attended, updated_at: new Date().toISOString() }).eq("ticket_id", ticketId);
    } catch (err) {
      console.warn("Supabase update attendance notice:", err);
    }
  }
  const p = getMySQLPool();
  if (p) {
    try {
      await p.execute("UPDATE bookings SET attended = ? WHERE ticket_id = ?", [attended ? 1 : 0, ticketId]);
    } catch (err) {
      console.warn("MySQL update attendance notice:", err);
    }
  }
  ensureDirectoryExists();
  const bookings = getAllBookingsLocal();
  const index = bookings.findIndex((b) => b.ticketId === ticketId);
  if (index >= 0) {
    bookings[index].attended = attended;
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  }
}

export async function deleteBookingAsync(ticketId: string) {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.from("bookings").delete().eq("ticket_id", ticketId);
    } catch (err) {
      console.warn("Supabase delete notice:", err);
    }
  }
  const p = getMySQLPool();
  if (p) {
    try {
      await p.execute("DELETE FROM bookings WHERE ticket_id = ?", [ticketId]);
    } catch (err) {
      console.warn("MySQL delete notice:", err);
    }
  }
  ensureDirectoryExists();
  let bookings = getAllBookingsLocal();
  bookings = bookings.filter((b) => b.ticketId !== ticketId);
  fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

export async function getCRMStatsAsync() {
  const bookings = await getAllBookingsAsync();
  const paidBookings = bookings.filter((b) => b.paymentStatus === "PAID");

  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalPaidCount = paidBookings.length;
  const maxCapacity = 30;
  const spotsLeft = Math.max(0, maxCapacity - totalPaidCount);

  const fullPassCount = paidBookings.filter((b) => b.tierKey === "full").length;
  const day1Count = paidBookings.filter((b) => b.tierKey === "day1").length;
  const day2Count = paidBookings.filter((b) => b.tierKey === "day2").length;

  return {
    totalRevenue,
    totalPaidCount,
    maxCapacity,
    spotsLeft,
    fullPassCount,
    day1Count,
    day2Count,
  };
}

// Synchronous exports for backwards compatibility
export function getAllBookings() { return getAllBookingsLocal(); }
export function saveBooking(record: any) { saveBookingAsync(record); return record; }
export function updateBookingNotes(ticketId: string, notes: string) { updateBookingNotesAsync(ticketId, notes); return null; }
export function toggleAttendance(ticketId: string, attended: boolean) { toggleAttendanceAsync(ticketId, attended); return null; }
export function deleteBooking(ticketId: string) { deleteBookingAsync(ticketId); return true; }
export function getCRMStats() {
  const bookings = getAllBookingsLocal();
  const paidBookings = bookings.filter((b) => b.paymentStatus === "PAID");
  return {
    totalRevenue: paidBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0),
    totalPaidCount: paidBookings.length,
    maxCapacity: 30,
    spotsLeft: Math.max(0, 30 - paidBookings.length),
    fullPassCount: paidBookings.filter((b) => b.tierKey === "full").length,
    day1Count: paidBookings.filter((b) => b.tierKey === "day1").length,
    day2Count: paidBookings.filter((b) => b.tierKey === "day2").length,
  };
}
