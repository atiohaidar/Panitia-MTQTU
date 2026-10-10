// app/routes/admin.divisi.tsx
// Halaman Manajemen Struktur Divisi MTQ Tel-U 2026

import React, { useState } from "react";
import { useLoaderData, useFetcher, useOutletContext } from "react-router";
import { Layers, Plus, Edit2, Trash2, Bell, Menu, CheckCircle2, XCircle } from "lucide-react";
import { requireUser } from "../lib/auth.server";
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
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  const currentUser = await requireUser(request, db);

  let rawDivisions: DbDivision[] = [];
  let rawMembers: DbMember[] = [];

  if (db) {
    try {
      [rawDivisions, rawMembers] = await Promise.all([getDivisions(db), getMembers(db)]);
    } catch (e) {
      console.error("D1 loader error:", e);
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
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  const currentUser = await requireUser(request, db);

  // RBAC: Hanya Super Admin yang berhak memodifikasi divisi
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
        return { success: true, message: `Divisi '${name}' berhasil dibuat di D1!` };
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
        return { success: true, message: `Divisi berhasil dihapus dari database!` };
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
  const { onToggleMobileSidebar } = useOutletContext<{
    onToggleMobileSidebar: () => void;
  }>();

  const [divisionModalOpen, setDivisionModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const handleSaveDivision = (data: { id?: string; name: string; description: string }) => {
    if (data.id) {
      fetcher.submit(
        {
          intent: "UPDATE_DIVISION",
          id: data.id,
          name: data.name,
          description: data.description,
        },
        { method: "POST" }
      );
    } else {
      fetcher.submit(
        {
          intent: "CREATE_DIVISION",
          name: data.name,
          description: data.description,
        },
        { method: "POST" }
      );
    }
  };

  const handleDeleteDivision = (div: Division) => {
    const count = members.filter((m) => m.division_id === div.id).length;
    if (count > 0) {
      alert(`Divisi '${div.name}' tidak bisa dihapus karena masih memiliki ${count} anggota.`);
      return;
    }

    if (confirm(`Hapus divisi '${div.name}' dari database?`)) {
      fetcher.submit(
        {
          intent: "DELETE_DIVISION",
          id: div.id,
        },
        { method: "POST" }
      );
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-mtq-canvas">
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1 text-stone-500 hover:text-stone-800 rounded-md"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm text-stone-500">
            Panitia <span className="text-stone-300">/</span>{" "}
            <span className="text-stone-900 font-medium">Divisi</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isD1Connected ? (
            <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] text-emerald-800">
              d1 database aktif
            </span>
          ) : (
            <span className="rounded border border-dashed border-stone-300 px-1.5 py-0.5 font-mono text-[11px] text-stone-500">
              data contoh
            </span>
          )}
          <button className="btn btn-ghost btn-sm px-2" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className="space-y-5 p-5 max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
              Struktur divisi
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Kelola pembagian tugas, koordinator divisi, dan alokasi anggota kepanitiaan.
            </p>
          </div>

          {canManage ? (
            <button
              onClick={() => {
                setEditingDivision(null);
                setDivisionModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah divisi</span>
            </button>
          ) : (
            <span className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs text-stone-600 font-medium">
              Struktur Divisi (Hanya Baca)
            </span>
          )}
        </div>

        {/* ── Cards Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((div) => {
            const memberList = members.filter((m) => m.division_id === div.id);
            const kadiv = memberList.find((m) => m.role === "KETUA_DIVISI");
            const scs = memberList.filter((m) => m.role === "SC");

            return (
              <div
                key={div.id}
                className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-stone-500">
                      {memberList.length} Anggota
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
                        <button
                          onClick={() => handleDeleteDivision(div)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                          title="Hapus Divisi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="font-semibold text-stone-900 text-sm mt-2">{div.name}</h2>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {div.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-[11px] text-stone-400">Ketua Divisi:</span>
                    <span className="font-semibold text-stone-800">
                      {kadiv ? kadiv.name : <em className="text-stone-400 font-normal">Belum diset</em>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-[11px] text-stone-400">Steering Comm.:</span>
                    <span className="font-semibold text-stone-800">
                      {scs.length > 0 ? (
                        scs.map((s) => s.name).join(", ")
                      ) : (
                        <em className="text-stone-400 font-normal">Belum ada</em>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Division Modal ─────────────────────────────────────────── */}
      <DivisionModal
        isOpen={divisionModalOpen}
        onClose={() => setDivisionModalOpen(false)}
        editingDivision={editingDivision}
        onSave={handleSaveDivision}
      />
    </div>
  );
}
