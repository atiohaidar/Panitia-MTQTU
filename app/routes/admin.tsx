// app/routes/admin.tsx
// Layout induk untuk area admin panitia dengan autentikasi guard dan sidebar

import React, { useState } from "react";
import { Outlet, useLoaderData, useFetcher, Link } from "react-router";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { PasswordModal } from "../components/password-modal";
import { requireUser, type AuthUser } from "../lib/auth.server";
import {
  getDivisions,
  getMembers,
  updateMemberPassword,
  type DbDivision,
  type DbMember,
} from "../db/panitia.server";

export async function loader({ request }: { request: Request }) {
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  // Wajib login: jika belum login, otomatis redirect ke "/"
  const currentUser = await requireUser(request, db);

  let memberCount = 8;
  let divisionCount = 5;

  if (db) {
    try {
      const [divs, mems] = await Promise.all([getDivisions(db), getMembers(db)]);
      divisionCount = divs.length;
      memberCount = mems.length;
    } catch (e) {
      console.error("Failed to load counts:", e);
    }
  }

  return {
    currentUser,
    memberCount,
    divisionCount,
    isD1Connected: Boolean(db),
  };
}

export async function action({ request }: { request: Request }) {
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  const currentUser = await requireUser(request, db);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "CHANGE_MY_PASSWORD") {
    const newPassword = formData.get("newPassword") as string;
    if (db && newPassword) {
      await updateMemberPassword(db, currentUser.id, newPassword);
      return { success: true, message: "Kata sandi Anda berhasil diperbarui!" };
    }
    return { success: true, message: "Kata sandi berhasil diperbarui (Simulasi)" };
  }

  return { success: false, message: "Aksi tidak dikenal" };
}

export default function AdminLayout() {
  const { currentUser, memberCount, divisionCount, isD1Connected } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleSaveMyPassword = (newPass: string) => {
    fetcher.submit(
      {
        intent: "CHANGE_MY_PASSWORD",
        newPassword: newPass,
      },
      { method: "POST" }
    );
  };

  return (
    <div className="min-h-screen bg-mtq-canvas text-stone-900 flex font-sans">
      {/* ── Sidebar (Presisi sesuai styleguide) ────────────────────── */}
      <DashboardSidebar
        currentUser={currentUser}
        memberCount={memberCount}
        divisionCount={divisionCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenPasswordModal={() => setPasswordModalOpen(true)}
      />

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Outlet
          context={{
            currentUser,
            isD1Connected,
            onToggleMobileSidebar: () => setMobileSidebarOpen(true),
          }}
        />
      </div>

      {/* ── Modal Ganti Password Sendiri ───────────────────────────── */}
      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        targetName={currentUser.name}
        targetNim={currentUser.nim}
        onSave={handleSaveMyPassword}
      />
    </div>
  );
}
