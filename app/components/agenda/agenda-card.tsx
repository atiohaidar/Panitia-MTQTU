// app/components/agenda/agenda-card.tsx
// Komponen Kartu Agenda Pertemuan & Presensi MTQ Tel-U 2026

import React from "react";
import { Link } from "react-router";
import { MapPin, Clock, Edit2, Trash2, CheckCheck, Users } from "lucide-react";
import type { CommitteeEvent } from "../../types/panitia";
import { getEventEffectiveStatus, type EffectiveEventStatus } from "../../lib/event-utils";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatEventDate(dateString: string) {
  const parts = dateString.split("-");
  if (parts.length !== 3) return { day: "00", month: "---", year: "2026" };
  const day = parts[2];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const month = MONTH_NAMES[monthIndex] || "---";
  return { day, month, year: parts[0] };
}

interface AgendaCardProps {
  event: CommitteeEvent;
  isEditable: boolean;
  isTakeable: boolean;
  isLoading?: boolean;
  onDelete: (event: CommitteeEvent) => void;
  onOpenAttendance: (event: CommitteeEvent) => void;
}

export function AgendaCard({
  event: ev,
  isEditable,
  isTakeable,
  isLoading = false,
  onDelete,
  onOpenAttendance,
}: AgendaCardProps) {
  const { day, month } = formatEventDate(ev.date);
  const effectiveStatus = getEventEffectiveStatus(ev);
  const hasAttendance = Boolean(
    ev.attendanceCounts && ev.attendanceCounts.total > 0
  );
  const isOngoing = effectiveStatus === "ONGOING";

  return (
    <div
      className={`bg-white rounded-xl p-4 border transition flex flex-col justify-between ${
        isOngoing
          ? "border-emerald-300 shadow-xs ring-1 ring-emerald-500/15"
          : "border-stone-200 shadow-2xs hover:border-stone-300"
      }`}
    >
      <div>
        {/* Top Row: Date Ribbon + Type Badge + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Date Ribbon sesuai styleguide */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg border px-2 py-1 text-center shrink-0 w-12 ${
                isOngoing
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-mtq-crimson"
              }`}
            >
              <span className="text-base font-bold leading-tight">{day}</span>
              <span
                className={`text-[10px] uppercase font-bold ${
                  isOngoing ? "text-emerald-700" : "text-stone-500"
                }`}
              >
                {month}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    ev.type === "PLENO"
                      ? "bg-rose-50 text-mtq-crimson border border-rose-200"
                      : "bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  {ev.type === "PLENO" ? "PLENO" : `DIVISI ${ev.divisionName || ""}`}
                </span>

                {/* Dynamic Real-time Status Badge */}
                {isOngoing && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                    Sedang berlangsung
                  </span>
                )}

                {effectiveStatus === "COMPLETED" && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" /> Selesai
                  </span>
                )}

                {effectiveStatus === "PAST_DUE" && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 shrink-0" /> Lewat jadwal
                  </span>
                )}

                {effectiveStatus === "UPCOMING" && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 shrink-0" /> Mendatang
                  </span>
                )}

                {effectiveStatus === "CANCELLED" && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" /> Dibatalkan
                  </span>
                )}
              </div>

              <h2 className="font-semibold text-stone-900 text-sm leading-snug">
                {ev.title}
              </h2>
            </div>
          </div>

          {/* Edit & Delete Button */}
          {isEditable && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                to={`/admin/agenda/baru?edit=${ev.id}`}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                title="Edit Agenda"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(ev)}
                className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                title="Hapus Agenda"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Info Jam & Lokasi */}
        <div className="mt-3 space-y-1 text-xs text-stone-600">
          <p className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>
              {ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ""} WIB
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>{ev.location}</span>
          </p>
        </div>

        {/* Deskripsi Singkat */}
        {ev.description && (
          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed bg-[#fafaf9] p-2 rounded-lg border border-stone-100">
            {ev.description}
          </p>
        )}
      </div>

      {/* ── Bottom Section: Presensi Bar & Action Button ── */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        {/* Ringkasan Kehadiran jika ada */}
        {hasAttendance ? (
          <div className="text-xs leading-tight">
            <span className="font-semibold text-stone-900">
              {ev.attendanceCounts?.hadir}/{ev.attendanceCounts?.total} Hadir
            </span>
            <span className="text-[11px] text-stone-500 ml-1.5">
              ({Math.round(((ev.attendanceCounts?.hadir || 0) / (ev.attendanceCounts?.total || 1)) * 100)}%)
            </span>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400">
              <span>{ev.attendanceCounts?.izin} Izin</span>
              <span>·</span>
              <span>{ev.attendanceCounts?.sakit} Sakit</span>
              <span>·</span>
              <span>{ev.attendanceCounts?.alpha} Alpha</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 italic">
            Presensi belum dilakukan
          </div>
        )}

        {/* Tombol Aksi Rapid Attendance */}
        {isTakeable && (
          <button
            type="button"
            onClick={() => onOpenAttendance(ev)}
            disabled={isLoading}
            className={`btn btn-sm ${
              effectiveStatus === "ONGOING" && !hasAttendance
                ? "btn-primary"
                : hasAttendance
                ? "btn-secondary text-stone-700"
                : "btn-primary"
            }`}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>{hasAttendance ? "Ubah Presensi" : "Buka Presensi"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
