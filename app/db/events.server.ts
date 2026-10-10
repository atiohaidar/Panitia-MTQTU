// app/db/events.server.ts
// Data Access Layer untuk Agenda Pertemuan & Presensi Cepat (Rapid Attendance) MTQ Tel-U 2026

import type {
  CommitteeEvent,
  AttendanceRecord,
  AttendanceCounts,
  EventType,
  TargetAudience,
  EventStatus,
  AttendanceStatus,
  CommitteeRole,
} from "../types/panitia";
import { ensureTablesExist as ensurePanitiaTables } from "./panitia.server";

export interface DbEvent {
  id: string;
  title: string;
  type: string;
  division_id: string | null;
  division_name?: string | null;
  target_audience?: string | null;
  custom_member_ids?: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  description: string | null;
  created_by: string;
  creator_name?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  total_attendees?: number;
  hadir_count?: number;
  izin_count?: number;
  sakit_count?: number;
  alpha_count?: number;
}

export interface DbAttendance {
  id: string;
  event_id: string;
  member_id: string;
  member_name?: string;
  member_nim?: string;
  member_division_id?: string;
  member_division_name?: string;
  member_role?: string;
  status: string;
  notes: string | null;
  recorded_by: string;
  recorded_by_name?: string;
  recorded_at: string;
}

let eventsTablesInitialized = false;

/**
 * Pastikan tabel events dan attendance_records sudah ada di D1 SQLite
 */
export async function ensureEventTablesExist(db: D1Database): Promise<void> {
  if (eventsTablesInitialized) return;

  // Pastikan tabel master divisions & members sudah siap lebih dulu
  await ensurePanitiaTables(db);

  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('PLENO', 'DIVISI')),
        division_id TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        location TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('HADIR', 'IZIN', 'SAKIT', 'ALPHA')),
        notes TEXT,
        recorded_by TEXT NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, member_id)
      )
    `),
  ]);

  // Support custom target audience columns if not present
  try {
    await db.prepare("ALTER TABLE events ADD COLUMN target_audience TEXT DEFAULT 'ALL'").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE events ADD COLUMN custom_member_ids TEXT").run();
  } catch {}

  // Seed awal contoh agenda jika tabel masih kosong
  const existingCount = await db
    .prepare("SELECT COUNT(*) as count FROM events")
    .first<{ count: number }>();

  if (!existingCount || existingCount.count === 0) {
    const adminUser = await db
      .prepare("SELECT id FROM committee_members LIMIT 1")
      .first<{ id: string }>();

    const creatorId = adminUser?.id || "usr-1";

    await db.batch([
      db.prepare(`
        INSERT OR IGNORE INTO events (id, title, type, division_id, date, start_time, end_time, location, description, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        "evt-1",
        "Rapat Pleno 1: Sosialisasi Roadmap & Kick-off",
        "PLENO",
        null,
        "2026-10-18",
        "09:00",
        "12:00",
        "Masjid Syamsul Ulum Tel-U",
        "Pembahasan timeline road to MTQMN 2027, alokasi anggaran, dan perkenalan seluruh panitia.",
        creatorId,
        "UPCOMING"
      ),
      db.prepare(`
        INSERT OR IGNORE INTO events (id, title, type, division_id, date, start_time, end_time, location, description, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        "evt-2",
        "Koordinasi Teknis Lomba & Tata Tertib",
        "DIVISI",
        "acara",
        "2026-10-21",
        "13:30",
        "15:30",
        "Gedung TULT Lt. 6",
        "Finalisasi cabang lomba Tilawah, Tartil, dan Hifzhil Quran beserta kriteria penjurian.",
        creatorId,
        "UPCOMING"
      ),
      db.prepare(`
        INSERT OR IGNORE INTO events (id, title, type, division_id, date, start_time, end_time, location, description, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        "evt-3",
        "Briefing Dokumentasi & Live Streaming IT",
        "DIVISI",
        "broadcasting-it",
        "2026-10-24",
        "16:00",
        "17:30",
        "Lab Multimedia Tel-U",
        "Uji coba switcher video, audio setup, dan kesiapan channel YouTube streaming.",
        creatorId,
        "UPCOMING"
      ),
    ]);
  }

  eventsTablesInitialized = true;
}

export interface EventFilterOptions {
  divisionId?: string;
  type?: string;
  status?: string;
  scope?: "my" | "all";
  user?: {
    id: string;
    divisionId: string | null;
    role: CommitteeRole | string;
  };
  includePast?: boolean;
  onlyPast?: boolean;
  referenceDate?: string; // YYYY-MM-DD
  referenceTime?: string; // HH:mm
}

/**
 * Hitung ringkasan jumlah agenda (Agenda Saya Aktif, Semua Aktif, Riwayat Lewat)
 * Dilakukan dalam 1 query SQL teroptimasi di Cloudflare D1.
 */
export async function getEventSummaryCounts(
  db: D1Database,
  user: { id: string; divisionId: string | null; role: CommitteeRole | string },
  refDate: string,
  refTime: string = "00:00"
): Promise<{ myActive: number; allActive: number; pastCount: number }> {
  await ensureEventTablesExist(db);

  const isLeader = [
    "SUPER_ADMIN",
    "KETUA_PELAKSANA",
    "SEKRETARIS",
    "BENDAHARA",
    "SC",
    "KETUA_DIVISI",
  ].includes(user.role)
    ? 1
    : 0;
  const userDiv = user.divisionId || "__none__";
  const userPattern = `%"${user.id}"%`;

  const query = `
    SELECT
      COUNT(CASE WHEN ((e.status NOT IN ('COMPLETED', 'CANCELLED')) AND (e.date > ? OR (e.date = ? AND (e.end_time IS NULL OR e.end_time >= ?)))) THEN 1 END) as all_active,
      COUNT(CASE WHEN ((e.status = 'COMPLETED') OR (e.date < ? OR (e.date = ? AND e.end_time IS NOT NULL AND e.end_time < ?))) THEN 1 END) as past_count,
      COUNT(CASE WHEN (
        ((e.status NOT IN ('COMPLETED', 'CANCELLED')) AND (e.date > ? OR (e.date = ? AND (e.end_time IS NULL OR e.end_time >= ?))))
        AND (
          (e.type = 'PLENO' AND (e.target_audience = 'ALL' OR e.target_audience IS NULL OR e.target_audience = ''))
          OR (e.division_id IS NOT NULL AND e.division_id = ?)
          OR (e.target_audience = 'LEADERS' AND ? = 1)
          OR (e.custom_member_ids IS NOT NULL AND e.custom_member_ids LIKE ?)
          OR e.created_by = ?
        )
      ) THEN 1 END) as my_active
    FROM events e
  `;

  const res = await db
    .prepare(query)
    .bind(
      refDate, refDate, refTime,
      refDate, refDate, refTime,
      refDate, refDate, refTime, userDiv, isLeader, userPattern, user.id
    )
    .first<{ all_active: number; past_count: number; my_active: number }>();

  return {
    myActive: res?.my_active || 0,
    allActive: res?.all_active || 0,
    pastCount: res?.past_count || 0,
  };
}

/**
 * Ambil daftar agenda pertemuan beserta ringkasan absensinya
 */
export async function getEvents(
  db: D1Database,
  filter?: EventFilterOptions
): Promise<CommitteeEvent[]> {
  await ensureEventTablesExist(db);

  let query = `
    SELECT 
      e.*,
      d.name as division_name,
      m.name as creator_name,
      COUNT(a.id) as total_attendees,
      SUM(CASE WHEN a.status = 'HADIR' THEN 1 ELSE 0 END) as hadir_count,
      SUM(CASE WHEN a.status = 'IZIN' THEN 1 ELSE 0 END) as izin_count,
      SUM(CASE WHEN a.status = 'SAKIT' THEN 1 ELSE 0 END) as sakit_count,
      SUM(CASE WHEN a.status = 'ALPHA' THEN 1 ELSE 0 END) as alpha_count
    FROM events e
    LEFT JOIN divisions d ON e.division_id = d.id
    LEFT JOIN committee_members m ON e.created_by = m.id
    LEFT JOIN attendance_records a ON e.id = a.event_id
  `;

  const whereClauses: string[] = [];
  const params: any[] = [];

  // Filter division & type
  if (filter?.divisionId && filter.divisionId !== "ALL") {
    whereClauses.push("(e.division_id = ? OR e.type = 'PLENO')");
    params.push(filter.divisionId);
  }

  if (filter?.type && filter.type !== "ALL") {
    whereClauses.push("e.type = ?");
    params.push(filter.type);
  }

  if (filter?.status && filter.status !== "ALL") {
    whereClauses.push("e.status = ?");
    params.push(filter.status);
  }

  // Filter date/time: past vs active (hemat D1 & bandwidth: jangan load yang di-hide)
  const refDate = filter?.referenceDate;
  const refTime = filter?.referenceTime || "00:00";

  if (filter?.onlyPast && refDate) {
    whereClauses.push("((e.status = 'COMPLETED') OR (e.date < ? OR (e.date = ? AND e.end_time IS NOT NULL AND e.end_time < ?)))");
    params.push(refDate, refDate, refTime);
  } else if (filter?.includePast === false && refDate) {
    whereClauses.push("((e.status NOT IN ('COMPLETED', 'CANCELLED')) AND (e.date > ? OR (e.date = ? AND (e.end_time IS NULL OR e.end_time >= ?))))");
    params.push(refDate, refDate, refTime);
  }

  // Filter personalization: scope "my" vs "all"
  if (filter?.scope === "my" && filter?.user) {
    const isLeader = [
      "SUPER_ADMIN",
      "KETUA_PELAKSANA",
      "SEKRETARIS",
      "BENDAHARA",
      "SC",
      "KETUA_DIVISI",
    ].includes(filter.user.role)
      ? 1
      : 0;
    const userDiv = filter.user.divisionId || "__none__";
    const userPattern = `%"${filter.user.id}"%`;

    whereClauses.push(`(
      (e.type = 'PLENO' AND (e.target_audience = 'ALL' OR e.target_audience IS NULL OR e.target_audience = ''))
      OR (e.division_id IS NOT NULL AND e.division_id = ?)
      OR (e.target_audience = 'LEADERS' AND ? = 1)
      OR (e.custom_member_ids IS NOT NULL AND e.custom_member_ids LIKE ?)
      OR e.created_by = ?
    )`);
    params.push(userDiv, isLeader, userPattern, filter.user.id);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " GROUP BY e.id ORDER BY e.date ASC, e.start_time ASC";

  let stmt = db.prepare(query);
  if (params.length > 0) {
    stmt = stmt.bind(...params);
  }

  const results = await stmt.all<DbEvent>();
  const rows = results.results || [];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type as EventType,
    divisionId: r.division_id,
    divisionName: r.division_name || (r.type === "PLENO" ? "Seluruh Panitia (Pleno)" : "-"),
    targetAudience: (r.target_audience as any) || (r.type === "DIVISI" ? "DIVISION" : "ALL"),
    customMemberIds: r.custom_member_ids ? JSON.parse(r.custom_member_ids) : [],
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    location: r.location,
    description: r.description,
    createdBy: r.created_by,
    createdByName: r.creator_name || "Panitia",
    status: r.status as EventStatus,
    createdAt: r.created_at,
    attendanceCounts: {
      total: r.total_attendees || 0,
      hadir: r.hadir_count || 0,
      izin: r.izin_count || 0,
      sakit: r.sakit_count || 0,
      alpha: r.alpha_count || 0,
    },
  }));
}

/**
 * Ambil satu event berdasarkan ID
 */
export async function getEventById(db: D1Database, eventId: string): Promise<CommitteeEvent | null> {
  await ensureEventTablesExist(db);

  const query = `
    SELECT 
      e.*,
      d.name as division_name,
      m.name as creator_name,
      COUNT(a.id) as total_attendees,
      SUM(CASE WHEN a.status = 'HADIR' THEN 1 ELSE 0 END) as hadir_count,
      SUM(CASE WHEN a.status = 'IZIN' THEN 1 ELSE 0 END) as izin_count,
      SUM(CASE WHEN a.status = 'SAKIT' THEN 1 ELSE 0 END) as sakit_count,
      SUM(CASE WHEN a.status = 'ALPHA' THEN 1 ELSE 0 END) as alpha_count
    FROM events e
    LEFT JOIN divisions d ON e.division_id = d.id
    LEFT JOIN committee_members m ON e.created_by = m.id
    LEFT JOIN attendance_records a ON e.id = a.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `;

  const r = await db.prepare(query).bind(eventId).first<DbEvent>();
  if (!r) return null;

  return {
    id: r.id,
    title: r.title,
    type: r.type as EventType,
    divisionId: r.division_id,
    divisionName: r.division_name || (r.type === "PLENO" ? "Seluruh Panitia (Pleno)" : "-"),
    targetAudience: (r.target_audience as any) || (r.type === "DIVISI" ? "DIVISION" : "ALL"),
    customMemberIds: r.custom_member_ids ? JSON.parse(r.custom_member_ids) : [],
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    location: r.location,
    description: r.description,
    createdBy: r.created_by,
    createdByName: r.creator_name || "Panitia",
    status: r.status as EventStatus,
    createdAt: r.created_at,
    attendanceCounts: {
      total: r.total_attendees || 0,
      hadir: r.hadir_count || 0,
      izin: r.izin_count || 0,
      sakit: r.sakit_count || 0,
      alpha: r.alpha_count || 0,
    },
  };
}

/**
 * Buat agenda pertemuan baru
 */
export async function createEvent(
  db: D1Database,
  data: {
    title: string;
    type: EventType;
    division_id?: string | null;
    target_audience?: TargetAudience | null;
    custom_member_ids?: string[] | null;
    date: string;
    start_time: string;
    end_time?: string | null;
    location: string;
    description?: string | null;
    created_by: string;
  }
): Promise<CommitteeEvent> {
  await ensureEventTablesExist(db);

  const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const divisionId = data.type === "PLENO" ? null : data.division_id || null;
  const targetAudience = data.target_audience || (data.type === "DIVISI" ? "DIVISION" : "ALL");
  const customMembersJson = data.custom_member_ids ? JSON.stringify(data.custom_member_ids) : null;

  await db
    .prepare(
      `INSERT INTO events (id, title, type, division_id, target_audience, custom_member_ids, date, start_time, end_time, location, description, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING')`
    )
    .bind(
      id,
      data.title,
      data.type,
      divisionId,
      targetAudience,
      customMembersJson,
      data.date,
      data.start_time,
      data.end_time || null,
      data.location,
      data.description || null,
      data.created_by
    )
    .run();

  const created = await getEventById(db, id);
  if (!created) {
    throw new Error("Gagal mengambil event setelah dibuat");
  }
  return created;
}

/**
 * Update data agenda
 */
export async function updateEvent(
  db: D1Database,
  id: string,
  data: {
    title: string;
    type: EventType;
    division_id?: string | null;
    target_audience?: TargetAudience | null;
    custom_member_ids?: string[] | null;
    date: string;
    start_time: string;
    end_time?: string | null;
    location: string;
    description?: string | null;
    status?: EventStatus;
  }
): Promise<void> {
  await ensureEventTablesExist(db);

  const divisionId = data.type === "PLENO" ? null : data.division_id || null;
  const targetAudience = data.target_audience || (data.type === "DIVISI" ? "DIVISION" : "ALL");
  const customMembersJson = data.custom_member_ids ? JSON.stringify(data.custom_member_ids) : null;

  await db
    .prepare(
      `UPDATE events
       SET title = ?, type = ?, division_id = ?, target_audience = ?, custom_member_ids = ?, date = ?, start_time = ?, end_time = ?, location = ?, description = ?, status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      data.title,
      data.type,
      divisionId,
      targetAudience,
      customMembersJson,
      data.date,
      data.start_time,
      data.end_time || null,
      data.location,
      data.description || null,
      data.status || null,
      id
    )
    .run();
}

/**
 * Hapus agenda pertemuan
 */
export async function deleteEvent(db: D1Database, id: string): Promise<void> {
  await ensureEventTablesExist(db);
  await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
}

/**
 * Update status agenda (misal: 'UPCOMING' -> 'IN_PROGRESS' -> 'COMPLETED')
 */
export async function updateEventStatus(
  db: D1Database,
  id: string,
  status: EventStatus
): Promise<void> {
  await ensureEventTablesExist(db);
  await db
    .prepare("UPDATE events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, id)
    .run();
}

/**
 * Ambil daftar anggota yang wajib hadir dalam suatu event + status presensinya
 * (Jika PLENO: seluruh panitia aktif; jika DIVISI: panitia di divisi tersebut)
 */
export async function getAttendanceRoster(
  db: D1Database,
  eventId: string
): Promise<AttendanceRecord[]> {
  await ensureEventTablesExist(db);

  const event = await getEventById(db, eventId);
  if (!event) throw new Error("Agenda tidak ditemukan");

  let membersQuery = `
    SELECT 
      m.id as member_id,
      m.name as member_name,
      m.nim as member_nim,
      m.division_id as member_division_id,
      m.role as member_role,
      d.name as member_division_name,
      a.id as attendance_id,
      a.status as attendance_status,
      a.notes as attendance_notes,
      a.recorded_by,
      a.recorded_at,
      u.name as recorded_by_name
    FROM committee_members m
    LEFT JOIN divisions d ON m.division_id = d.id
    LEFT JOIN attendance_records a ON a.member_id = m.id AND a.event_id = ?
    LEFT JOIN committee_members u ON a.recorded_by = u.id
    WHERE m.is_active = 1
  `;

  const params: any[] = [eventId];

  if (event.targetAudience === "LEADERS") {
    membersQuery += " AND m.role IN ('SUPER_ADMIN', 'KETUA_PELAKSANA', 'SEKRETARIS', 'BENDAHARA', 'SC', 'KETUA_DIVISI')";
  } else if (event.targetAudience === "CUSTOM" && event.customMemberIds && event.customMemberIds.length > 0) {
    const placeholders = event.customMemberIds.map(() => "?").join(",");
    membersQuery += ` AND m.id IN (${placeholders})`;
    params.push(...event.customMemberIds);
  } else if (event.type === "DIVISI" && event.divisionId) {
    membersQuery += " AND m.division_id = ?";
    params.push(event.divisionId);
  }

  membersQuery += " ORDER BY d.id ASC, m.role ASC, m.name ASC";

  const stmt = db.prepare(membersQuery).bind(...params);
  const results = await stmt.all<any>();
  const rows = results.results || [];

  return rows.map((r) => ({
    id: r.attendance_id || `temp-${r.member_id}`,
    eventId: eventId,
    memberId: r.member_id,
    memberName: r.member_name,
    memberNim: r.member_nim,
    memberDivisionId: r.member_division_id,
    memberDivisionName: r.member_division_name,
    memberRole: r.member_role as CommitteeRole,
    status: (r.attendance_status || "HADIR") as AttendanceStatus, // Default ke Hadir untuk Rapid Attendance
    notes: r.attendance_notes || "",
    recordedBy: r.recorded_by || "",
    recordedByName: r.recorded_by_name || "",
    recordedAt: r.recorded_at || "",
  }));
}

/**
 * Simpan hasil presensi cepat (Rapid Attendance Batch Commit)
 */
export async function recordBatchAttendance(
  db: D1Database,
  eventId: string,
  recordedBy: string,
  records: { memberId: string; status: AttendanceStatus; notes?: string }[]
): Promise<{ savedCount: number }> {
  await ensureEventTablesExist(db);

  const statements = [];

  for (const rec of records) {
    const id = `att-${eventId}-${rec.memberId}`;
    statements.push(
      db
        .prepare(
          `INSERT OR REPLACE INTO attendance_records (id, event_id, member_id, status, notes, recorded_by, recorded_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        )
        .bind(id, eventId, rec.memberId, rec.status, rec.notes || null, recordedBy)
    );
  }

  // Otomatis ubah status event menjadi 'COMPLETED' jika presensi disimpan
  statements.push(
    db
      .prepare("UPDATE events SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(eventId)
  );

  if (statements.length > 0) {
    await db.batch(statements);
  }

  return { savedCount: records.length };
}
