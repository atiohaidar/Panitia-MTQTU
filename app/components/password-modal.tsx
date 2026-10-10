// app/components/password-modal.tsx
// Modal ganti dan reset kata sandi panitia
// Menggunakan komponen terpusat Modal

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { Modal } from "./ui/modal";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetNim: string;
  onSave: (newPassword: string) => void;
}

export function PasswordModal({
  isOpen,
  onClose,
  targetName,
  targetNim,
  onSave,
}: PasswordModalProps) {
  const [newPassword, setNewPassword] = useState(targetNim || "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword(targetNim || "");
      setShowPassword(false);
    }
  }, [isOpen, targetNim]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onSave(newPassword.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Kata Sandi"
      subtitle={`${targetName} (${targetNim})`}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            form="password-form"
            className="btn btn-primary btn-sm"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Simpan Sandi</span>
          </button>
        </div>
      }
    >
      <form id="password-form" onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        <div className="space-y-1">
          <label className="field-label">Kata Sandi Baru</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru"
              className="input font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-700 min-w-[40px] justify-center"
              aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="field-hint text-[11px]">
            Kata sandi default panitia adalah NIM. Panitia diarahkan segera mengganti dengan kata sandi pribadi.
          </p>
        </div>
      </form>
    </Modal>
  );
}
