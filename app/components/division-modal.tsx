// app/components/division-modal.tsx
// Modal kelola struktur divisi kepanitiaan MTQ Tel-U 2026
// Menggunakan komponen terpusat Modal

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal } from "./ui/modal";
import type { Division } from "../types/panitia";

interface DivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDivision: Division | null;
  onSave: (data: { id?: string; name: string; description: string }) => void;
}

export function DivisionModal({
  isOpen,
  onClose,
  editingDivision,
  onSave,
}: DivisionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingDivision) {
      setName(editingDivision.name);
      setDescription(editingDivision.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [editingDivision]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingDivision?.id,
      name: name.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDivision ? "Edit Divisi" : "Tambah Divisi Baru"}
      subtitle="Tentukan nama divisi dan lingkup tanggung jawab kepanitiaan."
      maxWidth="md"
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
            form="division-form"
            className="btn btn-primary btn-sm"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{editingDivision ? "Simpan Perubahan" : "Buat Divisi"}</span>
          </button>
        </div>
      }
    >
      <form id="division-form" onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        <div className="space-y-1">
          <label className="field-label">Nama Divisi *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Divisi Humas & Sponsorship"
            className="input"
          />
        </div>

        <div className="space-y-1">
          <label className="field-label">Deskripsi Tugas</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ringkasan tanggung jawab operasional divisi..."
            className="input"
          />
        </div>
      </form>
    </Modal>
  );
}
