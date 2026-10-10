// app/lib/rbac.ts
// Role-Based Access Control (RBAC) helpers
// Client-safe (tidak mengandung server code / database / worker bindings)

import type { CommitteeRole } from "../types/panitia";

export interface RoleBearingUser {
  role: CommitteeRole | string;
}

/**
 * Hak akses mengelola panitia (Tambah, Edit, Hapus, Import spreadsheet)
 * Hanya SUPER_ADMIN yang memiliki wewenang
 */
export function canManageMembers(user?: RoleBearingUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN";
}

/**
 * Hak akses mengelola struktur divisi (Tambah, Edit, Hapus divisi)
 * Hanya SUPER_ADMIN yang memiliki wewenang
 */
export function canManageDivisions(user?: RoleBearingUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN";
}

/**
 * Cek apakah user adalah Super Admin
 */
export function isSuperAdmin(user?: RoleBearingUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN";
}

export interface UserWithDivision extends RoleBearingUser {
  id?: string;
  divisionId?: string;
}

/**
 * Hak membuat agenda kegiatan / rapat
 * Seluruh panitia aktif dapat menjadwalkan agenda pertemuan / koordinasi
 */
export function canCreateEvent(user?: UserWithDivision | null): boolean {
  if (!user) return false;
  return true;
}

/**
 * Hak mengedit atau menghapus agenda
 * - SUPER_ADMIN & KETUA_PELAKSANA: berhak mengelola semua agenda
 * - Pembuat agenda (createdBy): selalu berhak mengelola agenda buatannya
 * - KETUA_DIVISI: berhak mengelola agenda divisi yang dipimpinnya
 */
export function canEditEvent(
  user?: UserWithDivision | null,
  event?: { createdBy?: string; divisionId?: string | null; type?: string } | null
): boolean {
  if (!user || !event) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "KETUA_PELAKSANA") return true;
  if (user.id && event.createdBy && user.id === event.createdBy) return true;
  if (user.role === "KETUA_DIVISI" && event.type === "DIVISI" && user.divisionId === event.divisionId) {
    return true;
  }
  return false;
}

/**
 * Hak melakukan presensi / rapid attendance
 * - SUPER_ADMIN & KETUA_PELAKSANA & SEKRETARIS: bebas absen semua rapat
 * - Pembuat agenda (createdBy): berhak mempresensi agenda yang dibuatnya
 * - KETUA_DIVISI: berhak absen rapat divisinya sendiri dan rapat pleno
 */
export function canTakeAttendance(
  user?: UserWithDivision | null,
  event?: { createdBy?: string; divisionId?: string | null; type?: string } | null
): boolean {
  if (!user || !event) return false;
  if (
    user.role === "SUPER_ADMIN" ||
    user.role === "KETUA_PELAKSANA" ||
    user.role === "SEKRETARIS"
  ) {
    return true;
  }
  if (user.id && event.createdBy && user.id === event.createdBy) {
    return true;
  }
  if (user.role === "KETUA_DIVISI") {
    if (event.type === "PLENO") return true;
    if (event.type === "DIVISI" && user.divisionId === event.divisionId) return true;
  }
  return false;
}

/**
 * Hak melihat data sensitif panitia (NIM dan Email)
 * Anggota biasa (role 'ANGGOTA') tidak dapat melihat NIM dan email panitia lain untuk privasi data
 */
export function canViewSensitiveMemberInfo(user?: RoleBearingUser | null): boolean {
  if (!user) return false;
  return user.role !== "ANGGOTA";
}
