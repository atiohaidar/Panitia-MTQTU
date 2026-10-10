// app/components/ui/modal.tsx
// Komponen Modal Dialog Terpusat MTQ Tel-U 2026
// Sesuai dengan Sistem Desain Resmi (/styleguide) — Bersih, Terstandarisasi & Aksesibel

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const MAX_WIDTH_CLASSES: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "lg",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Escape)
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth] || "max-w-lg";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        className={`w-full ${maxWidthClass} bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5 bg-stone-50/70 shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="font-semibold text-stone-900 text-sm truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="border-t border-stone-200 bg-stone-50/50 px-5 py-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
