-- Migration: 0001_initial_panitia_schema.sql
-- Inisialisasi Tabel Divisi dan Panitia MTQ Tel-U 2026

CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color_badge TEXT DEFAULT 'bg-teal-100 text-teal-800 border-teal-200',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Awal Divisi
INSERT OR IGNORE INTO divisions (id, name, description, color_badge) VALUES
('bph', 'Badan Pengurus Harian (BPH)', 'Ketua Pelaksana, Sekretaris, Bendahara, dan pimpinan inti', 'bg-purple-100 text-purple-800 border-purple-200'),
('acara', 'Divisi Acara', 'Rundown, teknis perlombaan, gladi resik, dan tata panggung', 'bg-rose-100 text-rose-800 border-rose-200'),
('pdd', 'Divisi PDD', 'Publikasi, Desain Grafis, Dokumentasi visual & media sosial', 'bg-amber-100 text-amber-800 border-amber-200'),
('broadcasting-it', 'Broadcasting & IT', 'Sistem aplikasi, live streaming YouTube, audio-visual studio', 'bg-sky-100 text-sky-800 border-sky-200'),
('logistik-konsumsi', 'Divisi Logistik & Konsumsi', 'Pengadaan aset perlengkapan, konsumsi panitia, dan kafilah', 'bg-emerald-100 text-emerald-800 border-emerald-200');

-- Seed Data Awal Super Admin Saja
INSERT OR IGNORE INTO committee_members (id, nim, name, email, phone, division_id, role, password_hash, is_active) VALUES
('usr-1', '1301220001', 'Super Admin MTQ', 'admin@telkomuniversity.ac.id', '081234567890', 'bph', 'SUPER_ADMIN', 'mtq2026-admin', 1);
