// app/routes/admin.tsx
// Layout induk untuk area admin panitia dengan autentikasi guard dan sidebar

import React, { useState } from "react";
import { Outlet, useLoaderData, useFetcher, Link } from "react-router";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { MobileBottomNav } from "../components/bottom-nav";
import { PasswordModal } from "../components/password-modal";
import { requireUser, type AuthUser } from "../lib/auth.server";
import {
  getDivisions,
  getMembers,
  updateMemberPassword,
  type DbDivision,
  type DbMember,
} from "../db/panitia.server";
import { getEvents } from "../db/events.server";
import { getDb } from "../lib/db.server";
import { useToast } from "../components/ui/toast";

export async function loader({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  let memberCount = 8;
  let divisionCount = 5;
  let eventCount = 3;

  if (db) {
    try {
      const [divs, mems, evts] = await Promise.all([
        getDivisions(db),
        getMembers(db),
        getEvents(db),
      ]);
      divisionCount = divs.length;
      memberCount = mems.length;
      eventCount = evts.length;
    } catch (e) {
      console.error("Failed to load counts in admin:", e);
    }
  }

  return {
    currentUser,
    memberCount,
    divisionCount,
    eventCount,
    isD1Connected: Boolean(db),
  };
}

export async function action({ request }: { request: Request }) {
  const db = await getDb(request);
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
  const { currentUser, memberCount, divisionCount, eventCount, isD1Connected } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const toast = useToast();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const lastHandledData = React.useRef<any>(null);
  React.useEffect(() => {
    if (fetcher.data && fetcher.data !== lastHandledData.current) {
      lastHandledData.current = fetcher.data;
      if (fetcher.data.message) {
        if (fetcher.data.success) {
          toast.success(fetcher.data.message);
        } else {
          toast.error(fetcher.data.message);
        }
      }
    }
  }, [fetcher.data, toast]);

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
        eventCount={eventCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenPasswordModal={() => setPasswordModalOpen(true)}
      />

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-20 md:pb-0">
        <Outlet
          context={{
            currentUser,
            isD1Connected,
            onToggleMobileSidebar: () => setMobileSidebarOpen(true),
          }}
        />
      </div>

      {/* ── Mobile Bottom Navigation Bar (Thumb-Friendly) ───────────── */}
      <MobileBottomNav onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

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
