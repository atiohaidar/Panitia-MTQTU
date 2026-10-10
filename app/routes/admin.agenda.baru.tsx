// app/routes/admin.agenda.baru.tsx
// Halaman Buat & Edit Agenda Pertemuan MTQ Tel-U 2026
// Mengikuti Sistem Desain Resmi MTQTU (/styleguide) — Anti-AI Slop

import React, { useState, useMemo } from "react";
import { Link, useLoaderData, useActionData, useNavigation, Form, redirect } from "react-router";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import { requireUser } from "../lib/auth.server";
import { getDb } from "../lib/db.server";
import {
  getDivisions,
  getMembers,
  type DbDivision,
  type DbMember,
} from "../db/panitia.server";
import {
  getEventById,
  createEvent,
  updateEvent,
} from "../db/events.server";
import { canCreateEvent, canEditEvent } from "../lib/rbac";
import type {
  Division,
  CommitteeMember,
  CommitteeEvent,
  EventType,
  TargetAudience,
  CommitteeRole,
} from "../types/panitia";

export function meta() {
  return [
    { title: "Buat Agenda Pertemuan · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Jadwalkan rapat pleno, rapat divisi, atau pertemuan koordinasi panitia MTQ Tel-U 2026.",
    },
  ];
}

const LOCATION_PRESETS = [
  "Masjid Syamsul Ulum Tel-U",
  "Gedung TULT Lt. 6",
  "Ruang Rapat Direktorat KKA",
  "Lab Multimedia Tel-U",
  "Plaza Tokong Nanas",
  "Online (Google Meet)",
  "Online (Zoom)",
];

const DURATION_PRESETS = [
  { label: "+30 mnt", minutes: 30 },
  { label: "+45 mnt", minutes: 45 },
  { label: "+1 jam", minutes: 60 },
  { label: "+1.5 jam", minutes: 90 },
  { label: "+2 jam", minutes: 120 },
  { label: "+3 jam", minutes: 180 },
];

const ROLE_LABELS: Record<CommitteeRole, string> = {
  SUPER_ADMIN: "Super Admin",
  KETUA_PELAKSANA: "Ketua Pelaksana",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  SC: "Steering Committee",
  KETUA_DIVISI: "Ketua Divisi",
  ANGGOTA: "Anggota",
};

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const parts = timeStr.split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const totalMinutes = h * 60 + m + minutesToAdd;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export async function loader({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);
  const url = new URL(request.url);
  const editId = url.searchParams.get("edit");

  let divisions: Division[] = [];
  let members: CommitteeMember[] = [];
  let editingEvent: CommitteeEvent | null = null;

  if (db) {
    try {
      const [rawDivs, rawMems] = await Promise.all([
        getDivisions(db),
        getMembers(db),
      ]);

      divisions = rawDivs.map((d: DbDivision) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        colorBadge: d.color_badge,
      }));

      members = rawMems.map((m: DbMember) => ({
        id: m.id,
        nim: m.nim,
        name: m.name,
        email: m.email || "",
        phone: m.phone || "",
        divisionId: m.division_id,
        role: m.role as CommitteeRole,
        isActive: Boolean(m.is_active),
        createdAt: m.created_at,
      }));

      if (editId) {
        editingEvent = await getEventById(db, editId);
      }
    } catch (e) {
      console.error("Loader error in agenda.baru:", e);
    }
  }

  return {
    currentUser,
    divisions,
    members,
    editingEvent,
    isEdit: Boolean(editingEvent),
  };
}

export async function action({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (!db) {
    return { success: true, message: "Aksi disimulasikan (Offline)" };
  }

  try {
    const id = formData.get("id") as string | null;
    const title = (formData.get("title") as string)?.trim();
    let type = formData.get("type") as EventType;
    let divisionId = (formData.get("divisionId") as string) || null;
    let targetAudience = (formData.get("targetAudience") as TargetAudience) || "ALL";
    const customMemberIdsStr = formData.get("customMemberIds") as string | null;
    const customMemberIds = customMemberIdsStr ? JSON.parse(customMemberIdsStr) : [];
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = (formData.get("endTime") as string) || null;
    const location = (formData.get("location") as string)?.trim();
    const onlineUrl = (formData.get("onlineUrl") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!title || !date || !startTime || !location) {
      return { success: false, message: "Mohon lengkapi semua kolom yang bertanda bintang (*)." };
    }

    if (currentUser.role === "KETUA_DIVISI") {
      type = "DIVISI";
      divisionId = currentUser.divisionId;
      targetAudience = "DIVISION";
    }

    if (targetAudience === "DIVISION" && !divisionId) {
      const allDivs = await getDivisions(db);
      divisionId = currentUser.divisionId || (allDivs.length > 0 ? allDivs[0].id : null);
    }

    const finalLocation = onlineUrl ? `${location} (${onlineUrl})` : location;

    if (intent === "UPDATE_EVENT" && id) {
      const existing = await getEventById(db, id);
      if (!existing || !canEditEvent(currentUser, existing)) {
        return { success: false, message: "Akses ditolak: Anda tidak memiliki wewenang mengubah agenda ini." };
      }

      await updateEvent(db, id, {
        title,
        type,
        division_id: divisionId,
        target_audience: targetAudience,
        custom_member_ids: customMemberIds,
        date,
        start_time: startTime,
        end_time: endTime,
        location: finalLocation,
        description,
      });

      return redirect("/admin/agenda");
    } else {
      if (!canCreateEvent(currentUser)) {
        return { success: false, message: "Akses ditolak: Anda tidak memiliki wewenang membuat agenda." };
      }

      await createEvent(db, {
        title,
        type,
        division_id: divisionId,
        target_audience: targetAudience,
        custom_member_ids: customMemberIds,
        date,
        start_time: startTime,
        end_time: endTime,
        location: finalLocation,
        description,
        created_by: currentUser.id,
      });

      return redirect("/admin/agenda");
    }
  } catch (err: any) {
    console.error("Action error in agenda.baru:", err);
    return { success: false, message: err?.message || "Terjadi kesalahan saat menyimpan agenda." };
  }
}

export default function AdminAgendaBaruPage() {
  const { currentUser, divisions, members, editingEvent, isEdit } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const isKadiv = currentUser.role === "KETUA_DIVISI";
  const userDivisionId = currentUser.divisionId || divisions[0]?.id || "";

  const now = new Date();
  const todayStr = formatLocalDate(now);
  const currentTimeStr = formatLocalTime(now);

  const initialDate = editingEvent?.date || todayStr;
  const initialStartTime = editingEvent?.startTime || currentTimeStr;
  const initialEndTime =
    editingEvent?.endTime || addMinutesToTime(initialStartTime, 90);

  // Form states
  const [title, setTitle] = useState(editingEvent?.title || "");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    isKadiv
      ? "DIVISION"
      : editingEvent?.targetAudience || (editingEvent?.type === "DIVISI" ? "DIVISION" : "ALL")
  );
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    editingEvent?.divisionId || (isKadiv ? userDivisionId : divisions[0]?.id || "")
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    editingEvent?.customMemberIds || []
  );

  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [location, setLocation] = useState(editingEvent?.location || "Masjid Syamsul Ulum Tel-U");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [description, setDescription] = useState(editingEvent?.description || "");

  // Member search for custom audience
  const [memberSearch, setMemberSearch] = useState("");

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDate(formatLocalDate(d));
  };

  const handleSetStartNow = () => {
    const nowTime = formatLocalTime(new Date());
    setStartTime(nowTime);
    setEndTime(addMinutesToTime(nowTime, 90));
  };

  const handleApplyDuration = (minutes: number) => {
    setEndTime(addMinutesToTime(startTime, minutes));
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = memberSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.nim.includes(q) ||
        (m.role && m.role.toLowerCase().includes(q))
      );
    });
  }, [members, memberSearch]);

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredMembers.map((m) => m.id);
    const combined = Array.from(new Set([...selectedMemberIds, ...filteredIds]));
    setSelectedMemberIds(combined);
  };

  const handleClearSelection = () => {
    setSelectedMemberIds([]);
  };

  const estimatedParticipantCount = useMemo(() => {
    if (targetAudience === "ALL") return members.length;
    if (targetAudience === "DIVISION") {
      return members.filter((m) => m.divisionId === selectedDivisionId).length;
    }
    if (targetAudience === "LEADERS") {
      return members.filter(
        (m) =>
          m.role === "SUPER_ADMIN" ||
          m.role === "KETUA_PELAKSANA" ||
          m.role === "SEKRETARIS" ||
          m.role === "BENDAHARA" ||
          m.role === "SC" ||
          m.role === "KETUA_DIVISI"
      ).length;
    }
    if (targetAudience === "CUSTOM") {
      return selectedMemberIds.length;
    }
    return 0;
  }, [targetAudience, members, selectedDivisionId, selectedMemberIds]);

  return (
    <div className="flex-1 min-w-0 bg-mtq-canvas min-h-screen pb-24 sm:pb-12">
      {/* ── Sub-Nav Bar (Clean & Grounded) ─────────────────────────── */}
      <div className="border-b border-stone-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/admin/agenda"
              className="btn btn-ghost btn-sm -ml-2 text-stone-600"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Link>
            <span className="text-stone-300">/</span>
            <p className="text-sm font-medium text-stone-900">
              {isEdit ? "Perbarui agenda" : "Buat agenda baru"}
            </p>
          </div>

          <span className="text-xs text-stone-500 font-mono">
            {date === todayStr ? "pelaksanaan hari ini" : "terjadwal"}
          </span>
        </div>
      </div>

      {/* ── Main Form Area ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-6">
        <Form method="post" className="card overflow-hidden">
          <input
            type="hidden"
            name="intent"
            value={isEdit ? "UPDATE_EVENT" : "CREATE_EVENT"}
          />
          {isEdit && editingEvent && <input type="hidden" name="id" value={editingEvent.id} />}
          <input
            type="hidden"
            name="type"
            value={targetAudience === "DIVISION" ? "DIVISI" : "PLENO"}
          />
          <input
            type="hidden"
            name="divisionId"
            value={targetAudience === "DIVISION" ? selectedDivisionId : ""}
          />
          <input
            type="hidden"
            name="targetAudience"
            value={targetAudience}
          />
          <input
            type="hidden"
            name="customMemberIds"
            value={JSON.stringify(selectedMemberIds)}
          />

          {/* Card Header (Editorial Fraunces) */}
          <div className="border-b border-stone-200 bg-white p-5 sm:p-6">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
              {isEdit ? "Perbarui agenda pertemuan" : "Buat agenda pertemuan baru"}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Atur waktu pelaksanaan, durasi pertemuan, dan target panitia yang wajib hadir presensi.
            </p>

            {actionData && !actionData.success && actionData.message && (
              <p className="field-error mt-3 rounded-md bg-rose-50 border border-rose-200 p-2.5">
                {actionData.message}
              </p>
            )}
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 space-y-6 bg-white">
            {/* 1. Judul Pertemuan */}
            <div className="space-y-1.5">
              <label htmlFor="agenda-title" className="field-label">
                Judul pertemuan <span className="text-mtq-crimson">*</span>
              </label>
              <input
                id="agenda-title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rapat Pleno 1 / Koordinasi Teknis Lomba"
                className="input"
              />
              <p className="field-hint">
                Nama agenda yang akan tampil di kartu jadwal dan daftar presensi panitia.
              </p>
            </div>

            {/* 2. Target Peserta (Segmented Radio Options) */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="field-label">
                  Target peserta <span className="text-mtq-crimson">*</span>
                </label>
                <span className="text-xs font-medium text-stone-600">
                  {estimatedParticipantCount} panitia wajib hadir
                </span>
              </div>

              {!isKadiv ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "ALL", label: "Seluruh panitia", sub: `Pleno (${members.length} orang)` },
                    { id: "DIVISION", label: "Internal divisi", sub: "1 divisi terpilih" },
                    { id: "LEADERS", label: "Rapat pimpinan", sub: "BPH & seluruh Kadiv" },
                    {
                      id: "CUSTOM",
                      label: "Pilih kustom",
                      sub: selectedMemberIds.length > 0 ? `${selectedMemberIds.length} dipilih` : "Pilih nama",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer flex-col justify-between rounded-lg border p-3 transition select-none ${
                        targetAudience === opt.id
                          ? "border-mtq-crimson bg-mtq-crimson-50 text-stone-900"
                          : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{opt.label}</span>
                        <input
                          type="radio"
                          name="audience_choice"
                          checked={targetAudience === opt.id}
                          onChange={() => setTargetAudience(opt.id as TargetAudience)}
                          className="check"
                        />
                      </div>
                      <span className="mt-1 text-xs text-stone-500">{opt.sub}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
                  <span className="font-medium text-stone-900">Rapat internal divisi Anda</span>
                  <p className="mt-0.5 text-stone-500">
                    Sebagai Ketua Divisi, agenda otomatis mengundang anggota divisi Anda.
                  </p>
                </div>
              )}

              {/* Sub-selector jika DIVISION */}
              {targetAudience === "DIVISION" && !isKadiv && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 space-y-1.5">
                  <label htmlFor="agenda-divisi-select" className="field-label">
                    Pilih divisi yang ditugaskan:
                  </label>
                  <select
                    id="agenda-divisi-select"
                    value={selectedDivisionId}
                    onChange={(e) => setSelectedDivisionId(e.target.value)}
                    className="input"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        Divisi {d.name} ({members.filter((m) => m.divisionId === d.id).length} panitia)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sub-selector jika CUSTOM (Clean Styleguide Table List) */}
              {targetAudience === "CUSTOM" && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="search"
                        placeholder="Cari nama atau NIM..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="input pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-600">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="btn btn-ghost btn-sm px-2 text-stone-700"
                      >
                        Pilih semua ({filteredMembers.length})
                      </button>
                      <span className="text-stone-300">·</span>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="btn btn-ghost btn-sm px-2 text-rose-700 hover:text-rose-900"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
                    {filteredMembers.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      const divName = divisions.find((d) => d.id === m.divisionId)?.name || "-";
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer text-xs transition ${
                            isSelected ? "bg-mtq-crimson-50/50" : "hover:bg-stone-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMemberSelection(m.id)}
                            className="check"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-stone-900">{m.name}</span>
                            <span className="ml-2 font-mono text-[11px] text-stone-400">{m.nim}</span>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {divName} · {ROLE_LABELS[m.role]}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                    {filteredMembers.length === 0 && (
                      <p className="p-4 text-center text-xs text-stone-400">
                        Tidak ada panitia yang cocok dengan pencarian.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tanggal, Jam & Durasi Rapat */}
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 pt-2 border-t border-stone-100">
              {/* Tanggal */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="agenda-date" className="field-label">
                    Tanggal pelaksanaan <span className="text-mtq-crimson">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(0)}
                      className={`btn btn-sm ${
                        date === todayStr ? "btn-primary" : "btn-secondary"
                      }`}
                    >
                      Hari ini
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(1)}
                      className="btn btn-secondary btn-sm"
                    >
                      Besok
                    </button>
                  </div>
                </div>
                <input
                  id="agenda-date"
                  type="date"
                  name="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>

              {/* Jam Mulai */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="agenda-start-time" className="field-label">
                    Jam mulai <span className="text-mtq-crimson">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSetStartNow}
                    className="btn btn-ghost btn-sm -mr-2 text-stone-600"
                  >
                    Mulai sekarang ({currentTimeStr})
                  </button>
                </div>
                <input
                  id="agenda-start-time"
                  type="time"
                  name="startTime"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input font-mono"
                />
              </div>

              {/* Jam Selesai */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="agenda-end-time" className="field-label">
                    Jam selesai <span className="font-normal text-stone-400">(estimasi)</span>
                  </label>
                  <span className="text-xs text-stone-400">otomatis terhitung</span>
                </div>
                <input
                  id="agenda-end-time"
                  type="time"
                  name="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input font-mono"
                />
              </div>

              {/* Preset Durasi Cepat */}
              <div className="sm:col-span-2 space-y-1.5">
                <p className="field-hint">Preset durasi rapat:</p>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((dur) => (
                    <button
                      key={dur.minutes}
                      type="button"
                      onClick={() => handleApplyDuration(dur.minutes)}
                      className="btn btn-secondary btn-sm"
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Lokasi Pertemuan & Tautan Daring */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="space-y-1.5">
                <label htmlFor="agenda-location" className="field-label">
                  Lokasi pertemuan <span className="text-mtq-crimson">*</span>
                </label>
                <input
                  id="agenda-location"
                  type="text"
                  name="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Gedung TULT Lt. 6 / Masjid Syamsul Ulum"
                  className="input"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {LOCATION_PRESETS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Tautan Daring jika lokasi bernuansa online */}
              {(location.toLowerCase().includes("online") ||
                location.toLowerCase().includes("meet") ||
                location.toLowerCase().includes("zoom")) && (
                <div className="space-y-1.5 rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                  <label htmlFor="agenda-online-url" className="field-label">
                    Tautan rapat daring <span className="font-normal text-stone-400">(opsional)</span>
                  </label>
                  <input
                    id="agenda-online-url"
                    type="url"
                    name="onlineUrl"
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="input"
                  />
                  <p className="field-hint">
                    Tautan Google Meet atau Zoom untuk panitia yang bergabung secara daring.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Agenda & Poin Bahasan (Textarea) */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label htmlFor="agenda-description" className="field-label">
                Poin bahasan rapat <span className="font-normal text-stone-400">(opsional)</span>
              </label>
              <textarea
                id="agenda-description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan garis besar materi yang akan dibahas atau perlengkapan yang wajib dibawa panitia..."
                className="input"
              />
              <p className="field-hint">
                Poin bahasan ini akan dapat dibaca oleh seluruh panitia yang diundang.
              </p>
            </div>
          </div>

          {/* Form Footer (Responsive & Always Visible, Sesuai Styleguide Section 09) */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between border-t border-stone-200 bg-stone-50 p-4 sm:px-6 sm:py-4 gap-3">
            <p className="text-xs text-stone-500 text-center sm:text-left">
              Agenda akan langsung tercatat di kalender dan sistem presensi panitia.
            </p>
            <div className="flex items-center gap-2">
              <Link to="/admin/agenda" className="btn btn-secondary flex-1 sm:flex-initial text-center justify-center">
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1 sm:flex-initial justify-center"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSubmitting
                    ? "Menyimpan…"
                    : isEdit
                    ? "Simpan perubahan"
                    : "Jadwalkan agenda"}
                </span>
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
