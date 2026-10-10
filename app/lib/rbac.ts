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
