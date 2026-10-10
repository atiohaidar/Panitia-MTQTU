// app/components/event-modal.tsx
// Modal input & edit agenda kegiatan / rapat MTQ Tel-U 2026
// Menggunakan komponen terpusat Modal

import React, { useState, useEffect } from "react";
import { Check, Sparkles } from "lucide-react";
import { Modal } from "./ui/modal";
import type { Division, CommitteeEvent, EventType } from "../types/panitia";
import type { UserWithDivision } from "../lib/rbac";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserWithDivision;
  editingEvent: CommitteeEvent | null;
  divisions: Division[];
  onSave: (data: {
    id?: string;
    title: string;
    type: EventType;
    divisionId: string | null;
    date: string;
    startTime: string;
    endTime: string | null;
    location: string;
    description: string | null;
  }) => void;
}

const LOCATION_PRESETS = [
  "Masjid Syamsul Ulum Tel-U",
  "Gedung TULT Lt. 6",
  "Ruang Rapat Direktorat KKA",
  "Online (Google Meet)",
];

export function EventModal({
  isOpen,
  onClose,
  currentUser,
  editingEvent,
  divisions,
  onSave,
}: EventModalProps) {
  const isKadiv = currentUser.role === "KETUA_DIVISI";
  const userDivisionId = currentUser.divisionId || divisions[0]?.id || null;

  const [formData, setFormData] = useState({
    title: "",
    type: (isKadiv ? "DIVISI" : "PLENO") as EventType,
    divisionId: isKadiv ? userDivisionId : null as string | null,
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:30",
    location: "Masjid Syamsul Ulum Tel-U",
    description: "",
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        type: editingEvent.type,
        divisionId: editingEvent.divisionId,
        date: editingEvent.date,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime || "",
        location: editingEvent.location,
        description: editingEvent.description || "",
      });
    } else {
      setFormData({
        title: "",
        type: isKadiv ? "DIVISI" : "PLENO",
        divisionId: isKadiv ? userDivisionId : null,
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "11:30",
        location: "Masjid Syamsul Ulum Tel-U",
        description: "",
      });
    }
  }, [editingEvent, isKadiv, userDivisionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.date) {
      return;
    }

    onSave({
      id: editingEvent?.id,
      title: formData.title.trim(),
      type: formData.type,
      divisionId: formData.type === "PLENO" ? null : formData.divisionId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime?.trim() || null,
      location: formData.location.trim(),
      description: formData.description.trim() || null,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? "Perbarui Agenda Rapat" : "Jadwalkan Agenda Pertemuan"}
      subtitle="Jadwalkan rapat pleno atau koordinasi internal divisi."
      maxWidth="xl"
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
            form="event-form"
            className="btn btn-primary btn-sm"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{editingEvent ? "Simpan Perubahan" : "Jadwalkan Agenda"}</span>
          </button>
        </div>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        {/* Judul Pertemuan */}
        <div className="space-y-1">
          <label className="field-label">Judul Pertemuan / Acara *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Rapat Pleno 1 / Koordinasi Teknis Lomba"
            className="input font-medium"
          />
        </div>

        {/* Tipe Pertemuan (Pleno vs Divisi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="field-label">Tipe Pertemuan *</label>
            {isKadiv ? (
              <div>
                <input
                  type="text"
                  disabled
                  value="Internal Divisi"
                  className="input bg-stone-100 text-stone-600 font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Ketua Divisi hanya dapat menjadwalkan rapat divisinya.
                </p>
              </div>
            ) : (
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as EventType;
                  setFormData({
                    ...formData,
                    type: newType,
                    divisionId: newType === "PLENO" ? null : divisions[0]?.id || null,
                  });
                }}
                className="input font-medium"
              >
                <option value="PLENO">Seluruh Panitia (Pleno)</option>
                <option value="DIVISI">Internal Divisi Tertentu</option>
              </select>
            )}
          </div>

          {/* Target Divisi jika bertipe DIVISI */}
          <div className="space-y-1">
            <label className="field-label">Divisi Peserta</label>
            {formData.type === "PLENO" ? (
              <input
                type="text"
                disabled
                value="Semua Divisi Panitia"
                className="input bg-stone-100 text-stone-400 cursor-not-allowed"
              />
            ) : isKadiv ? (
              <input
                type="text"
                disabled
                value={divisions.find((d) => d.id === userDivisionId)?.name || "Divisi Anda"}
                className="input bg-stone-100 text-stone-700 font-medium cursor-not-allowed"
              />
            ) : (
              <select
                value={formData.divisionId || divisions[0]?.id || ""}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                className="input font-medium"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="field-label">Tanggal Pelaksanaan *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="field-label">Jam Mulai (WIB) *</label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="input font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="field-label">Jam Selesai</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="input font-mono"
            />
          </div>
        </div>

        {/* Lokasi Pertemuan & Presets */}
        <div className="space-y-1.5">
          <label className="field-label">Lokasi / Ruangan Pertemuan *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Nama ruangan, gedung, atau tautan Google Meet"
            className="input"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-stone-400">Pilihan cepat:</span>
            {LOCATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setFormData({ ...formData, location: preset })}
                className="rounded bg-stone-100 hover:bg-stone-200/80 px-2 py-0.5 text-[10px] text-stone-600 transition"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Deskripsi & Pokok Bahasan */}
        <div className="space-y-1">
          <label className="field-label">Agenda / Poin Bahasan</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tuliskan garis besar materi rapat atau perlengkapan yang wajib dibawa peserta..."
            className="input leading-relaxed"
          />
        </div>

        {/* Helper Note */}
        <div className="rounded-lg bg-stone-50 border border-stone-200/80 p-2.5 text-[11px] text-stone-600 leading-relaxed flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Agenda yang dibuat otomatis terhubung ke <strong>Presensi Cepat (Rapid Attendance)</strong>. Saat hari-H pertemuan, pimpinan rapat dapat langsung membuka presensi untuk absensi satu-klik.
          </p>
        </div>
      </form>
    </Modal>
  );
}
