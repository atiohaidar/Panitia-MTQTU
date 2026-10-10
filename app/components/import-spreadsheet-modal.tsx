// app/components/import-spreadsheet-modal.tsx
// Modal batch paste spreadsheet importer untuk data panitia MTQ Tel-U 2026

import React, { useState } from "react";
import {
  X,
  ClipboardPaste,
  Sparkles,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Plus,
} from "lucide-react";
import type { Division, CommitteeRole } from "../types/panitia";

export interface ParsedRow {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string;
  matchedDivisionId: string;
  role: CommitteeRole;
  status: "VALID" | "WARNING" | "INVALID";
  errors: string[];
}

interface ImportSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  existingNims: string[];
  existingEmails?: string[];
  onCommit: (
    rows: {
      nim: string;
      name: string;
      email: string;
      phone: string;
      matchedDivisionId: string;
      role: CommitteeRole;
    }[]
  ) => void;
}

export function ImportSpreadsheetModal({
  isOpen,
  onClose,
  divisions,
  existingNims,
  existingEmails = [],
  onCommit,
}: ImportSpreadsheetModalProps) {
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isParsed, setIsParsed] = useState(false);

  if (!isOpen) return null;

  const matchDivision = (input: string): Division | null => {
    const clean = input.trim().toLowerCase();
    if (!clean) return null;
    return (
      divisions.find(
        (d) =>
          d.name.toLowerCase().includes(clean) ||
          clean.includes(d.name.toLowerCase()) ||
          d.id.toLowerCase() === clean
      ) || null
    );
  };

  const matchRole = (input: string): CommitteeRole => {
    const clean = input.trim().toLowerCase();
    if (clean.includes("super")) return "SUPER_ADMIN";
    if (
      clean.includes("pelaksana") ||
      clean.includes("ketua umum") ||
      clean.includes("kahim")
    )
      return "KETUA_PELAKSANA";
    if (clean.includes("sekretaris")) return "SEKRETARIS";
    if (clean.includes("bendahara")) return "BENDAHARA";
    if (clean.includes("sc") || clean.includes("steering")) return "SC";
    if (
      clean.includes("kadiv") ||
      clean.includes("ketua divisi") ||
      clean.includes("koor")
    )
      return "KETUA_DIVISI";
    return "ANGGOTA";
  };

  const handleParse = () => {
    if (!rawText.trim()) return;

    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: ParsedRow[] = [];

    // Check if line 0 is a header row
    let headerMap: { [key: string]: number } | null = null;
    let startIndex = 0;

    if (lines.length > 0) {
      const firstLineParts = (
        lines[0].includes("\t")
          ? lines[0].split("\t")
          : lines[0].includes(";")
            ? lines[0].split(";")
            : lines[0].split(",")
      ).map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ""));

      const hasHeaderKeywords = firstLineParts.some((c) =>
        ["nim", "nama", "name", "divisi", "division", "role", "jabatan", "email"].includes(c)
      );

      if (hasHeaderKeywords) {
        headerMap = {};
        firstLineParts.forEach((header, idx) => {
          if (header.includes("nim")) headerMap!["nim"] = idx;
          else if (header.includes("nama") || header.includes("name")) headerMap!["name"] = idx;
          else if (header.includes("email") || header.includes("mail")) headerMap!["email"] = idx;
          else if (header.includes("divisi") || header.includes("division")) headerMap!["divisi"] = idx;
          else if (header.includes("role") || header.includes("jabatan")) headerMap!["role"] = idx;
          else if (
            header.includes("wa") ||
            header.includes("phone") ||
            header.includes("telepon") ||
            header.includes("hp")
          ) {
            headerMap!["phone"] = idx;
          }
        });
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes("\t")
        ? line.split("\t")
        : line.includes(";")
          ? line.split(";")
          : line.split(",");

      const cells = parts.map((c) => c.trim().replace(/^"|"$/g, ""));

      let nim = "";
      let name = "";
      let divInput = "";
      let roleInput = "";
      let email = "";
      let phone = "";

      if (headerMap) {
        nim = headerMap["nim"] !== undefined ? cells[headerMap["nim"]] || "" : "";
        name = headerMap["name"] !== undefined ? cells[headerMap["name"]] || "" : "";
        email = headerMap["email"] !== undefined ? cells[headerMap["email"]] || "" : "";
        divInput = headerMap["divisi"] !== undefined ? cells[headerMap["divisi"]] || "" : "";
        roleInput = headerMap["role"] !== undefined ? cells[headerMap["role"]] || "" : "ANGGOTA";
        phone = headerMap["phone"] !== undefined ? cells[headerMap["phone"]] || "" : "";
      } else {
        // Smart heuristic mapping without headers
        // Standard expected order: NIM | Nama | Divisi | Role | Email | No HP
        // OR: NIM | Nama | Email | Divisi | Role | No HP
        if (cells.length >= 2) {
          if (/^\d{6,12}$/.test(cells[0])) {
            nim = cells[0];
            name = cells[1] || "";

            // Check if cell 2 is an email or division
            if (cells[2] && cells[2].includes("@")) {
              email = cells[2];
              divInput = cells[3] || "";
              roleInput = cells[4] || "ANGGOTA";
              phone = cells[5] || "";
            } else {
              divInput = cells[2] || "";
              roleInput = cells[3] || "ANGGOTA";
              // Check remaining cells for email or phone
              const rem = cells.slice(4);
              for (const item of rem) {
                if (item.includes("@")) {
                  email = item;
                } else if (/^[\d+\-\s]{8,}$/.test(item)) {
                  phone = item;
                }
              }
            }
          } else {
            // Name might be first
            name = cells[0];
            nim = cells[1] || "";
            divInput = cells[2] || "";
            roleInput = cells[3] || "ANGGOTA";
            const rem = cells.slice(4);
            for (const item of rem) {
              if (item.includes("@")) {
                email = item;
              } else if (/^[\d+\-\s]{8,}$/.test(item)) {
                phone = item;
              }
            }
          }
        }
      }

      // Validations: NIM, Nama, dan Email wajib diisi
      const errors: string[] = [];
      if (!name) errors.push("Nama wajib diisi");
      if (!nim) errors.push("NIM wajib diisi");
      if (!email.trim()) {
        errors.push("Email wajib diisi (kredensial login)");
      } else if (!email.includes("@") || !email.includes(".")) {
        errors.push("Format email tidak valid");
      }

      const matchedDiv = matchDivision(divInput);
      let status: "VALID" | "WARNING" | "INVALID" = "VALID";

      if (errors.length > 0) {
        status = "INVALID";
      } else if (!matchedDiv) {
        errors.push(`Divisi '${divInput || "Kosong"}' belum terdaftar (disetel ke default)`);
        status = "WARNING";
      }

      if (nim && existingNims.includes(nim)) {
        errors.push(`NIM ${nim} sudah terdaftar di sistem`);
        status = "WARNING";
      }

      if (email && existingEmails.includes(email.toLowerCase())) {
        errors.push(`Email ${email} sudah terdaftar di sistem`);
        status = "WARNING";
      }

      parsed.push({
        id: `parsed-${i}-${Date.now()}`,
        nim,
        name,
        email: email.trim(),
        phone: phone.trim(),
        matchedDivisionId: matchedDiv ? matchedDiv.id : divisions[0]?.id || "acara",
        role: matchRole(roleInput),
        status,
        errors,
      });
    }

    setParsedRows(parsed);
    setIsParsed(true);
  };

  const handleUpdateRow = (id: string, updates: Partial<ParsedRow>) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, ...updates };

        // Revalidate
        const errors: string[] = [];
        if (!updated.name.trim()) errors.push("Nama wajib diisi");
        if (!updated.nim.trim()) errors.push("NIM wajib diisi");
        if (!updated.email.trim()) {
          errors.push("Email wajib diisi (kredensial login)");
        } else if (!updated.email.includes("@") || !updated.email.includes(".")) {
          errors.push("Format email tidak valid");
        }

        let status: "VALID" | "WARNING" | "INVALID" = "VALID";
        if (errors.length > 0) {
          status = "INVALID";
        } else if (existingNims.includes(updated.nim) && updated.nim !== row.nim) {
          errors.push(`NIM ${updated.nim} sudah terdaftar di sistem`);
          status = "WARNING";
        } else if (
          existingEmails.includes(updated.email.toLowerCase()) &&
          updated.email.toLowerCase() !== row.email.toLowerCase()
        ) {
          errors.push(`Email ${updated.email} sudah terdaftar di sistem`);
          status = "WARNING";
        }

        return { ...updated, status, errors };
      })
    );
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCommit = () => {
    const validRows = parsedRows.filter((r) => r.status !== "INVALID");
    if (validRows.length === 0) return;

    onCommit(
      validRows.map((r) => ({
        nim: r.nim,
        name: r.name,
        email: r.email || "", // Email tersimpan kosong jika tidak diisi
        phone: r.phone || "081234567890",
        matchedDivisionId: r.matchedDivisionId || divisions[0].id,
        role: r.role,
      }))
    );

    setRawText("");
    setParsedRows([]);
    setIsParsed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-mtq-crimson flex items-center justify-center border border-rose-200/80">
              <ClipboardPaste className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Import Panitia dari Spreadsheet
              </h3>
              <p className="text-[11px] text-stone-500">
                Paste data dari Google Sheets / Excel. Kolom email wajib diisi untuk login, kata sandi awal otomatis NIM.
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Guide Note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-950 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Format Kolom Tabel yang Didukung:</span>
            </div>
            <p className="text-[11px] text-amber-900">
              Susunan: <code>NIM | Nama Lengkap | Divisi | Role | Email | No WhatsApp</code>.
            </p>
            <p className="text-[11px] text-amber-900 mt-1">
              • <strong>Kolom Email</strong>: <strong>Wajib diisi</strong> karena digunakan sebagai akun login resmi panitia.
              <br />
              • <strong>Kata Sandi</strong>: Akun baru otomatis menggunakan <strong>NIM</strong> sebagai kata sandi default awal saat login pertama kali.
            </p>
          </div>

          {/* Textarea Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700 text-xs">
                Paste Data Tabel di Sini:
              </label>
              <button
                type="button"
                onClick={() => {
                  const sample = `1301239001\tFaiz Al-Ghifari\tDivisi Acara\tAnggota\tfaiz@gmail.ac.id\t081299001122\n1302239002\tSafira Nur Aini\tDivisi PDD\tKetua Divisi\tsafira@gmail.com\t081399002233\n1303239003\tRaka Pratama\tBroadcasting & IT\tAnggota\traka.pratama@telkomuniversity.ac.id\t081499003344\n1304239004\tZulfa Maharani\tDivisi Logistik & Konsumsi\tSC\tzulfa@gmail.com\t081599004455`;
                  setRawText(sample);
                }}
                className="text-[11px] font-semibold text-mtq-crimson hover:underline"
              >
                Gunakan Contoh Data (Lengkap dengan Email)
              </button>
            </div>

            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Contoh salin dari spreadsheet:&#10;1301230001	Ahmad Fauzan	Divisi Acara	Anggota	ahmad@gmail.ac.id	081234567890&#10;1301230002	Nurul Hidayah	Divisi PDD	Ketua Divisi	nurul@gmail.com	081298765432"
              className="w-full p-3 font-mono text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-mtq-crimson bg-[#fafaf9]"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setRawText("");
                  setParsedRows([]);
                  setIsParsed(false);
                }}
                className="text-stone-400 hover:text-stone-600 text-[11px]"
              >
                Hapus Teks
              </button>

              <button
                type="button"
                onClick={handleParse}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Parse & Tampilkan Tabel</span>
              </button>
            </div>
          </div>

          {/* Parsed Preview Table with Editable Cells */}
          {isParsed && (
            <div className="border border-stone-200 rounded-xl overflow-hidden mt-3 shadow-2xs">
              <div className="bg-stone-50 px-3.5 py-2.5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-800 text-xs">
                    Pratinjau Tabel ({parsedRows.length} Baris Data)
                  </span>
                  <span className="text-[11px] text-stone-500 ml-2">
                    (Email wajib diisi untuk setiap akun panitia)
                  </span>
                </div>
                <span className="text-[11px] text-stone-600 font-medium">
                  {parsedRows.filter((r) => r.status !== "INVALID").length} baris siap disimpan
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafaf9] border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 w-20">Status</th>
                      <th className="px-3 py-2 w-28">NIM</th>
                      <th className="px-3 py-2">Nama Lengkap</th>
                      <th className="px-3 py-2">Email (Wajib Masuk)</th>
                      <th className="px-3 py-2">Divisi</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          row.status === "INVALID"
                            ? "bg-rose-50/50"
                            : row.status === "WARNING"
                              ? "bg-amber-50/30"
                              : "hover:bg-stone-50"
                        }
                      >
                        <td className="px-3 py-2">
                          {row.status === "VALID" && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                              <CheckCircle2 className="h-3 w-3" /> Siap
                            </span>
                          )}
                          {row.status === "WARNING" && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium"
                              title={row.errors.join(", ")}
                            >
                              <AlertTriangle className="h-3 w-3" /> Cek
                            </span>
                          )}
                          {row.status === "INVALID" && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-medium"
                              title={row.errors.join(", ")}
                            >
                              <XCircle className="h-3 w-3" /> Gagal
                            </span>
                          )}
                        </td>

                        {/* NIM */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.nim}
                            onChange={(e) => handleUpdateRow(row.id, { nim: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs font-mono rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400"
                            placeholder="130122..."
                          />
                        </td>

                        {/* Nama */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleUpdateRow(row.id, { name: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400 font-medium text-stone-900"
                            placeholder="Nama Lengkap"
                          />
                        </td>

                        {/* Email - Wajib */}
                        <td className="px-3 py-2">
                          <input
                            type="email"
                            required
                            value={row.email}
                            onChange={(e) => handleUpdateRow(row.id, { email: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs font-mono rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400 text-stone-700 placeholder:italic placeholder:text-stone-300"
                            placeholder="nama@email.com *"
                          />
                        </td>

                        {/* Divisi */}
                        <td className="px-3 py-2">
                          <select
                            value={row.matchedDivisionId}
                            onChange={(e) =>
                              handleUpdateRow(row.id, { matchedDivisionId: e.target.value })
                            }
                            className="w-full px-1.5 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400 text-stone-700"
                          >
                            {divisions.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Role */}
                        <td className="px-3 py-2">
                          <select
                            value={row.role}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                role: e.target.value as CommitteeRole,
                              })
                            }
                            className="w-full px-1.5 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-none focus:border-stone-400 text-stone-700"
                          >
                            <option value="ANGGOTA">Anggota</option>
                            <option value="KETUA_DIVISI">Ketua Divisi</option>
                            <option value="SC">Steering Committee</option>
                            <option value="SEKRETARIS">Sekretaris</option>
                            <option value="BENDAHARA">Bendahara</option>
                            <option value="KETUA_PELAKSANA">Ketua Pelaksana</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        </td>

                        {/* Hapus Baris */}
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded"
                            title="Hapus baris"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3 bg-stone-50/60 shrink-0">
          <div className="text-[11px] text-stone-500">
            {isParsed && parsedRows.length > 0 && (
              <span>
                Akun panitia masuk menggunakan <strong>Email</strong>, dengan kata sandi awal default: <strong>NIM</strong>.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Batal
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={!isParsed || parsedRows.every((r) => r.status === "INVALID")}
              className="btn btn-primary btn-sm disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>
                Simpan ke Database (
                {parsedRows.filter((r) => r.status !== "INVALID").length} Panitia)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
