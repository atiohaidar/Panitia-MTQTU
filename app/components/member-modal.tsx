// app/components/member-modal.tsx
// Modal input & perbarui data panitia MTQ Tel-U 2026
// Menggunakan komponen terpusat Modal

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal } from "./ui/modal";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nim.trim() || !formData.email.trim()) {
      return;
    }

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMember ? "Perbarui Data Panitia" : "Tambah Panitia Baru"}
      subtitle="Lengkapi informasi kepanitiaan dan kredensial akses."
      maxWidth="lg"
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
            form="member-form"
            className="btn btn-primary btn-sm"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{editingMember ? "Simpan Perubahan" : "Tambah Panitia"}</span>
          </button>
        </div>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="field-label">NIM (Default Sandi Awal) *</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="field-label">Email Akun (Wajib Masuk) *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nama@telkomuniversity.ac.id"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            Email di atas digunakan panitia untuk <strong>masuk ke sistem</strong>. Kata sandi default akun baru otomatis menggunakan <strong>NIM</strong> panitia.
          </div>
        )}
      </form>
    </Modal>
  );
}
