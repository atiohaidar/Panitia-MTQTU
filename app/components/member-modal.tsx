// app/components/member-modal.tsx
// Modal input & perbarui data panitia MTQ Tel-U 2026

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { Division, CommitteeMember, CommitteeRole } from "../types/panitia";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: CommitteeMember | null;
  divisions: Division[];
  onSave: (data: {
    id?: string;
    nim: string;
    name: string;
    email: string;
    phone: string;
    divisionId: string;
    role: CommitteeRole;
  }) => void;
}

export function MemberModal({
  isOpen,
  onClose,
  editingMember,
  divisions,
  onSave,
}: MemberModalProps) {
  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    email: "",
    phone: "",
    divisionId: divisions[0]?.id || "acara",
    role: "ANGGOTA" as CommitteeRole,
  });

  useEffect(() => {
    if (editingMember) {
      setFormData({
        nim: editingMember.nim,
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        divisionId: editingMember.divisionId,
        role: editingMember.role,
      });
    } else {
      setFormData({
        nim: "",
        name: "",
        email: "",
        phone: "",
        divisionId: divisions[0]?.id || "acara",
        role: "ANGGOTA",
      });
    }
  }, [editingMember, divisions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nim.trim()) return;

    onSave({
      id: editingMember?.id,
      nim: formData.nim.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      divisionId: formData.divisionId,
      role: formData.role,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5 bg-stone-50/70">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">
              {editingMember ? "Perbarui Data Panitia" : "Tambah Panitia Baru"}
            </h3>
            <p className="text-[11px] text-stone-500">
              Lengkapi informasi kepanitiaan dan hak akses peran.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="field-label">NIM *</label>
              <input
                type="text"
                required
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                placeholder="1301220045"
                className="input font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama panitia"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="field-label">Email (Gmail / Opsional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@gmail.com"
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">No. WhatsApp</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="field-label">Divisi *</label>
              <select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                className="input"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="field-label">Role / Jabatan *</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as CommitteeRole })
                }
                className="input"
              >
                <option value="ANGGOTA">Anggota</option>
                <option value="KETUA_DIVISI">Ketua Divisi</option>
                <option value="SC">Steering Committee (SC)</option>
                <option value="SEKRETARIS">Sekretaris</option>
                <option value="BENDAHARA">Bendahara</option>
                <option value="KETUA_PELAKSANA">Ketua Pelaksana</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>

          {!editingMember && (
            <div className="rounded-lg bg-stone-50 border border-stone-200/80 p-2.5 text-[11px] text-stone-500 leading-relaxed">
              Kata sandi awal akun baru adalah <strong>NIM</strong>. Panitia diarahkan untuk segera mengganti kata sandi setelah masuk pertama kali.
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-stone-200 pt-4 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check className="h-3.5 w-3.5" />
              <span>{editingMember ? "Simpan Perubahan" : "Tambah Panitia"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
