// app/components/bottom-nav.tsx
// Navigasi bawah thumb-friendly khusus layar smartphone (iOS & Android)

import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Layers,
  Menu,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export function MobileBottomNav({ onOpenMobileMenu }: MobileBottomNavProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Sembunyikan bottom bar di layar form penuh agar tidak menutupi aksi form
  if (pathname === "/admin/agenda/baru") {
    return null;
  }

  const navItems = [
    {
      label: "Ringkasan",
      to: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin" || pathname === "/admin/",
    },
    {
      label: "Agenda",
      to: "/admin/agenda",
      icon: CalendarDays,
      isActive: pathname.startsWith("/admin/agenda"),
    },
    {
      label: "Panitia",
      to: "/admin/panitia",
      icon: Users,
      isActive: pathname.startsWith("/admin/panitia"),
    },
    {
      label: "Divisi",
      to: "/admin/divisi",
      icon: Layers,
      isActive: pathname.startsWith("/admin/divisi"),
    },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Ponsel"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center min-h-[46px] rounded-lg transition-colors select-none ${
                item.isActive
                  ? "text-mtq-crimson font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    item.isActive ? "scale-110" : ""
                  }`}
                  strokeWidth={item.isActive ? 2.3 : 1.8}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-mtq-crimson" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Tombol Menu Tambahan / Drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center min-h-[46px] rounded-lg text-stone-500 hover:text-stone-800 transition-colors select-none"
          aria-label="Buka menu lengkap"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[10px] mt-1 tracking-tight">Lainnya</span>
        </button>
      </div>
    </nav>
  );
}
