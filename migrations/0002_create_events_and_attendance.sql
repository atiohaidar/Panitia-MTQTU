-- Migration: 0002_create_events_and_attendance.sql
-- Inisialisasi Tabel Agenda Acara & Presensi Cepat (Rapid Attendance) MTQ Tel-U 2026

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PLENO', 'DIVISI')),
    division_id TEXT REFERENCES divisions(id),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    location TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL REFERENCES committee_members(id),
    status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES committee_members(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('HADIR', 'IZIN', 'SAKIT', 'ALPHA')),
    notes TEXT,
    recorded_by TEXT NOT NULL REFERENCES committee_members(id),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_division ON events(division_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance_records(member_id);
