// app/components/division-modal.tsx
// Modal kelola struktur divisi kepanitiaan MTQ Tel-U 2026

import React, { useState, useEffect } from "react";
import { X, Layers, Check } from "lucide-react";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-mtq-crimson flex items-center justify-center border border-rose-200">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs">
                {editingDivision ? "Edit Divisi" : "Tambah Divisi Baru"}
              </h3>
              <p className="text-[10px] text-stone-500">
                Tentukan nama divisi dan lingkup tanggung jawab.
              </p>
            </div>
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

          <div className="flex items-center justify-end gap-2 border-t border-stone-200 pt-3">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check className="h-3.5 w-3.5" />
              <span>{editingDivision ? "Simpan Perubahan" : "Buat Divisi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
