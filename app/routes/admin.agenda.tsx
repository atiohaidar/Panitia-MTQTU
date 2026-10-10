// app/routes/admin.agenda.tsx
// Halaman Manajemen Agenda Kegiatan & Presensi Cepat MTQ Tel-U 2026
// Arsitektur Terpusat & Modular sesuai Sistem Desain Resmi (/styleguide)

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, useOutletContext, Link } from "react-router";
import {
  CalendarDays,
  Plus,
  Bell,
  Menu,
} from "lucide-react";
import { requireUser } from "../lib/auth.server";
import { getDb } from "../lib/db.server";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAttendanceRoster,
  recordBatchAttendance,
  getEventSummaryCounts,
} from "../db/events.server";
import { getDivisions, type DbDivision } from "../db/panitia.server";
import {
  canCreateEvent,
  canEditEvent,
  canTakeAttendance,
} from "../lib/rbac";
import type {
  CommitteeEvent,
  AttendanceRecord,
  Division,
  AuthUser,
  EventType,
  AttendanceStatus,
} from "../types/panitia";
import { getEventEffectiveStatus } from "../lib/event-utils";
import { useToast } from "../components/ui/toast";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { AgendaCard } from "../components/agenda/agenda-card";
import { AgendaFilterBar } from "../components/agenda/agenda-filter-bar";
import { RapidAttendanceModal } from "../components/rapid-attendance-modal";
import { EventModal } from "../components/event-modal";

export function meta() {
  return [
    { title: "Agenda Kegiatan & Presensi · MTQ Tel-U 2026" },
    {
      name: "description",
      content:
        "Jadwal pertemuan pleno dan divisi, serta presensi cepat panitia MTQ Telkom University 2026.",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") as "my" | "all") || "my";
  const showPast = url.searchParams.get("past") === "1";

  const now = new Date();
  const refDate = now.toISOString().split("T")[0];
  const refTime = now.toTimeString().slice(0, 5);

  let rawDivisions: DbDivision[] = [];
  let events: CommitteeEvent[] = [];
  let counts = { myActive: 0, allActive: 0, pastCount: 0 };

  if (db) {
    try {
      const [divs, countRes, evts] = await Promise.all([
        getDivisions(db),
        getEventSummaryCounts(db, currentUser, refDate, refTime),
        getEvents(db, {
          scope,
          includePast: showPast,
          user: currentUser,
          referenceDate: refDate,
          referenceTime: refTime,
        }),
      ]);
      rawDivisions = divs;
      counts = countRes;
      events = evts;
    } catch (e) {
      console.error("D1 loader error in agenda:", e);
    }
  }

  const divisions: Division[] = rawDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    colorBadge: d.color_badge,
  }));

  return {
    currentUser,
    events,
    divisions,
    scope,
    showPast,
    counts,
    isD1Connected: Boolean(db),
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
    switch (intent) {
      case "CREATE_EVENT": {
        if (!canCreateEvent(currentUser)) {
          return { success: false, message: "Akses ditolak: Anda tidak memiliki wewenang membuat agenda." };
        }

        const title = formData.get("title") as string;
        let type = formData.get("type") as EventType;
        let divisionId = formData.get("divisionId") as string | null;
        const date = formData.get("date") as string;
        const startTime = formData.get("startTime") as string;
        const endTime = formData.get("endTime") as string | null;
        const location = formData.get("location") as string;
        const description = formData.get("description") as string | null;

        if (currentUser.role === "KETUA_DIVISI") {
          type = "DIVISI";
          divisionId = currentUser.divisionId;
        }

        await createEvent(db, {
          title,
          type,
          division_id: divisionId,
          date,
          start_time: startTime,
          end_time: endTime,
          location,
          description,
          created_by: currentUser.id,
        });

        return { success: true, message: `Agenda '${title}' berhasil dibuat!` };
      }

      case "UPDATE_EVENT": {
        const id = formData.get("id") as string;
        const existing = await getEventById(db, id);
        if (!existing || !canEditEvent(currentUser, existing)) {
          return { success: false, message: "Akses ditolak: Anda tidak dapat mengubah agenda ini." };
        }

        const title = formData.get("title") as string;
        const type = formData.get("type") as EventType;
        const divisionId = formData.get("divisionId") as string | null;
        const date = formData.get("date") as string;
        const startTime = formData.get("startTime") as string;
        const endTime = formData.get("endTime") as string | null;
        const location = formData.get("location") as string;
        const description = formData.get("description") as string | null;

        await updateEvent(db, id, {
          title,
          type,
          division_id: divisionId,
          date,
          start_time: startTime,
          end_time: endTime,
          location,
          description,
        });

        return { success: true, message: "Agenda berhasil diperbarui!" };
      }

      case "DELETE_EVENT": {
        const id = formData.get("id") as string;
        const existing = await getEventById(db, id);
        if (!existing || !canEditEvent(currentUser, existing)) {
          return { success: false, message: "Akses ditolak: Anda tidak dapat menghapus agenda ini." };
        }

        await deleteEvent(db, id);
        return { success: true, message: "Agenda berhasil dihapus." };
      }

      case "GET_ROSTER": {
        const eventId = formData.get("eventId") as string;
        const roster = await getAttendanceRoster(db, eventId);
        return { success: true, roster, eventId };
      }

      case "SAVE_ATTENDANCE": {
        const eventId = formData.get("eventId") as string;
        const event = await getEventById(db, eventId);
        if (!event || !canTakeAttendance(currentUser, event)) {
          return { success: false, message: "Akses ditolak: Anda tidak memiliki wewenang presensi untuk acara ini." };
        }

        const payloadStr = formData.get("payload") as string;
        const records = JSON.parse(payloadStr);

        await recordBatchAttendance(db, eventId, currentUser.id, records);
        return {
          success: true,
          message: `Berhasil menyimpan presensi untuk ${records.length} panitia!`,
        };
      }

      default:
        return { success: false, message: "Aksi tidak dikenal" };
    }
  } catch (err: any) {
    console.error("Action error:", err);
    return { success: false, message: err?.message || "Terjadi kesalahan" };
  }
}

export default function AdminAgendaPage() {
  const {
    currentUser,
    events: initialEvents,
    divisions,
    scope,
    showPast,
    counts,
    isD1Connected,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const toast = useToast();
  const { onToggleMobileSidebar } = useOutletContext<{
    onToggleMobileSidebar: () => void;
  }>();

  const [events, setEvents] = useState<CommitteeEvent[]>(initialEvents);
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Centralized Toast trigger on action result
  const lastHandledData = useRef<any>(null);
  useEffect(() => {
    if (fetcher.data && fetcher.data !== lastHandledData.current) {
      lastHandledData.current = fetcher.data;
      if (fetcher.data.message) {
        if (fetcher.data.success) {
          toast.success(fetcher.data.message);
        } else {
          toast.error(fetcher.data.message);
        }
      }
    }
  }, [fetcher.data, toast]);

  // Modal states
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommitteeEvent | null>(null);

  const [rapidModalOpen, setRapidModalOpen] = useState(false);
  const [activeAttendanceEvent, setActiveAttendanceEvent] =
    useState<CommitteeEvent | null>(null);
  const [activeRoster, setActiveRoster] = useState<AttendanceRecord[]>([]);

  // Confirm delete dialog state (replaces window.confirm)
  const [deletingEvent, setDeletingEvent] = useState<CommitteeEvent | null>(null);

  // When roster is fetched via fetcher
  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).roster && activeAttendanceEvent) {
      setActiveRoster((fetcher.data as any).roster);
      setRapidModalOpen(true);
    }
  }, [fetcher.data, activeAttendanceEvent]);

  // Trigger rapid attendance modal
  const handleOpenRapidAttendance = (event: CommitteeEvent) => {
    setActiveAttendanceEvent(event);
    fetcher.submit(
      {
        intent: "GET_ROSTER",
        eventId: event.id,
      },
      { method: "POST" }
    );
  };

  const handleSaveEvent = (data: {
    id?: string;
    title: string;
    type: EventType;
    divisionId: string | null;
    date: string;
    startTime: string;
    endTime: string | null;
    location: string;
    description: string | null;
  }) => {
    fetcher.submit(
      {
        intent: data.id ? "UPDATE_EVENT" : "CREATE_EVENT",
        ...(data.id && { id: data.id }),
        title: data.title,
        type: data.type,
        divisionId: data.divisionId || "",
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime || "",
        location: data.location,
        description: data.description || "",
      },
      { method: "POST" }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingEvent) return;
    fetcher.submit(
      {
        intent: "DELETE_EVENT",
        id: deletingEvent.id,
      },
      { method: "POST" }
    );
    setDeletingEvent(null);
  };

  const handleCommitAttendance = (
    eventId: string,
    records: { memberId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    fetcher.submit(
      {
        intent: "SAVE_ATTENDANCE",
        eventId,
        payload: JSON.stringify(records),
      },
      { method: "POST" }
    );
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType =
        selectedTypeFilter === "ALL" || ev.type === selectedTypeFilter;
      const effectiveStatus = getEventEffectiveStatus(ev);
      const matchStatus =
        selectedStatusFilter === "ALL" ||
        effectiveStatus === selectedStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [events, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  const canCreate = canCreateEvent(currentUser);

  return (
    <div className="flex-1 min-w-0 bg-mtq-canvas pb-24 sm:pb-12">
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-1.5 text-stone-500 hover:text-stone-800 rounded-md min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-xs sm:text-sm text-stone-500 truncate">
            Panitia <span className="text-stone-300">/</span>{" "}
            <span className="text-stone-900 font-medium">Agenda & Presensi</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isD1Connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">d1 database aktif</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-2 py-0.5 font-mono text-[11px] text-stone-500">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
              <span className="hidden sm:inline">data contoh</span>
            </span>
          )}
          <button className="btn btn-ghost btn-sm px-2 min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className="space-y-5 p-4 sm:p-5 max-w-6xl">
        {/* Header Title & Actions */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              Agenda kegiatan
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Jadwal pertemuan pleno dan koordinasi divisi, terintegrasi dengan presensi cepat panitia.
            </p>
          </div>

          {canCreate ? (
            <Link
              to="/admin/agenda/baru"
              className="btn btn-primary w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Buat agenda baru</span>
            </Link>
          ) : (
            <span className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs text-stone-600 font-medium">
              Jadwal Panitia (Hanya Baca)
            </span>
          )}
        </div>

        {/* ── Segmented Scope Tabs & Archive Toggle ───────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg w-fit">
            <Link
              to={`/admin/agenda?scope=my${showPast ? "&past=1" : ""}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition select-none ${
                scope === "my"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Agenda saya ({counts.myActive})
            </Link>
            <Link
              to={`/admin/agenda?scope=all${showPast ? "&past=1" : ""}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition select-none ${
                scope === "all"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Semua agenda ({counts.allActive})
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/agenda?scope=${scope}${showPast ? "" : "&past=1"}`}
              className={`btn btn-sm ${
                showPast ? "btn-secondary bg-stone-100 font-semibold" : "btn-ghost"
              }`}
            >
              <span>
                {showPast
                  ? "Sembunyikan agenda lewat"
                  : `Tampilkan riwayat lewat (${counts.pastCount})`}
              </span>
            </Link>
          </div>
        </div>

        {/* ── Modular Search & Filters Bar ─────────────────────────────── */}
        <AgendaFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypeFilter={selectedTypeFilter}
          onTypeFilterChange={setSelectedTypeFilter}
          selectedStatusFilter={selectedStatusFilter}
          onStatusFilterChange={setSelectedStatusFilter}
          onReset={() => {
            setSearchQuery("");
            setSelectedTypeFilter("ALL");
            setSelectedStatusFilter("ALL");
          }}
        />

        {/* ── Cards Grid List Agenda ───────────────────────────────── */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400">
            <CalendarDays className="h-10 w-10 mx-auto text-stone-300 mb-2" />
            <p className="font-semibold text-stone-700">
              {scope === "my"
                ? "Tidak ada agenda mendatang untuk Anda"
                : "Belum ada agenda kegiatan"}
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
              {scope === "my"
                ? "Saat ini tidak ada rapat pleno atau koordinasi yang menugaskan divisi Anda. Klik tab 'Semua agenda' untuk melihat jadwal divisi lain."
                : "Klik tombol buat agenda untuk menjadwalkan rapat pleno atau koordinasi divisi."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {scope === "my" && counts.allActive > 0 && (
                <Link
                  to={`/admin/agenda?scope=all${showPast ? "&past=1" : ""}`}
                  className="btn btn-secondary btn-sm inline-flex"
                >
                  Lihat semua agenda ({counts.allActive})
                </Link>
              )}
              {canCreate && (
                <Link to="/admin/agenda/baru" className="btn btn-primary btn-sm inline-flex">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Jadwalkan agenda baru</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
              <AgendaCard
                key={ev.id}
                event={ev}
                isEditable={canEditEvent(currentUser, ev)}
                isTakeable={canTakeAttendance(currentUser, ev)}
                isLoading={fetcher.state !== "idle"}
                onDelete={(item) => setDeletingEvent(item)}
                onOpenAttendance={handleOpenRapidAttendance}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Input/Edit Agenda Sederhana ───────────────────────── */}
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        currentUser={currentUser}
        editingEvent={editingEvent}
        divisions={divisions}
        onSave={handleSaveEvent}
      />

      {/* ── Modal Presensi Cepat (Rapid Attendance Hub) ─────────────── */}
      {activeAttendanceEvent && (
        <RapidAttendanceModal
          isOpen={rapidModalOpen}
          onClose={() => {
            setRapidModalOpen(false);
            setActiveAttendanceEvent(null);
          }}
          event={activeAttendanceEvent}
          initialRoster={activeRoster}
          onCommit={handleCommitAttendance}
        />
      )}

      {/* ── Dialog Konfirmasi Hapus Terpusat (Bukan window.confirm) ──── */}
      <ConfirmDialog
        isOpen={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Agenda Kegiatan"
        message={
          <span>
            Apakah Anda yakin ingin menghapus agenda{" "}
            <strong className="text-stone-900 font-semibold">
              "{deletingEvent?.title}"
            </strong>
            ? Seluruh data rekap presensi pada pertemuan ini juga akan dihapus permanen.
          </span>
        }
        confirmLabel="Hapus Agenda"
        variant="danger"
      />
    </div>
  );
}
