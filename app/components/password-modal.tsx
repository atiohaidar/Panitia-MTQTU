// app/components/password-modal.tsx
// Modal ganti dan reset kata sandi panitia

import React, { useState } from "react";
import { X, KeyRound, Eye, EyeOff, Check } from "lucide-react";

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onSave(newPassword.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs">Ganti Kata Sandi</h3>
              <p className="text-[10px] text-stone-500 truncate max-w-[190px]">
                {targetName} ({targetNim})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
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
                className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="field-hint text-[11px]">
              Kata sandi default panitia adalah NIM. Panitia diarahkan segera mengganti dengan kata sandi pribadi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-stone-200 pt-3">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check className="h-3.5 w-3.5" />
              <span>Simpan Sandi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
