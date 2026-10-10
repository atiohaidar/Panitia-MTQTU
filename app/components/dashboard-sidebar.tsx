// app/components/dashboard-sidebar.tsx
// Sidebar navigasi presisi sesuai contoh dashboard styleguide MTQ Tel-U 2026

import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  X,
  KeyRound,
} from "lucide-react";
import type { AuthUser } from "../types/panitia";

interface DashboardSidebarProps {
  currentUser: AuthUser;
  memberCount: number;
  divisionCount: number;
  eventCount?: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenPasswordModal?: () => void;
}

export function DashboardSidebar({
  currentUser,
  memberCount,
  divisionCount,
  eventCount,
  mobileOpen,
  onCloseMobile,
  onOpenPasswordModal,
}: DashboardSidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const menu = [
    { label: "Ringkasan", icon: LayoutDashboard, to: "/admin" },
    { label: "Panitia", icon: Users, count: memberCount, to: "/admin/panitia" },
    { label: "Divisi", icon: Layers, count: divisionCount, to: "/admin/divisi" },
    { label: "Agenda", icon: CalendarDays, count: eventCount, to: "/admin/agenda" },
    { label: "Dokumen", icon: FileText, to: "/admin/dokumen" },
  ];

  // Inisial nama user (misal Muhammad Raihan -> MR)
  const initials = currentUser.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebarBody = (
    <div className="flex h-full w-full flex-col justify-between bg-white text-stone-900 border-r border-stone-200">
      {/* ── Brand Header ────────────────────────────────────────── */}
      <div>
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo MTQ Tel-U"
              className="h-7 w-7 rounded-full object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-stone-900">MTQ Tel-U 2026</p>
              <p className="text-[11px] text-stone-500">Portal Kepanitiaan</p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-stone-400 hover:text-stone-700 rounded-md"
            aria-label="Tutup menu navigasi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Menu List ───────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 p-2">
          {menu.map((m) => {
            const isActive =
              m.to === "/admin"
                ? pathname === "/admin" || pathname === "/admin/"
                : pathname.startsWith(m.to);

            const Icon = m.icon;

            return (
              <Link
                key={m.label}
                to={m.to}
                onClick={onCloseMobile}
                className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition ${
                  isActive
                    ? "bg-mtq-crimson-50 font-medium text-mtq-crimson-dark"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-mtq-crimson" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-mtq-crimson" : "text-stone-400"
                  }`}
                />
                <span className="flex-1 text-left">{m.label}</span>
                {m.count !== undefined && (
                  <span
                    className={`font-mono text-[11px] ${
                      isActive ? "text-mtq-crimson font-semibold" : "text-stone-400"
                    }`}
                  >
                    {m.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Footer Pengaturan & Profil ───────────────────────────── */}
      <div className="border-t border-stone-200 p-2">
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-100 transition"
        >
          <Settings className="h-4 w-4 text-stone-400" />
          <span>Ganti Kata Sandi</span>
        </button>

        <div className="mt-1 flex items-center justify-between rounded-md p-1.5 hover:bg-stone-50 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mtq-forest text-[11px] font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-stone-900">{currentUser.name}</p>
              <p className="truncate text-[11px] text-stone-500 capitalize">
                {currentUser.role.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>

          <Link
            to="/logout"
            title="Keluar"
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col sticky top-0 h-screen z-30">
        {sidebarBody}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
