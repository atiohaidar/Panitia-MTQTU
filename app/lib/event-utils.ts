// app/lib/event-utils.ts
// Utility perhitungan status dinamis dan formatting agenda kegiatan MTQ Tel-U 2026

import type { CommitteeEvent } from "../types/panitia";

export type EffectiveEventStatus =
  | "ONGOING"
  | "UPCOMING"
  | "PAST_DUE"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Mengambil tanggal (YYYY-MM-DD) dan waktu (HH:mm) resmi Indonesia Barat (WIB, UTC+7).
 * Menjamin konsistensi antara Cloudflare Workers (UTC) dan browser lokal pengguna.
 */
export function getCurrentWibDateTime(now: Date = new Date()): { date: string; time: string } {
  try {
    const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
    const timeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    return { date: dateStr, time: timeStr };
  } catch {
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    };
  }
}

/**
 * Menghitung status efektif agenda secara real-time berdasarkan tanggal & waktu lokal saat ini.
 * Jika waktu sekarang berada di antara startTime dan endTime, maka otomatis berstatus 'ONGOING'.
 */
export function getEventEffectiveStatus(
  ev: CommitteeEvent,
  referenceNow: Date = new Date()
): EffectiveEventStatus {
  // Jika sudah ditandai selesai secara manual / setelah presensi terekap
  if (ev.status === "COMPLETED") return "COMPLETED";
  if (ev.status === "CANCELLED") return "CANCELLED";
  if (ev.status === "IN_PROGRESS") return "ONGOING";

  try {
    const wib = getCurrentWibDateTime(referenceNow);
    const evDate = ev.date;
    const evStartTime = ev.startTime;
    const evEndTime = ev.endTime || "23:59";

    // 1. Tanggal sebelum hari ini -> lewat jadwal
    if (evDate < wib.date) {
      return "PAST_DUE";
    }

    // 2. Tanggal setelah hari ini -> mendatang
    if (evDate > wib.date) {
      return "UPCOMING";
    }

    // 3. Hari ini (evDate === wib.date):
    if (wib.time >= evStartTime && wib.time <= evEndTime) {
      return "ONGOING";
    }

    if (wib.time > evEndTime) {
      return "PAST_DUE";
    }

    return "UPCOMING";
  } catch {
    return "UPCOMING";
  }
}
