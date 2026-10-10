// app/routes/admin.divisi.tsx
// Halaman Manajemen Struktur Divisi MTQ Tel-U 2026
// Arsitektur Terpusat dengan Toast & Dialog Desain Resmi MTQTU

import React, { useState, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, useOutletContext } from "react-router";
import { Layers, Plus, Edit2, Trash2, Bell, Menu, Users } from "lucide-react";
import { requireUser } from "../lib/auth.server";
import { getDb } from "../lib/db.server";
import { canManageDivisions } from "../lib/rbac";
import {
  getDivisions,
  getMembers,
  createDivision,
  updateDivision,
  deleteDivision,
  type DbDivision,
  type DbMember,
} from "../db/panitia.server";
import { DivisionModal } from "../components/division-modal";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useToast } from "../components/ui/toast";
import type { Division } from "../types/panitia";

export function meta() {
  return [
    { title: "Struktur Divisi · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Kelola struktur divisi kepanitiaan MTQ Tel-U 2026.",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  let rawDivisions: DbDivision[] = [];
  let rawMembers: DbMember[] = [];

  if (db) {
    try {
      [rawDivisions, rawMembers] = await Promise.all([getDivisions(db), getMembers(db)]);
    } catch (e) {
      console.error("D1 loader error in divisi:", e);
    }
  }

  const divisions: Division[] = rawDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    colorBadge: d.color_badge,
  }));

  return { currentUser, divisions, members: rawMembers, isD1Connected: Boolean(db) };
}

export async function action({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  if (!canManageDivisions(currentUser)) {
    return {
      success: false,
      message: "Akses ditolak: Hanya Super Admin yang berhak mengelola divisi.",
    };
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (!db) {
    return { success: true, message: "Aksi disimulasikan (Offline)" };
  }

  try {
    switch (intent) {
      case "CREATE_DIVISION": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        await createDivision(db, { name, description });
        return { success: true, message: `Divisi '${name}' berhasil dibuat!` };
      }

      case "UPDATE_DIVISION": {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        await updateDivision(db, id, { name, description });
        return { success: true, message: `Divisi '${name}' berhasil diperbarui!` };
      }

      case "DELETE_DIVISION": {
        const id = formData.get("id") as string;
        await deleteDivision(db, id);
        return { success: true, message: "Divisi berhasil dihapus." };
      }

      default:
        return { success: false, message: "Aksi tidak dikenal" };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || "Terjadi kesalahan" };
  }
}

export default function AdminDivisiPage() {
  const { currentUser, divisions, members, isD1Connected } = useLoaderData<typeof loader>();
  const canManage = canManageDivisions(currentUser);
  const fetcher = useFetcher<typeof action>();
  const toast = useToast();
  const { onToggleMobileSidebar } = useOutletContext<{
    onToggleMobileSidebar: () => void;
  }>();

  const [divisionModalOpen, setDivisionModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deletingDivision, setDeletingDivision] = useState<Division | null>(null);

  // Centralized toast feedback
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

  const handleSaveDivision = (data: { id?: string; name: string; description: string }) => {
    fetcher.submit(
      {
        intent: data.id ? "UPDATE_DIVISION" : "CREATE_DIVISION",
        ...(data.id && { id: data.id }),
        name: data.name,
        description: data.description,
      },
      { method: "POST" }
    );
  };

  const handleDeleteRequest = (div: Division) => {
    const count = members.filter((m) => m.division_id === div.id).length;
    if (count > 0) {
      toast.error(
        `Divisi '${div.name}' tidak dapat dihapus karena masih menaungi ${count} panitia aktif.`
      );
      return;
    }
    setDeletingDivision(div);
  };

  const handleConfirmDelete = () => {
    if (!deletingDivision) return;
    fetcher.submit(
      {
        intent: "DELETE_DIVISION",
        id: deletingDivision.id,
      },
      { method: "POST" }
    );
    setDeletingDivision(null);
  };

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
            <span className="text-stone-900 font-medium">Divisi</span>
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              Struktur divisi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Kelola pembagian tugas, koordinator divisi, dan alokasi anggota kepanitiaan.
            </p>
          </div>

          {canManage ? (
            <button
              onClick={() => {
                setEditingDivision(null);
                setDivisionModalOpen(true);
              }}
              className="btn btn-primary w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah divisi</span>
            </button>
          ) : (
            <span className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs text-stone-600 font-medium">
              Mode Hanya Baca
            </span>
          )}
        </div>

        {/* ── Grid Daftar Divisi ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((div) => {
            const memberCount = members.filter((m) => m.division_id === div.id).length;
            const isBph = div.id === "bph";

            return (
              <div
                key={div.id}
                className="card p-5 hover:border-stone-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-stone-400 uppercase">
                      ID: {div.id}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDivision(div);
                            setDivisionModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                          title="Edit Divisi"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {!isBph && (
                          <button
                            onClick={() => handleDeleteRequest(div)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                            title="Hapus Divisi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-stone-900 text-base mt-2">
                    {div.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {div.description || "Tidak ada deskripsi rincian tugas divisi."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1.5 font-medium text-stone-700">
                    <Users className="h-3.5 w-3.5 text-stone-400" />
                    <span>{memberCount} panitia</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    {isBph ? "divisi inti" : "divisi teknis"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal Input Divisi ──────────────────────────────────────── */}
      <DivisionModal
        isOpen={divisionModalOpen}
        onClose={() => {
          setDivisionModalOpen(false);
          setEditingDivision(null);
        }}
        editingDivision={editingDivision}
        onSave={handleSaveDivision}
      />

      {/* ── Dialog Konfirmasi Hapus Divisi Terpusat ─────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(deletingDivision)}
        onClose={() => setDeletingDivision(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Divisi Kepanitiaan"
        message={
          <span>
            Apakah Anda yakin ingin menghapus divisi{" "}
            <strong className="text-stone-900 font-semibold">
              "{deletingDivision?.name}"
            </strong>
            ? Tindakan ini tidak dapat dibatalkan.
          </span>
        }
        confirmLabel="Hapus Divisi"
        variant="danger"
      />
    </div>
  );
}
