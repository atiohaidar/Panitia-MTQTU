// app/components/ui/confirm-dialog.tsx
// Dialog Konfirmasi Terpusat MTQ Tel-U 2026 (Pengganti window.confirm)
// Desain elegan & konsisten dengan styleguide

import React from "react";
import { Modal } from "./modal";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className={`btn btn-sm ${
              isDanger
                ? "btn-primary bg-rose-600 hover:bg-rose-700 text-white"
                : "btn-primary"
            }`}
          >
            {isDanger && <Trash2 className="h-3.5 w-3.5 mr-1" />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="p-5 flex items-start gap-3.5">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isDanger
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <div className="text-sm text-stone-600 leading-relaxed pt-1">
          {message}
        </div>
      </div>
    </Modal>
  );
}
