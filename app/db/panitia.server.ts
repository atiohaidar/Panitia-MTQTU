// app/db/panitia.server.ts
// Service layer untuk Cloudflare D1 Database - MTQ Tel-U 2026

export interface DbDivision {
  id: string;
  name: string;
  description: string;
  color_badge: string;
  created_at: string;
}

export interface DbMember {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string;
  division_id: string;
  role: string;
  password_hash: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

/**
 * Memastikan tabel ada dan terisi seed default jika D1 baru diinisialisasi
 */
export async function ensureTablesExist(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS divisions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color_badge TEXT DEFAULT 'bg-teal-100 text-teal-800 border-teal-200',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS committee_members (
        id TEXT PRIMARY KEY,
        nim TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        division_id TEXT NOT NULL REFERENCES divisions(id),
        role TEXT NOT NULL,
        password_hash TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
  ]);

  // Cek apakah divisions kosong, jika kosong isi default
  const { count } = (await db
    .prepare("SELECT COUNT(*) as count FROM divisions")
    .first<{ count: number }>()) || { count: 0 };

  if (count === 0) {
    await db.batch([
      db.prepare(`
        INSERT OR IGNORE INTO divisions (id, name, description, color_badge) VALUES
        ('bph', 'Badan Pengurus Harian (BPH)', 'Ketua Pelaksana, Sekretaris, Bendahara, dan pimpinan inti', 'bg-purple-100 text-purple-800 border-purple-200'),
        ('acara', 'Divisi Acara', 'Rundown, teknis perlombaan, gladi resik, dan tata panggung', 'bg-rose-100 text-rose-800 border-rose-200'),
        ('pdd', 'Divisi PDD', 'Publikasi, Desain Grafis, Dokumentasi visual & media sosial', 'bg-amber-100 text-amber-800 border-amber-200'),
        ('broadcasting-it', 'Broadcasting & IT', 'Sistem aplikasi, live streaming YouTube, audio-visual studio', 'bg-sky-100 text-sky-800 border-sky-200'),
        ('logistik-konsumsi', 'Divisi Logistik & Konsumsi', 'Pengadaan aset perlengkapan, konsumsi panitia, dan kafilah', 'bg-emerald-100 text-emerald-800 border-emerald-200');
      `),
      db.prepare(`
        INSERT OR IGNORE INTO committee_members (id, nim, name, email, phone, division_id, role, password_hash, is_active) VALUES
        ('usr-1', '1301220001', 'Super Admin MTQ', 'admin@telkomuniversity.ac.id', '081234567890', 'bph', 'SUPER_ADMIN', 'mtq2026-admin', 1);
      `),
    ]);
  }
}

// ── Divisions ────────────────────────────────────────────────────────
export async function getDivisions(db: D1Database): Promise<DbDivision[]> {
  await ensureTablesExist(db);
  const result = await db
    .prepare("SELECT * FROM divisions ORDER BY created_at ASC")
    .all<DbDivision>();
  return result.results || [];
}

export async function createDivision(
  db: D1Database,
  data: { id?: string; name: string; description?: string; color_badge?: string }
): Promise<DbDivision> {
  const id = data.id || `div-${Date.now()}`;
  const badge = data.color_badge || "bg-teal-100 text-teal-800 border-teal-200";
  const desc = data.description || "Divisi kepanitiaan MTQ Tel-U";

  await db
    .prepare(
      "INSERT INTO divisions (id, name, description, color_badge) VALUES (?, ?, ?, ?)"
    )
    .bind(id, data.name, desc, badge)
    .run();

  return {
    id,
    name: data.name,
    description: desc,
    color_badge: badge,
    created_at: new Date().toISOString(),
  };
}

export async function updateDivision(
  db: D1Database,
  id: string,
  data: { name: string; description?: string }
): Promise<void> {
  await db
    .prepare("UPDATE divisions SET name = ?, description = ? WHERE id = ?")
    .bind(data.name, data.description || "", id)
    .run();
}

export async function deleteDivision(db: D1Database, id: string): Promise<boolean> {
  // Cek apakah ada anggota di divisi ini
  const { count } = (await db
    .prepare("SELECT COUNT(*) as count FROM committee_members WHERE division_id = ?")
    .bind(id)
    .first<{ count: number }>()) || { count: 0 };

  if (count > 0) {
    throw new Error(`Divisi tidak bisa dihapus karena masih ada ${count} anggota!`);
  }

  await db.prepare("DELETE FROM divisions WHERE id = ?").bind(id).run();
  return true;
}

// ── Members ──────────────────────────────────────────────────────────
export async function getMembers(db: D1Database): Promise<DbMember[]> {
  await ensureTablesExist(db);
  const result = await db
    .prepare("SELECT * FROM committee_members ORDER BY created_at DESC")
    .all<DbMember>();
  return result.results || [];
}

export async function getMemberById(db: D1Database, id: string): Promise<DbMember | null> {
  await ensureTablesExist(db);
  const result = await db
    .prepare("SELECT * FROM committee_members WHERE id = ?")
    .bind(id)
    .first<DbMember>();
  return result || null;
}

export async function createMember(
  db: D1Database,
  data: {
    nim: string;
    name: string;
    email?: string;
    phone?: string;
    division_id: string;
    role: string;
    password?: string;
  }
): Promise<DbMember> {
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const email = data.email || "";
  const phone = data.phone || "";
  const passwordHash = data.password || data.nim;

  await db
    .prepare(
      `INSERT INTO committee_members (id, nim, name, email, phone, division_id, role, password_hash, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .bind(id, data.nim, data.name, email, phone, data.division_id, data.role, passwordHash)
    .run();

  return {
    id,
    nim: data.nim,
    name: data.name,
    email,
    phone,
    division_id: data.division_id,
    role: data.role,
    password_hash: passwordHash,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateMember(
  db: D1Database,
  id: string,
  data: {
    nim: string;
    name: string;
    email?: string;
    phone?: string;
    division_id: string;
    role: string;
  }
): Promise<void> {
  await db
    .prepare(
      `UPDATE committee_members
       SET nim = ?, name = ?, email = ?, phone = ?, division_id = ?, role = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      data.nim,
      data.name,
      data.email || "",
      data.phone || "",
      data.division_id,
      data.role,
      id
    )
    .run();
}

export async function deleteMember(db: D1Database, id: string): Promise<void> {
  await db.prepare("DELETE FROM committee_members WHERE id = ?").bind(id).run();
}

export async function updateMemberPassword(
  db: D1Database,
  id: string,
  newPassword: string
): Promise<void> {
  await db
    .prepare("UPDATE committee_members SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(newPassword, id)
    .run();
}

/**
 * Batch insert panitia hasil parse spreadsheet
 */
export async function batchInsertMembers(
  db: D1Database,
  members: {
    nim: string;
    name: string;
    email?: string;
    phone?: string;
    division_id: string;
    role: string;
  }[]
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  const statements = [];
  for (const m of members) {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const email = m.email || "";
    const phone = m.phone || "";
    const pass = m.nim; // Default kata sandi adalah NIM

    statements.push(
      db
        .prepare(
          `INSERT OR REPLACE INTO committee_members (id, nim, name, email, phone, division_id, role, password_hash, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
        )
        .bind(id, m.nim, m.name, email, phone, m.division_id, m.role, pass)
    );
  }

  if (statements.length > 0) {
    try {
      await db.batch(statements);
      inserted = statements.length;
    } catch (e: any) {
      errors.push(e?.message || "Gagal menyimpan batch");
    }
  }

  return { inserted, errors };
}
