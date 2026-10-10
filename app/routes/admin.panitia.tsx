// app/routes/admin.panitia.tsx
// Halaman Manajemen Panitia dengan Import Spreadsheet Modal dan D1 Database

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, useOutletContext } from "react-router";
import {
  Users,
  Plus,
  ClipboardPaste,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Check,
  Bell,
  Menu,
  Mail,
  MessageSquare,
} from "lucide-react";
import { requireUser } from "../lib/auth.server";
import { getDb } from "../lib/db.server";
import { canManageMembers, canViewSensitiveMemberInfo } from "../lib/rbac";
import type { AuthUser } from "../types/panitia";
import {
  getDivisions,
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  updateMemberPassword,
  batchInsertMembers,
  type DbDivision,
  type DbMember,
} from "../db/panitia.server";
import { ImportSpreadsheetModal } from "../components/import-spreadsheet-modal";
import { MemberModal } from "../components/member-modal";
import { PasswordModal } from "../components/password-modal";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useToast } from "../components/ui/toast";

export function meta() {
  return [
    { title: "Data Panitia · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Kelola data seluruh panitia MTQ Tel-U 2026, role hierarki, dan import spreadsheet.",
    },
  ];
}

export type { CommitteeRole, Division, CommitteeMember } from "../types/panitia";
import type { CommitteeRole, Division, CommitteeMember } from "../types/panitia";

const ROLE_CONFIG: Record<
  CommitteeRole,
  { label: string; dot: string; textClass?: string }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    dot: "bg-mtq-crimson",
    textClass: "font-semibold text-stone-900",
  },
  KETUA_PELAKSANA: {
    label: "Ketua Pelaksana",
    dot: "bg-amber-600",
    textClass: "font-semibold text-stone-900",
  },
  SEKRETARIS: {
    label: "Sekretaris",
    dot: "bg-indigo-600",
    textClass: "font-medium text-stone-800",
  },
  BENDAHARA: {
    label: "Bendahara",
    dot: "bg-teal-600",
    textClass: "font-medium text-stone-800",
  },
  SC: {
    label: "Steering Committee",
    dot: "bg-purple-600",
    textClass: "font-medium text-stone-800",
  },
  KETUA_DIVISI: {
    label: "Ketua Divisi",
    dot: "bg-sky-600",
    textClass: "font-medium text-stone-800",
  },
  ANGGOTA: {
    label: "Anggota",
    dot: "bg-stone-300",
    textClass: "text-stone-600",
  },
};

export async function loader({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  let rawDivisions: DbDivision[] = [];
  let rawMembers: DbMember[] = [];

  if (db) {
    try {
      [rawDivisions, rawMembers] = await Promise.all([getDivisions(db), getMembers(db)]);
    } catch (e) {
      console.error("D1 loader error in panitia:", e);
    }
  }

  const divisions: Division[] = rawDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    colorBadge: d.color_badge,
  }));

  const canViewSensitive = canViewSensitiveMemberInfo(currentUser);

  const members: CommitteeMember[] = rawMembers.map((m) => ({
    id: m.id,
    nim: canViewSensitive || m.id === currentUser.id ? m.nim : "—",
    name: m.name,
    email: canViewSensitive || m.id === currentUser.id ? m.email : "",
    phone: m.phone,
    divisionId: m.division_id,
    role: m.role as CommitteeRole,
    isActive: m.is_active === 1,
    createdAt: m.created_at,
  }));

  return { currentUser, divisions, members, canViewSensitive, isD1Connected: Boolean(db) };
}

export async function action({ request }: { request: Request }) {
  const db = await getDb(request);
  const currentUser = await requireUser(request, db);

  // RBAC: Hanya Super Admin yang berhak memodifikasi data panitia
  if (!canManageMembers(currentUser)) {
    return {
      success: false,
      message: "Akses ditolak: Hanya Super Admin yang memiliki wewenang untuk mengelola panitia.",
    };
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (!db) {
    return { success: true, message: "Aksi disimulasikan (Offline)" };
  }

  try {
    switch (intent) {
      case "CREATE_MEMBER": {
        const nim = formData.get("nim") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const divisionId = formData.get("divisionId") as string;
        const role = formData.get("role") as string;

        if (!email || !email.trim()) {
          return { success: false, message: "Email panitia wajib diisi untuk akun masuk." };
        }

        await createMember(db, {
          nim,
          name,
          email,
          phone,
          division_id: divisionId,
          role,
        });

        return { success: true, message: `Panitia ${name} (${nim}) berhasil ditambahkan!` };
      }

      case "UPDATE_MEMBER": {
        const id = formData.get("id") as string;
        const nim = formData.get("nim") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const divisionId = formData.get("divisionId") as string;
        const role = formData.get("role") as string;

        if (!email || !email.trim()) {
          return { success: false, message: "Email panitia wajib diisi untuk akun masuk." };
        }

        await updateMember(db, id, {
          nim,
          name,
          email,
          phone,
          division_id: divisionId,
          role,
        });

        return { success: true, message: `Data ${name} berhasil diperbarui!` };
      }

      case "DELETE_MEMBER": {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        await deleteMember(db, id);
        return { success: true, message: `Panitia ${name} telah dihapus dari sistem.` };
      }

      case "RESET_PASSWORD": {
        const id = formData.get("id") as string;
        const newPassword = formData.get("newPassword") as string;
        const name = formData.get("name") as string;
        await updateMemberPassword(db, id, newPassword);
        return { success: true, message: `Kata sandi untuk ${name} berhasil diubah!` };
      }

      case "BATCH_IMPORT": {
        const payloadJson = formData.get("payload") as string;
        const rows = JSON.parse(payloadJson);

        const missingEmail = rows.find((r: any) => !r.email || !r.email.trim());
        if (missingEmail) {
          return {
            success: false,
            message: `Email wajib diisi! Data untuk ${missingEmail.name || missingEmail.nim} tidak memiliki email.`,
          };
        }

        const result = await batchInsertMembers(
          db,
          rows.map((r: any) => ({
            nim: r.nim,
            name: r.name,
            email: r.email,
            phone: r.phone,
            division_id: r.matchedDivisionId,
            role: r.role,
          }))
        );
        return {
          success: true,
          message: `Berhasil mengimpor ${result.inserted} data panitia ke D1 database!`,
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

export default function AdminPanitiaPage() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { onToggleMobileSidebar } = useOutletContext<{
    onToggleMobileSidebar: () => void;
  }>();

  const canManage = canManageMembers(loaderData.currentUser);
  const canViewSensitive = loaderData.canViewSensitive;
  const [divisions, setDivisions] = useState<Division[]>(loaderData.divisions);
  const [members, setMembers] = useState<CommitteeMember[]>(loaderData.members);

  useEffect(() => {
    setDivisions(loaderData.divisions);
    setMembers(loaderData.members);
  }, [loaderData]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState("ALL");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Centralized Toast
  const toast = useToast();
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

  // Modals state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<CommitteeMember | null>(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [targetPasswordMember, setTargetPasswordMember] = useState<CommitteeMember | null>(null);

  // Handlers
  const handleSaveMember = (data: {
    id?: string;
    nim: string;
    name: string;
    email: string;
    phone: string;
    divisionId: string;
    role: CommitteeRole;
  }) => {
    if (data.id) {
      fetcher.submit(
        {
          intent: "UPDATE_MEMBER",
          id: data.id,
          nim: data.nim,
          name: data.name,
          email: data.email,
          phone: data.phone,
          divisionId: data.divisionId,
          role: data.role,
        },
        { method: "POST" }
      );
    } else {
      fetcher.submit(
        {
          intent: "CREATE_MEMBER",
          nim: data.nim,
          name: data.name,
          email: data.email,
          phone: data.phone,
          divisionId: data.divisionId,
          role: data.role,
        },
        { method: "POST" }
      );
    }
  };

  const handleDeleteMember = (member: CommitteeMember) => {
    setDeletingMember(member);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    fetcher.submit(
      {
        intent: "DELETE_MEMBER",
        id: deletingMember.id,
        name: deletingMember.name,
      },
      { method: "POST" }
    );
    setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
    setDeletingMember(null);
  };

  const handleSavePassword = (newPassword: string) => {
    if (targetPasswordMember) {
      fetcher.submit(
        {
          intent: "RESET_PASSWORD",
          id: targetPasswordMember.id,
          newPassword,
          name: targetPasswordMember.name,
        },
        { method: "POST" }
      );
    }
  };

  const handleCommitBatchImport = (rows: any[]) => {
    fetcher.submit(
      {
        intent: "BATCH_IMPORT",
        payload: JSON.stringify(rows),
      },
      { method: "POST" }
    );
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (canViewSensitive && m.nim.includes(searchQuery)) ||
        (canViewSensitive && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDiv = selectedDivisionFilter === "ALL" || m.divisionId === selectedDivisionFilter;
      const matchRole = selectedRoleFilter === "ALL" || m.role === selectedRoleFilter;
      return matchSearch && matchDiv && matchRole;
    });
  }, [members, searchQuery, selectedDivisionFilter, selectedRoleFilter, canViewSensitive]);

  return (
    <div className="flex-1 min-w-0 bg-mtq-canvas pb-24 sm:pb-12">

      {/* ── Top Bar ────────────────────────────────────────────────── */}
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
            <span className="text-stone-900 font-medium">Panitia</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loaderData.isD1Connected ? (
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
              Data panitia
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Kelola penugasan divisi, hak akses peran, dan seluruh akun panitia MTQ Tel-U 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {canManage ? (
              <>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="btn btn-secondary flex-1 sm:flex-initial"
                >
                  <ClipboardPaste className="h-4 w-4 text-stone-500" />
                  <span>Import spreadsheet</span>
                </button>

                <button
                  onClick={() => {
                    setEditingMember(null);
                    setMemberModalOpen(true);
                  }}
                  className="btn btn-primary flex-1 sm:flex-initial"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah anggota</span>
                </button>
              </>
            ) : (
              <span className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs text-stone-600 font-medium">
                Direktori Panitia (Hanya Baca)
              </span>
            )}
          </div>
        </div>

        {/* ── Toolbar Search & Filter ──────────────────────────────── */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder={
                canViewSensitive
                  ? "Cari nama panitia, NIM, atau email..."
                  : "Cari nama panitia atau divisi..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-mtq-crimson bg-[#fafaf9]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDivisionFilter}
              onChange={(e) => setSelectedDivisionFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700"
            >
              <option value="ALL">Semua Divisi ({divisions.length})</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700"
            >
              <option value="ALL">Semua Role</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="KETUA_PELAKSANA">Ketua Pelaksana</option>
              <option value="SEKRETARIS">Sekretaris</option>
              <option value="BENDAHARA">Bendahara</option>
              <option value="SC">Steering Committee</option>
              <option value="KETUA_DIVISI">Ketua Divisi</option>
              <option value="ANGGOTA">Anggota</option>
            </select>

            {(searchQuery || selectedDivisionFilter !== "ALL" || selectedRoleFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDivisionFilter("ALL");
                  setSelectedRoleFilter("ALL");
                }}
                className="text-xs text-stone-500 hover:text-stone-800 transition px-2 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Table Panitia (Tampilan Desktop: hidden md:block) ────── */}
        <div className="hidden md:block bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Panitia</th>
                  {canViewSensitive && <th className="px-4 py-3">NIM</th>}
                  {canViewSensitive && <th className="px-4 py-3">Email (Gmail)</th>}
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Role / Jabatan</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3 text-right">{canManage ? "Aksi" : "Status Akun"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={canViewSensitive ? 7 : 5} className="px-4 py-12 text-center text-stone-400">
                      <Users className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                      <p className="font-semibold text-stone-600">Tidak ada data panitia</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Sesuaikan kata kunci pencarian atau filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const div = divisions.find((d) => d.id === member.divisionId);
                    const roleMeta = ROLE_CONFIG[member.role] || ROLE_CONFIG.ANGGOTA;

                    return (
                      <tr key={member.id} className="hover:bg-stone-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-full bg-rose-50 text-mtq-crimson font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
                              {member.name.charAt(0)}
                            </span>
                            <p className="font-semibold text-stone-900">{member.name}</p>
                          </div>
                        </td>
                        {canViewSensitive && (
                          <td className="px-4 py-3 font-mono font-medium text-stone-700">
                            {member.nim}
                          </td>
                        )}
                        {canViewSensitive && (
                          <td className="px-4 py-3 font-mono text-xs text-stone-600">
                            {member.email ? (
                              member.email
                            ) : (
                              <span className="italic text-stone-400 text-[11px]">Dikosongkan</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 text-stone-700 whitespace-nowrap">
                          {div?.name || "Belum ada divisi"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs ${
                              roleMeta.textClass || "font-medium text-stone-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${roleMeta.dot}`}
                              aria-hidden="true"
                            />
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600 font-mono text-[11px]">
                          {member.phone || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canManage ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setTargetPasswordMember(member);
                                  setPasswordModalOpen(true);
                                }}
                                title="Ganti Password"
                                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setMemberModalOpen(true);
                                }}
                                title="Edit Data Panitia"
                                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-mtq-crimson hover:bg-rose-50 rounded-md transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member)}
                                title="Hapus Panitia"
                                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Aktif
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-[#fafaf9] border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>
              Menampilkan <strong>{filteredMembers.length}</strong> dari {members.length} panitia
            </span>
            <span className="text-[11px] text-stone-400">Tersinkronisasi ke D1 Database</span>
          </div>
        </div>

        {/* ── Mobile Card List View (Khusus Layar Smartphone: md:hidden) ─ */}
        <div className="md:hidden space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
              <Users className="h-8 w-8 mx-auto text-stone-300 mb-2" />
              <p className="font-semibold text-stone-700">Tidak ada data panitia</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Sesuaikan kata kunci pencarian atau filter.
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const div = divisions.find((d) => d.id === member.divisionId);
              const roleMeta = ROLE_CONFIG[member.role] || ROLE_CONFIG.ANGGOTA;
              const cleanPhone = member.phone?.replace(/[^0-9]/g, "");
              const waUrl = cleanPhone
                ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`
                : null;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs space-y-3"
                >
                  {/* Baris Atas: Avatar + Nama + NIM + Role Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-9 w-9 rounded-full bg-rose-50 text-mtq-crimson font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
                        {member.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 text-sm leading-snug truncate">
                          {member.name}
                        </p>
                        {canViewSensitive && (
                          <p className="font-mono text-xs text-stone-500">
                            {member.nim}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md border shrink-0 ${
                        member.role === "SUPER_ADMIN"
                          ? "bg-rose-50 border-rose-200 text-mtq-crimson font-semibold"
                          : "bg-stone-50 border-stone-200 text-stone-700 font-medium"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${roleMeta.dot}`} />
                      {roleMeta.label}
                    </span>
                  </div>

                  {/* Divisi & Email */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium text-[11px]">
                      {div?.name || "Belum ada divisi"}
                    </span>
                    {canViewSensitive && member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded hover:text-stone-900"
                      >
                        <Mail className="h-3 w-3 text-stone-400" />
                        <span className="truncate max-w-[170px]">{member.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Baris Aksi Jempol-Friendly (Touch Targets >= 40px) */}
                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    {/* Chat WhatsApp Direct */}
                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg min-h-[40px] transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat WA</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">
                        Tanpa no. WA
                      </span>
                    )}

                    {canManage ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetPasswordMember(member);
                            setPasswordModalOpen(true);
                          }}
                          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-600 hover:text-amber-700 bg-stone-50 hover:bg-amber-50 border border-stone-200 rounded-lg transition"
                          title="Ganti Password"
                          aria-label={`Ganti password ${member.name}`}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMember(member);
                            setMemberModalOpen(true);
                          }}
                          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-600 hover:text-mtq-crimson bg-stone-50 hover:bg-rose-50 border border-stone-200 rounded-lg transition"
                          title="Edit Data Panitia"
                          aria-label={`Edit ${member.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-600 hover:text-rose-700 bg-stone-50 hover:bg-rose-50 border border-stone-200 rounded-lg transition"
                          title="Hapus Panitia"
                          aria-label={`Hapus ${member.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Akun Aktif
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Footer Counter Khusus Mobile */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>
              Menampilkan <strong>{filteredMembers.length}</strong> dari {members.length} panitia
            </span>
            <span className="text-[11px] text-stone-400">D1 Sync</span>
          </div>
        </div>
      </div>

      {/* ── Modals Modular ─────────────────────────────────────────── */}
      <ImportSpreadsheetModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        divisions={divisions}
        existingNims={members.map((m) => m.nim)}
        existingEmails={members.map((m) => (m.email || "").toLowerCase())}
        onCommit={handleCommitBatchImport}
      />

      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        editingMember={editingMember}
        divisions={divisions}
        onSave={handleSaveMember}
      />

      {targetPasswordMember && (
        <PasswordModal
          isOpen={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setTargetPasswordMember(null);
          }}
          targetName={targetPasswordMember.name}
          targetNim={targetPasswordMember.nim}
          onSave={handleSavePassword}
        />
      )}

      {/* ── Dialog Konfirmasi Hapus Panitia Terpusat ───────────────── */}
      <ConfirmDialog
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Panitia"
        message={
          <span>
            Apakah Anda yakin ingin menghapus panitia{" "}
            <strong className="text-stone-900 font-semibold">
              "{deletingMember?.name}" ({deletingMember?.nim})
            </strong>
            ? Akun dan data panitia ini akan dinonaktifkan dari sistem.
          </span>
        }
        confirmLabel="Hapus Panitia"
        variant="danger"
      />
    </div>
  );
}
