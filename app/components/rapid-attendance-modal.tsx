// app/components/rapid-attendance-modal.tsx
// Modal Presensi Cepat (Option C - Rapid Attendance Hub) MTQ Tel-U 2026

import React, { useState, useMemo } from "react";
import {
  X,
  CheckCheck,
  Search,
  Check,
  CalendarDays,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import type {
  CommitteeEvent,
  AttendanceRecord,
  AttendanceStatus,
  CommitteeRole,
} from "../types/panitia";

interface RapidAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CommitteeEvent;
  initialRoster: AttendanceRecord[];
  onCommit: (
    eventId: string,
    records: { memberId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;
}

const ROLE_DOTS: Record<CommitteeRole, string> = {
  SUPER_ADMIN: "bg-mtq-crimson",
  KETUA_PELAKSANA: "bg-amber-600",
  SEKRETARIS: "bg-indigo-600",
  BENDAHARA: "bg-teal-600",
  SC: "bg-purple-600",
  KETUA_DIVISI: "bg-sky-600",
  ANGGOTA: "bg-stone-300",
};

export function RapidAttendanceModal({
  isOpen,
  onClose,
  event,
  initialRoster,
  onCommit,
}: RapidAttendanceModalProps) {
  // Local state roster so leader can toggle statuses in milliseconds
  const [roster, setRoster] = useState<AttendanceRecord[]>(initialRoster);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Keep roster in sync if initialRoster changes
  React.useEffect(() => {
    setRoster(initialRoster);
  }, [initialRoster]);

  // Realtime counters (must run before any early return)
  const counts = useMemo(() => {
    return {
      total: roster.length,
      hadir: roster.filter((r) => r.status === "HADIR").length,
      izin: roster.filter((r) => r.status === "IZIN").length,
      sakit: roster.filter((r) => r.status === "SAKIT").length,
      alpha: roster.filter((r) => r.status === "ALPHA").length,
    };
  }, [roster]);

  const filteredRoster = useMemo(() => {
    return roster.filter((item) => {
      const matchSearch =
        item.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.memberNim?.includes(searchQuery);
      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [roster, searchQuery, statusFilter]);

  if (!isOpen) return null;

  // Single-tap feature: Mark all attendees as "HADIR"
  const handleMarkAllPresent = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: "HADIR",
      }))
    );
  };

  const handleSetStatus = (memberId: string, newStatus: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.memberId === memberId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleSetNotes = (memberId: string, notes: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.memberId === memberId ? { ...item, notes } : item
      )
    );
  };

  const handleSave = () => {
    onCommit(
      event.id,
      roster.map((r) => ({
        memberId: r.memberId,
        status: r.status,
        notes: r.notes || undefined,
      }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] h-[92vh] sm:h-auto">
        {/* ── Top Header Event Info ─────────────────────────────────── */}
        <div className="border-b border-stone-200 px-5 py-4 bg-stone-50/80 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-rose-50 text-mtq-crimson border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                  {event.type === "PLENO" ? "RAPAT PLENO" : `DIVISI ${event.divisionName || ""}`}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-stone-400" />
                  {event.date}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                  {event.startTime} {event.endTime ? `- ${event.endTime}` : ""}
                </span>
              </div>
              <h2 className="font-serif text-lg font-semibold text-stone-900 leading-snug">
                {event.title}
              </h2>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <span>{event.location}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Sticky Rapid Stat Bar & 1-Click Action ───────────────── */}
          <div className="mt-4 pt-3 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">
                Total: <strong className="text-stone-900">{counts.total}</strong>
              </span>
              <span className="text-stone-300">|</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Hadir: <strong>{counts.hadir}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                Izin: <strong>{counts.izin}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                Sakit: <strong>{counts.sakit}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-800 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                Alpha: <strong>{counts.alpha}</strong>
              </span>
            </div>

            {/* Quick 1-Click Button */}
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="btn btn-secondary btn-sm text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Tandai Semua Hadir</span>
            </button>
          </div>
        </div>

        {/* ── Toolbar Search & Filter ──────────────────────────────── */}
        <div className="px-5 py-2.5 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIM panitia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-[#fafaf9] focus:outline-none focus:border-mtq-crimson"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-medium text-stone-700"
            >
              <option value="ALL">Semua Status ({roster.length})</option>
              <option value="HADIR">Hadir ({counts.hadir})</option>
              <option value="IZIN">Izin ({counts.izin})</option>
              <option value="SAKIT">Sakit ({counts.sakit})</option>
              <option value="ALPHA">Alpha ({counts.alpha})</option>
            </select>
          </div>
        </div>

        {/* ── Roster Table Body ─────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block divide-y divide-stone-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] text-stone-600 font-semibold uppercase text-[10px] sticky top-0 z-10 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-2.5">Panitia</th>
                  <th className="px-4 py-2.5">NIM</th>
                  <th className="px-4 py-2.5">Divisi / Role</th>
                  <th className="px-4 py-2.5 text-center">Status Kehadiran (1-Klik)</th>
                  <th className="px-4 py-2.5">Catatan Izin / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-stone-400">
                      Tidak ada anggota yang cocok dengan kata kunci.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((item) => {
                    const dotColor =
                      ROLE_DOTS[item.memberRole as CommitteeRole] || "bg-stone-300";

                    return (
                      <tr
                        key={item.memberId}
                        className={
                          item.status === "ALPHA"
                            ? "bg-rose-50/40 hover:bg-rose-50/60"
                            : item.status === "IZIN"
                            ? "bg-amber-50/30 hover:bg-amber-50/50"
                            : "hover:bg-stone-50/80 transition"
                        }
                      >
                        {/* Nama */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-stone-900 leading-snug">
                            {item.memberName}
                          </p>
                        </td>

                        {/* NIM */}
                        <td className="px-4 py-3 font-mono text-stone-600">
                          {item.memberNim}
                        </td>

                        {/* Divisi & Role */}
                        <td className="px-4 py-3 text-stone-600">
                          <p className="text-[11px] font-medium text-stone-800">
                            {item.memberDivisionName || "-"}
                          </p>
                          <p className="text-[10px] text-stone-500 inline-flex items-center gap-1 mt-0.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`}
                            />
                            <span>{item.memberRole}</span>
                          </p>
                        </td>

                        {/* 4-Status Quick Toggle Button Group */}
                        <td className="px-4 py-3">
                          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/70 p-0.5 gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleSetStatus(item.memberId, "HADIR")}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                item.status === "HADIR"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(item.memberId, "IZIN")}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                item.status === "IZIN"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Izin
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(item.memberId, "SAKIT")}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                item.status === "SAKIT"
                                  ? "bg-sky-600 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Sakit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(item.memberId, "ALPHA")}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                item.status === "ALPHA"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Alpha
                            </button>
                          </div>
                        </td>

                        {/* Catatan Keterangan */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.notes || ""}
                            onChange={(e) => handleSetNotes(item.memberId, e.target.value)}
                            placeholder={
                              item.status === "IZIN" || item.status === "SAKIT"
                                ? "Tulis alasan..."
                                : "Catatan opsional..."
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400 placeholder:italic placeholder:text-stone-300"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Roster Cards (md:hidden: Jempol-Friendly Full-Width Buttons) */}
          <div className="md:hidden p-3 space-y-3">
            {filteredRoster.length === 0 ? (
              <div className="py-10 text-center text-stone-400">
                <p className="font-semibold text-stone-700">Tidak ada anggota yang cocok</p>
                <p className="text-xs text-stone-400 mt-1">Periksa kata kunci pencarian.</p>
              </div>
            ) : (
              filteredRoster.map((item) => {
                const dotColor =
                  ROLE_DOTS[item.memberRole as CommitteeRole] || "bg-stone-300";

                return (
                  <div
                    key={item.memberId}
                    className={`rounded-xl p-3 border transition ${
                      item.status === "HADIR"
                        ? "bg-emerald-50/30 border-emerald-200"
                        : item.status === "IZIN"
                        ? "bg-amber-50/40 border-amber-200"
                        : item.status === "SAKIT"
                        ? "bg-sky-50/40 border-sky-200"
                        : "bg-white border-stone-200 shadow-2xs"
                    }`}
                  >
                    {/* Header: Nama + Role + NIM */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 text-sm leading-snug truncate">
                          {item.memberName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                          <span className="font-mono text-[11px]">{item.memberNim}</span>
                          <span>·</span>
                          <span className="truncate">{item.memberDivisionName || "Divisi"}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md shrink-0">
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                        {item.memberRole}
                      </span>
                    </div>

                    {/* 4-Status Large Thumb-Friendly Segmented Buttons */}
                    <div className="mt-2.5 grid grid-cols-4 gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item.memberId, "HADIR")}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center min-h-[42px] select-none ${
                          item.status === "HADIR"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-stone-700 hover:bg-stone-200 active:bg-stone-300"
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item.memberId, "IZIN")}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center min-h-[42px] select-none ${
                          item.status === "IZIN"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "text-stone-700 hover:bg-stone-200 active:bg-stone-300"
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item.memberId, "SAKIT")}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center min-h-[42px] select-none ${
                          item.status === "SAKIT"
                            ? "bg-sky-600 text-white shadow-xs"
                            : "text-stone-700 hover:bg-stone-200 active:bg-stone-300"
                        }`}
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item.memberId, "ALPHA")}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center min-h-[42px] select-none ${
                          item.status === "ALPHA"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-stone-700 hover:bg-stone-200 active:bg-stone-300"
                        }`}
                      >
                        Alpha
                      </button>
                    </div>

                    {/* Notes input */}
                    <div className="mt-2">
                      <input
                        type="text"
                        value={item.notes || ""}
                        onChange={(e) => handleSetNotes(item.memberId, e.target.value)}
                        placeholder={
                          item.status === "IZIN" || item.status === "SAKIT"
                            ? "Tulis alasan izin / sakit..."
                            : "Keterangan opsional..."
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-[#fafaf9] focus:outline-none focus:border-stone-400 placeholder:italic text-stone-800"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Footer Actions ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-stone-200 px-4 sm:px-5 py-3 bg-stone-50/70 shrink-0 gap-2.5">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            <span>
              Persentase kehadiran:{" "}
              <strong className="text-stone-900 font-semibold">
                {counts.total > 0
                  ? `${Math.round((counts.hadir / counts.total) * 100)}%`
                  : "0%"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm flex-1 sm:flex-initial min-h-[40px]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm flex-1 sm:flex-initial min-h-[40px]"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Presensi ({counts.hadir})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
