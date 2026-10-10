// app/routes/admin.index.tsx
// Halaman Ringkasan Dashboard presisi sesuai contoh styleguide MTQ Tel-U 2026

import React from "react";
import { Link, useLoaderData, useOutletContext } from "react-router";
import { Plus, Bell, Menu, ExternalLink, Calendar, Users, Layers, ChevronRight } from "lucide-react";
import { requireUser, type AuthUser } from "../lib/auth.server";
import { getDivisions, getMembers, type DbDivision, type DbMember } from "../db/panitia.server";

export function meta() {
  return [
    { title: "Ringkasan Kepanitiaan · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Dashboard ringkasan data panitia, kuota divisi, dan agenda MTQ Tel-U 2026.",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  const currentUser = await requireUser(request, db);

  let divisions: DbDivision[] = [];
  let members: DbMember[] = [];

  if (db) {
    try {
      [divisions, members] = await Promise.all([getDivisions(db), getMembers(db)]);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    }
  }

  // Agenda terdekat MTQ Tel-U 2026
  const agendaList = [
    {
      tgl: "17",
      bln: "Okt",
      judul: "Wawancara gelombang 2",
      info: "08.00 · Gedung TULT lt. 6",
    },
    {
      tgl: "20",
      bln: "Okt",
      judul: "Pengumuman kelulusan panitia",
      info: "19.00 · Instagram & portal resmi",
    },
    {
      tgl: "24",
      bln: "Okt",
      judul: "Rapat perdana pleno kepanitiaan",
      info: "13.00 · Masjid Syamsul Ulum Tel-U",
    },
  ];

  return {
    currentUser,
    divisions,
    members,
    agendaList,
    isD1Connected: Boolean(db),
  };
}

export default function AdminIndexPage() {
  const { currentUser, divisions, members, agendaList, isD1Connected } = useLoaderData<typeof loader>();
  const canManage = currentUser.role === "SUPER_ADMIN";
  const { onToggleMobileSidebar } = useOutletContext<{
    onToggleMobileSidebar: () => void;
  }>();

  // Hitung metrik
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.is_active === 1).length;
  const bphAndSc = members.filter(
    (m) =>
      m.role === "SUPER_ADMIN" ||
      m.role === "KETUA_PELAKSANA" ||
      m.role === "SEKRETARIS" ||
      m.role === "BENDAHARA" ||
      m.role === "SC"
  ).length;

  const stats = [
    {
      label: "Total panitia",
      value: totalMembers,
      note: "+8 terdaftar resmi",
    },
    {
      label: "Panitia aktif",
      value: activeMembers,
      note: "100% siap bertugas",
    },
    {
      label: "BPH & Steering Comm.",
      value: bphAndSc,
      note: "Pimpinan inti",
      warn: true,
    },
    {
      label: "Total divisi aktif",
      value: divisions.length,
      note: "Struktur siap",
    },
  ];

  // Kuota per divisi
  const kuotaPerDivisi = divisions.map((d) => {
    const isi = members.filter((m) => m.division_id === d.id).length;
    // Kuota default estimasi
    const kuota = d.id === "bph" ? 5 : d.id === "acara" ? 15 : 10;
    return {
      id: d.id,
      divisi: d.name,
      isi,
      kuota,
    };
  });

  return (
    <div className="flex-1 min-w-0 bg-mtq-canvas">
      {/* ── Top Bar (Sesuai Styleguide) ────────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1 text-stone-500 hover:text-stone-800 rounded-md"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm text-stone-500">
            Panitia <span className="text-stone-300">/</span>{" "}
            <span className="text-stone-900 font-medium">Ringkasan</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isD1Connected ? (
            <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] text-emerald-800">
              d1 database aktif
            </span>
          ) : (
            <span className="rounded border border-dashed border-stone-300 px-1.5 py-0.5 font-mono text-[11px] text-stone-500">
              data contoh
            </span>
          )}
          <button className="btn btn-ghost btn-sm px-2" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className="space-y-5 p-5 max-w-6xl">
        {/* Header Title & Action Button */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
              Ringkasan kepanitiaan
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Monitoring data pendaftar, alokasi divisi, dan agenda persiapan MTQ Tel-U 2026.
            </p>
          </div>
          {canManage ? (
            <Link to="/admin/panitia" className="btn btn-primary">
              <Plus className="h-4 w-4" /> Tambah anggota
            </Link>
          ) : (
            <Link to="/admin/panitia" className="btn btn-secondary">
              Lihat direktori panitia
            </Link>
          )}
        </div>

        {/* ── Stats Grid (Persis Styleguide: gap-px border bg-stone-200) */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-4">
              <p className="text-[13px] text-stone-500">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-stone-900">
                {s.value}
              </p>
              <p
                className={`mt-1 text-xs ${
                  s.warn ? "font-medium text-amber-700" : "text-stone-400"
                }`}
              >
                {s.note}
              </p>
            </div>
          ))}
        </div>

        {/* ── 2-Column Grid (Kuota per divisi + Agenda) ────────────── */}
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          {/* Card Kuota per divisi */}
          <div className="card p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-baseline justify-between border-b border-stone-100 pb-2.5">
              <h2 className="font-semibold text-stone-900 text-sm">Kuota per divisi</h2>
              <p className="text-xs text-stone-400">terisi / estimasi</p>
            </div>
            <ul className="mt-4 space-y-4">
              {kuotaPerDivisi.map((k) => {
                const pct = Math.round((k.isi / k.kuota) * 100);
                const full = k.isi >= k.kuota;
                return (
                  <li key={k.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-stone-700 font-medium text-xs">{k.divisi}</span>
                      <span className="tabular-nums text-stone-500 text-xs">
                        {full && (
                          <span className="mr-2 text-xs font-medium text-emerald-700">Penuh</span>
                        )}
                        {k.isi}/{k.kuota}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          full ? "bg-emerald-600" : "bg-mtq-crimson"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Card Agenda terdekat */}
          <div className="card p-4 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-2.5">
                <h2 className="font-semibold text-stone-900 text-sm">Agenda terdekat</h2>
                <Link
                  to="/admin/panitia"
                  className="text-xs text-stone-400 hover:text-stone-700 transition"
                >
                  Lihat jadwal
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-stone-100">
                {agendaList.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-3 py-3">
                    <div className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-center shrink-0 w-11">
                      <span className="text-sm font-bold text-mtq-crimson leading-tight">
                        {a.tgl}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-stone-500">
                        {a.bln}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 leading-snug">
                        {a.judul}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{a.info}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-stone-100 mt-3 text-center">
              <span className="text-[11px] text-stone-400">
                Semua panitia wajib hadir tepat waktu
              </span>
            </div>
          </div>
        </div>

        {/* ── Panitia Terbaru Table Preview ───────────────────────── */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/50">
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">Panitia Terdaftar Terbaru</h2>
              <p className="text-xs text-stone-500">Daftar panitia aktif di database Cloudflare D1.</p>
            </div>
            <Link
              to="/admin/panitia"
              className="text-xs font-semibold text-mtq-crimson hover:underline flex items-center gap-1"
            >
              <span>Lihat semua panitia</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Panitia</th>
                  <th className="px-4 py-3">NIM</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">No. WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.slice(0, 5).map((m) => {
                  const div = divisions.find((d) => d.id === m.division_id);
                  return (
                    <tr key={m.id} className="hover:bg-stone-50 transition">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        <div>
                          <p>{m.name}</p>
                          <p className="text-[11px] font-normal text-stone-400">
                            {m.email ? m.email : <span className="italic text-stone-300">Tanpa email</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">{m.nim}</td>
                      <td className="px-4 py-3 text-stone-600">{div?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-700 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-stone-400" aria-hidden="true" />
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-500">{m.phone || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
