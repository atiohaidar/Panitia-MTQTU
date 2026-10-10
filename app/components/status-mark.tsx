/**
 * Status glyph berbasis bintang 8 (Rub el Hizb) — satu keluarga dengan GirihPattern.
 * Pengganti "pill badge" generic: tanpa background, tanpa border, warna hanya di glyph.
 * Bentuk glyph beda per status → tetap terbaca untuk buta warna & print hitam-putih.
 */
export type StatusKind = "diterima" | "menunggu" | "wawancara" | "ditolak" | "draft";

export const STATUS_META: Record<StatusKind, { label: string; color: string; desc: string }> = {
  diterima: { label: "Diterima", color: "text-emerald-600", desc: "Bintang penuh" },
  wawancara: { label: "Jadwal wawancara", color: "text-sky-600", desc: "Bintang + titik tengah" },
  menunggu: { label: "Menunggu review", color: "text-amber-600", desc: "Bintang garis" },
  ditolak: { label: "Ditolak", color: "text-rose-600", desc: "Bintang dicoret" },
  draft: { label: "Draft", color: "text-stone-400", desc: "Bintang putus-putus" },
};

const SQUARE = "3.5,3.5 12.5,3.5 12.5,12.5 3.5,12.5";
const DIAMOND = "8,1.6 14.4,8 8,14.4 1.6,8";

export function StatusGlyph({ status, className = "" }: { status: StatusKind; className?: string }) {
  const filled = status === "diterima";
  const dashed = status === "draft";

  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 ${STATUS_META[status].color} ${className}`}
    >
      <g
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "2 1.6" : undefined}
      >
        <polygon points={SQUARE} />
        <polygon points={DIAMOND} />
      </g>
      {status === "wawancara" && <circle cx="8" cy="8" r="1.9" fill="currentColor" />}
      {status === "ditolak" && (
        <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function StatusMark({
  status,
  label,
  className = "",
}: {
  status: StatusKind;
  /** Override teks label (default dari STATUS_META). */
  label?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-stone-700 ${className}`}>
      <StatusGlyph status={status} />
      {label ?? STATUS_META[status].label}
    </span>
  );
}
