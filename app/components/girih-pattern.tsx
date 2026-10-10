import { useId } from "react";

/**
 * 8-point star (Rub el Hizb) tiling — identitas visual MTQ.
 * Warna ikut `currentColor`, jadi atur lewat text-* di parent.
 * Pakai `fade` untuk efek memudar dari pojok kanan bawah.
 */
export function GirihPattern({
  fade = true,
  className = "",
}: {
  fade?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${fade ? "girih-fade" : ""} ${className}`}
    >
      <defs>
        <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <polygon points="18,18 62,18 62,62 18,62" />
            <polygon points="40,9 71,40 40,71 9,40" />
            <circle cx="40" cy="40" r="9" />
            <path d="M0 0 L9 9 M80 0 L71 9 M0 80 L9 71 M80 80 L71 71" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
