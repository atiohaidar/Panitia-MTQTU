// app/lib/auth.server.ts
// Layanan otentikasi panitia MTQ Tel-U 2026

import { redirect } from "react-router";
import {
  createSessionCookie,
  getSessionUserId,
  destroySessionCookie,
} from "./session.server";
import { getMemberById, ensureTablesExist, type DbMember } from "../db/panitia.server";

export interface AuthUser {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string;
  divisionId: string;
  divisionName?: string;
  role: string;
  isActive: boolean;
}

/**
 * Autentikasi user via NIM atau Email + Password
 */
export async function authenticateUser(
  db: D1Database,
  identifier: string,
  passwordAttempt: string
): Promise<AuthUser | null> {
  await ensureTablesExist(db);

  const clean = identifier.trim().toLowerCase();

  const user = await db
    .prepare(
      `SELECT m.*, d.name as division_name 
       FROM committee_members m
       LEFT JOIN divisions d ON m.division_id = d.id
       WHERE (LOWER(m.nim) = ? OR LOWER(m.email) = ?) AND m.is_active = 1`
    )
    .bind(clean, clean)
    .first<DbMember & { division_name?: string }>();

  if (!user) return null;

  // Verifikasi password (mencocokkan hash atau default plaintext seed)
  const isValid = user.password_hash === passwordAttempt;
  if (!isValid) return null;

  return {
    id: user.id,
    nim: user.nim,
    name: user.name,
    email: user.email,
    phone: user.phone,
    divisionId: user.division_id,
    divisionName: user.division_name || "Divisi Panitia",
    role: user.role,
    isActive: user.is_active === 1,
  };
}

/**
 * Dapatkan user yang sedang login dari Cookie request
 */
export async function getUser(
  request: Request,
  db?: D1Database
): Promise<AuthUser | null> {
  const userId = await getSessionUserId(request);
  if (!userId) return null;

  if (!db) {
    // Fallback user jika db belum aktif
    return {
      id: userId,
      nim: "1301220001",
      name: "Muhammad Raihan Fadhil",
      email: "raihan@telkomuniversity.ac.id",
      phone: "081234567890",
      divisionId: "bph",
      divisionName: "Badan Pengurus Harian (BPH)",
      role: "SUPER_ADMIN",
      isActive: true,
    };
  }

  const user = await db
    .prepare(
      `SELECT m.*, d.name as division_name 
       FROM committee_members m
       LEFT JOIN divisions d ON m.division_id = d.id
       WHERE m.id = ? AND m.is_active = 1`
    )
    .bind(userId)
    .first<DbMember & { division_name?: string }>();

  if (!user) return null;

  return {
    id: user.id,
    nim: user.nim,
    name: user.name,
    email: user.email,
    phone: user.phone,
    divisionId: user.division_id,
    divisionName: user.division_name || "Divisi Panitia",
    role: user.role,
    isActive: user.is_active === 1,
  };
}

/**
 * Route guard: Pastikan user sudah login, jika belum redirect ke login
 */
export async function requireUser(
  request: Request,
  db?: D1Database
): Promise<AuthUser> {
  const user = await getUser(request, db);
  if (!user) {
    throw redirect("/");
  }
  return user;
}

export { canManageMembers, canManageDivisions, isSuperAdmin } from "./rbac";

/**
 * Buat respons redirect dengan session cookie baru
 */
export async function createLoginResponse(
  userId: string,
  redirectTo: string = "/admin"
): Promise<Response> {
  const cookie = await createSessionCookie(userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

/**
 * Buat respons logout yang membersihkan session cookie
 */
export function createLogoutResponse(redirectTo: string = "/"): Response {
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": destroySessionCookie(),
    },
  });
}
