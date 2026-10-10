import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Layers,
  Loader2,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { GirihPattern } from "../components/girih-pattern";
import { STATUS_META, StatusGlyph, StatusMark, type StatusKind } from "../components/status-mark";

export function meta() {
  return [
    { title: "Sistem Desain · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Token, komponen, dan contoh layout untuk aplikasi panitia MTQ Tel-U 2026.",
    },
  ];
}

/* ────────────────────────────────────────────────────────────
   Data contoh (bukan data asli)
   ──────────────────────────────────────────────────────────── */
type Status = Exclude<StatusKind, "draft">;

const STATUS_KEYS: Status[] = ["diterima", "wawancara", "menunggu", "ditolak"];

const DIVISI = ["Acara & Teknis", "Kesekretariatan", "Broadcasting & IT", "Pubdok & Desain"];

const PENDAFTAR: {
  nama: string;
  nim: string;
  divisi: string;
  angkatan: number;
  status: Status;
}[] = [
  { nama: "Aisyah Rahmawati", nim: "1301230445", divisi: "Acara & Teknis", angkatan: 2023, status: "diterima" },
  { nama: "Muhammad Fadhil Akbar", nim: "1302234118", divisi: "Broadcasting & IT", angkatan: 2023, status: "menunggu" },
  { nama: "Nabila Zahra Putri", nim: "1303241562", divisi: "Pubdok & Desain", angkatan: 2024, status: "wawancara" },
  { nama: "Rizky Maulana", nim: "1301240877", divisi: "Kesekretariatan", angkatan: 2024, status: "ditolak" },
  { nama: "Hana Salsabila", nim: "1304250213", divisi: "Acara & Teknis", angkatan: 2025, status: "menunggu" },
  { nama: "Ahmad Syauqi", nim: "1305252290", divisi: "Broadcasting & IT", angkatan: 2025, status: "diterima" },
];

const NAV = [
  { id: "prinsip", label: "Prinsip" },
  { id: "warna", label: "Warna" },
  { id: "tipografi", label: "Tipografi" },
  { id: "pattern", label: "Pattern girih" },
  { id: "tombol", label: "Tombol" },
  { id: "input", label: "Input & form field" },
  { id: "status", label: "Status" },
  { id: "tabel", label: "Tabel data" },
  { id: "contoh-form", label: "Contoh: form" },
  { id: "contoh-dashboard", label: "Contoh: dashboard" },
  { id: "publikasi", label: "Elemen publikasi" },
];

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
function Section({
  id,
  no,
  title,
  desc,
  children,
}: {
  id: string;
  no: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5 border-b border-stone-200 pb-3">
        <p className="font-mono text-xs text-stone-400">{String(no).padStart(2, "0")}</p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-stone-900">{title}</h2>
        {desc && <p className="mt-1 max-w-2xl text-sm text-stone-500">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[12px] text-stone-700">
      {children}
    </code>
  );
}

function DataContoh() {
  return (
    <span className="rounded border border-dashed border-stone-300 px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-stone-500">
      data contoh
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default function StyleguidePage() {
  return (
    <div className="min-h-dvh bg-mtq-canvas text-stone-900 selection:bg-mtq-crimson selection:text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo MTQTU" className="h-8 w-8 rounded-full bg-white object-contain" />
            <span className="text-sm font-semibold">MTQ Tel-U 2026</span>
            <span className="text-stone-300">/</span>
            <span className="text-sm text-stone-500">Sistem Desain</span>
          </div>
          <Link to="/" className="btn btn-secondary btn-sm">
            Buka halaman login
          </Link>
        </div>
      </header>

      {/* Intro */}
      <div className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="text-mtq-crimson/[0.07]">
          <GirihPattern />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-sm font-medium text-mtq-crimson">Panitia MTQ Tel-U 2026</p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Sistem Desain</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600">
            Token, komponen, dan contoh layout untuk semua halaman internal panitia. Kalau ada
            komponen di sini, pakai class-nya. Jangan bikin versi baru dengan utility panjang.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        {/* TOC */}
        <nav aria-label="Daftar isi" className="hidden lg:block">
          <ul className="sticky top-24 space-y-0.5 text-sm">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="block rounded-md px-2.5 py-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 space-y-16">
          <Principles />
          <Colors />
          <Typography />
          <Pattern />
          <Buttons />
          <Inputs />
          <Badges />
          <Section
            id="tabel"
            no={8}
            title="Tabel data"
            desc="Header sentence case warna muted, NIM pakai mono, angka rata kanan dengan tabular-nums. Aksi per baris cukup satu tombol ghost."
          >
            <PendaftarTable />
          </Section>
          <Section
            id="contoh-form"
            no={9}
            title="Contoh: form"
            desc="Grid 2 kolom di desktop, 1 kolom di mobile. Error muncul di bawah field, bukan alert. Tombol utama di kanan bawah."
          >
            <FormExample />
          </Section>
          <Section
            id="contoh-dashboard"
            no={10}
            title="Contoh: dashboard"
            desc="App shell: sidebar putih dengan indikator merah di menu aktif, konten di atas canvas abu hangat. Merah dipakai hemat: indikator aktif, progress, dan satu CTA."
          >
            <DashboardExample />
          </Section>
          <Publikasi />
        </main>
      </div>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <p className="font-medium text-stone-700">Panitia MTQ Tel-U 2026 · Road to MTQMN 2027</p>
        <p className="mt-1">Direktorat Kemahasiswaan, Karier, dan Alumni (KKA)</p>
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   01 Prinsip
   ──────────────────────────────────────────────────────────── */
function Principles() {
  const items: [string, string, string][] = [
    ["Merah = aksi utama", "Maksimal satu tombol merah per layar.", "Link, badge, dan heading ikut-ikutan merah."],
    ["Label sentence case", "“Kata sandi”, “Divisi pilihan”.", "“KATA SANDI” dengan letter-spacing lebar."],
    ["Icon harus berfungsi", "Toggle sandi, aksi tabel, item navigasi.", "Icon dekoratif di dalam setiap input."],
    ["Identitas lewat MTQ", "Girih, serif Fraunces, kutipan ayat.", "Gradient, glassmorphism, emoji ✨."],
    ["Warna poster untuk publikasi", "Oranye & amber cuma di halaman publik.", "Oranye dipakai untuk status di dashboard."],
    ["Status pakai glyph bintang", "Bintang 8 + label netral, bentuk beda per status.", "Pill berwarna dengan tint, ring, dan dot."],
  ];
  return (
    <Section id="prinsip" no={1} title="Prinsip" desc="Enam aturan yang bikin UI ini tidak terlihat generic.">
      <div className="grid gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, doo, dont]) => (
          <div key={title} className="bg-white p-5">
            <p className="font-semibold text-stone-900">{title}</p>
            <p className="mt-3 flex gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {doo}
            </p>
            <p className="mt-1.5 flex gap-2 text-sm text-stone-500">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              {dont}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   02 Warna
   ──────────────────────────────────────────────────────────── */
function Colors() {
  const brand = [
    { name: "Crimson", hex: "#C9242B", token: "mtq-crimson", use: "Aksi utama, menu aktif", bg: "bg-mtq-crimson" },
    { name: "Crimson dark", hex: "#9B1B20", token: "mtq-crimson-dark", use: "Hover tombol utama", bg: "bg-mtq-crimson-dark" },
    { name: "Crimson 50", hex: "#FDF2F2", token: "mtq-crimson-50", use: "Background item aktif", bg: "bg-mtq-crimson-50", light: true },
    { name: "Forest", hex: "#1E3A2B", token: "mtq-forest", use: "Road to MTQMN, aksen sekunder", bg: "bg-mtq-forest" },
  ];
  const neutral = [
    { name: "Ink", hex: "#1C1917", token: "stone-900", use: "Teks utama", bg: "bg-stone-900" },
    { name: "Muted", hex: "#78716C", token: "stone-500", use: "Teks sekunder, header tabel", bg: "bg-stone-500" },
    { name: "Border", hex: "#E7E5E4", token: "stone-200", use: "Garis card & tabel", bg: "bg-stone-200", light: true },
    { name: "Canvas", hex: "#FAFAF9", token: "mtq-canvas", use: "Background aplikasi", bg: "bg-mtq-canvas", light: true },
  ];
  const semantic = [
    { name: "Sukses", bg: "bg-emerald-600", token: "emerald-600" },
    { name: "Peringatan", bg: "bg-amber-600", token: "amber-600" },
    { name: "Bahaya", bg: "bg-rose-600", token: "rose-600" },
    { name: "Info", bg: "bg-sky-600", token: "sky-600" },
  ];

  const Swatch = ({ c }: { c: (typeof brand)[number] }) => (
    <div className="card overflow-hidden">
      <div className={`h-16 ${c.bg} ${c.light ? "border-b border-stone-200" : ""}`} />
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{c.name}</p>
          <p className="font-mono text-[11px] text-stone-400">{c.hex}</p>
        </div>
        <p className="mt-0.5 text-[13px] text-stone-500">{c.use}</p>
        <p className="mt-2 font-mono text-[11px] text-stone-400">{c.token}</p>
      </div>
    </div>
  );

  return (
    <Section id="warna" no={2} title="Warna" desc="Brand cuma merah dan forest. Sisanya netral stone. Warna semantik hanya untuk status.">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Brand</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {brand.map((c) => <Swatch key={c.name} c={c} />)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Netral</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {neutral.map((c) => <Swatch key={c.name} c={c} />)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Semantik (hanya untuk glyph status, bukan background)</p>
          <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
            {semantic.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-sm ${s.bg}`} />
                <span className="text-sm text-stone-700">{s.name}</span>
                <span className="font-mono text-[11px] text-stone-400">{s.token}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   03 Tipografi
   ──────────────────────────────────────────────────────────── */
function Typography() {
  const rows: { role: string; spec: string; el: React.ReactNode }[] = [
    {
      role: "Display",
      spec: "font-serif · 40 · 500",
      el: <p className="font-serif text-[40px] leading-tight font-medium tracking-tight">Assalamu&apos;alaikum, Panitia.</p>,
    },
    {
      role: "Judul halaman",
      spec: "font-serif · 30 · 500",
      el: <p className="font-serif text-3xl font-medium tracking-tight">Ringkasan pendaftaran</p>,
    },
    {
      role: "Judul section",
      spec: "font-sans · 18 · 600",
      el: <p className="text-lg font-semibold tracking-tight">Kuota per divisi</p>,
    },
    {
      role: "Body",
      spec: "font-sans · 14–15 · 400",
      el: (
        <p className="max-w-lg text-[15px] leading-relaxed text-stone-700">
          Mahasiswa/i Muslim Telkom University Bandung yang memiliki komitmen tinggi hingga akhir kepanitiaan.
        </p>
      ),
    },
    {
      role: "Keterangan",
      spec: "font-sans · 13 · stone-500",
      el: <p className="text-[13px] text-stone-500">Terakhir diperbarui 10 menit lalu</p>,
    },
    {
      role: "Data / ID",
      spec: "font-mono · 13",
      el: <p className="font-mono text-[13px] text-stone-700">1301230445 · PNT-2026-0042</p>,
    },
    {
      role: "Arab",
      spec: "font-arabic · rtl",
      el: (
        <p lang="ar" dir="rtl" className="font-arabic text-3xl leading-loose text-stone-900">
          وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ
        </p>
      ),
    },
  ];

  return (
    <Section
      id="tipografi"
      no={3}
      title="Tipografi"
      desc="Fraunces (serif) untuk judul memberi nuansa tradisional. Geist untuk UI. Amiri khusus teks Arab."
    >
      <div className="card divide-y divide-stone-100">
        {rows.map((r) => (
          <div key={r.role} className="grid gap-2 p-5 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-6">
            <div>
              <p className="text-sm font-medium text-stone-900">{r.role}</p>
              <p className="font-mono text-[11px] text-stone-400">{r.spec}</p>
            </div>
            <div className="min-w-0">{r.el}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   04 Pattern
   ──────────────────────────────────────────────────────────── */
function Pattern() {
  return (
    <Section
      id="pattern"
      no={4}
      title="Pattern girih"
      desc="Bintang 8 (Rub el Hizb). Elemen pembeda utama. Pakai di area brand saja: panel login, header halaman, empty state. Jangan di belakang tabel atau form."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative h-40 overflow-hidden rounded-xl bg-mtq-crimson">
          <div className="text-white/[0.14]"><GirihPattern /></div>
          <p className="absolute bottom-3 left-3 text-xs font-medium text-white/80">Di atas crimson · white/14%</p>
        </div>
        <div className="relative h-40 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="text-mtq-crimson/[0.08]"><GirihPattern /></div>
          <p className="absolute bottom-3 left-3 text-xs font-medium text-stone-500">Di atas putih · crimson/8%</p>
        </div>
        <div className="relative h-40 overflow-hidden rounded-xl bg-mtq-forest">
          <div className="text-white/[0.12]"><GirihPattern fade={false} /></div>
          <p className="absolute bottom-3 left-3 text-xs font-medium text-white/80">Tanpa fade · forest</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-stone-500">
        Komponen: <Code>{"<GirihPattern fade />"}</Code>. Warnanya ikut <Code>currentColor</Code>, jadi atur lewat{" "}
        <Code>text-*</Code> di parent.
      </p>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   05 Tombol
   ──────────────────────────────────────────────────────────── */
function Buttons() {
  const [loading, setLoading] = useState(false);
  return (
    <Section id="tombol" no={5} title="Tombol" desc="Radius 8px, tanpa shadow, tanpa panah. Label kata kerja yang spesifik: “Simpan anggota”, bukan “Submit”.">
      <div className="card divide-y divide-stone-100">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <button className="btn btn-primary">Simpan anggota</button>
          <button className="btn btn-secondary">Batal</button>
          <button className="btn btn-ghost">Lihat detail</button>
          <button className="btn btn-danger">Tolak pendaftar</button>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-5">
          <button className="btn btn-primary btn-sm">Kecil</button>
          <button className="btn btn-primary">Default</button>
          <button className="btn btn-primary btn-lg">Besar (form auth)</button>
          <button className="btn btn-secondary btn-sm">
            <Download className="h-3.5 w-3.5" /> Ekspor CSV
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-5">
          <button
            className="btn btn-primary disabled:opacity-80"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Menyimpan…" : "Klik untuk loading"}
          </button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
          <button className="btn btn-secondary" disabled>
            Disabled
          </button>
        </div>
        <div className="grid gap-2 p-5 text-[13px] text-stone-500 sm:grid-cols-2">
          <p><Code>btn btn-primary</Code> · <Code>btn-secondary</Code> · <Code>btn-ghost</Code> · <Code>btn-danger</Code></p>
          <p>Ukuran: <Code>btn-sm</Code> (32px) · default (40px) · <Code>btn-lg</Code> (44px)</p>
        </div>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   06 Input
   ──────────────────────────────────────────────────────────── */
function Inputs() {
  const [show, setShow] = useState(false);
  return (
    <Section id="input" no={6} title="Input & form field" desc="Label di atas, hint atau error di bawah. Tinggi 40px, background putih, border stone-300.">
      <div className="card grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sg-nama" className="field-label">Nama lengkap</label>
          <input id="sg-nama" className="input" placeholder="Sesuai KTM" />
          <p className="field-hint">Akan tampil di sertifikat panitia.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sg-nim" className="field-label">NIM</label>
          <input id="sg-nim" className="input font-mono" defaultValue="13012304" aria-invalid="true" aria-describedby="sg-nim-err" />
          <p id="sg-nim-err" className="field-error">NIM harus 10 digit.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sg-divisi" className="field-label">Divisi pilihan</label>
          <select id="sg-divisi" className="input" defaultValue="">
            <option value="" disabled>Pilih divisi</option>
            {DIVISI.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sg-pass" className="field-label">Kata sandi</label>
          <div className="relative">
            <input id="sg-pass" type={show ? "text" : "password"} className="input pr-10" placeholder="Minimal 8 karakter" />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Sembunyikan sandi" : "Lihat sandi"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-stone-400 hover:text-stone-700"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sg-disabled" className="field-label">Email (terkunci)</label>
          <input id="sg-disabled" className="input" defaultValue="aisyah@student.telkomuniversity.ac.id" disabled />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sg-search" className="field-label">Pencarian</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input id="sg-search" type="search" className="input pl-9" placeholder="Cari nama atau NIM" />
          </div>
          <p className="field-hint">Satu-satunya input yang boleh pakai icon, karena icon-nya fungsional.</p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="sg-motivasi" className="field-label">Motivasi</label>
          <textarea id="sg-motivasi" className="input" placeholder="Ceritakan singkat kenapa kamu ingin bergabung" />
        </div>

        <fieldset className="space-y-2.5">
          <legend className="field-label mb-2">Angkatan</legend>
          {[2023, 2024, 2025].map((a, i) => (
            <label key={a} className="flex items-center gap-2.5 text-sm text-stone-700">
              <input type="radio" name="sg-angkatan" defaultChecked={i === 0} className="check" />
              {a}
            </label>
          ))}
        </fieldset>

        <div className="space-y-2.5">
          <p className="field-label mb-2">Persetujuan</p>
          <label className="flex items-start gap-2.5 text-sm text-stone-700">
            <input type="checkbox" defaultChecked className="check mt-0.5" />
            Bersedia tidak menjadi peserta lomba
          </label>
          <label className="flex items-start gap-2.5 text-sm text-stone-700">
            <input type="checkbox" className="check mt-0.5" />
            Bersedia hadir hingga akhir kepanitiaan
          </label>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-stone-500">
        <Code>field-label</Code> · <Code>input</Code> (juga untuk select & textarea) · <Code>field-hint</Code> ·{" "}
        <Code>field-error</Code> + <Code>aria-invalid</Code> · <Code>check</Code>
      </p>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   07 Status
   ──────────────────────────────────────────────────────────── */
function Badges() {
  const all: StatusKind[] = ["diterima", "wawancara", "menunggu", "ditolak", "draft"];
  return (
    <Section
      id="status"
      no={7}
      title="Status"
      desc="Bukan pill berwarna. Status ditandai glyph bintang 8 yang diturunkan dari pattern girih. Warna hanya di glyph, label tetap netral. Bentuknya beda per status, jadi tetap terbaca untuk buta warna dan saat di-print hitam-putih."
    >
      <div className="card grid divide-y divide-stone-100 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {all.map((s) => (
          <div key={s} className="flex items-center gap-4 p-5 sm:flex-col sm:items-start">
            <StatusGlyph status={s} className="!h-9 !w-9" />
            <div>
              <StatusMark status={s} className="font-medium text-stone-900" />
              <p className="mt-1 text-[12px] text-stone-500">{STATUS_META[s].desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="mb-3 text-[13px] font-medium text-stone-500">Di dalam kalimat</p>
          <p className="text-sm leading-relaxed text-stone-700">
            Pendaftaran Aisyah sudah <StatusMark status="diterima" className="align-[-2px]" />, sementara 131 lainnya masih{" "}
            <StatusMark status="menunggu" label="menunggu review" className="align-[-2px]" />.
          </p>
        </div>
        <div className="card p-4">
          <p className="mb-3 text-[13px] font-medium text-stone-500">Hitungan ringkas</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {([
              ["diterima", 96],
              ["menunggu", 131],
              ["ditolak", 21],
            ] as [StatusKind, number][]).map(([s, n]) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-stone-600">
                <StatusGlyph status={s} />
                <span className="font-semibold tabular-nums text-stone-900">{n}</span>
                {STATUS_META[s].label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] text-stone-500">
        <Code>{'<StatusMark status="diterima" />'}</Code> · <Code>{"<StatusGlyph />"}</Code> untuk glyph saja · override teks lewat{" "}
        <Code>label</Code>
      </p>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   08 Tabel
   ──────────────────────────────────────────────────────────── */
function PendaftarTable({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"" | Status>("");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      PENDAFTAR.filter(
        (p) =>
          (!filter || p.status === filter) &&
          (p.nama.toLowerCase().includes(q.toLowerCase()) || p.nim.includes(q)),
      ),
    [q, filter],
  );

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.nim));
  const toggleAll = () =>
    setSelected(allSelected ? [] : rows.map((r) => r.nim));
  const toggle = (nim: string) =>
    setSelected((s) => (s.includes(nim) ? s.filter((x) => x !== nim) : [...s, nim]));

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-stone-200 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input h-9 pl-9"
              placeholder="Cari nama atau NIM"
              aria-label="Cari pendaftar"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "" | Status)}
            className="input h-9 sm:w-48"
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {STATUS_KEYS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 ? (
            <>
              <span className="text-[13px] text-stone-500">{selected.length} dipilih</span>
              <button className="btn btn-secondary btn-sm">Ubah status</button>
            </>
          ) : (
            !compact && (
              <button className="btn btn-secondary btn-sm">
                <Download className="h-3.5 w-3.5" /> Ekspor
              </button>
            )
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10">
                <input type="checkbox" className="check" checked={allSelected} onChange={toggleAll} aria-label="Pilih semua" />
              </th>
              <th>Nama</th>
              <th>NIM</th>
              <th>Divisi pilihan</th>
              {!compact && <th className="text-right">Angkatan</th>}
              <th>Status</th>
              <th className="w-px"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.nim} className={selected.includes(p.nim) ? "bg-mtq-crimson-50/60" : ""}>
                <td>
                  <input
                    type="checkbox"
                    className="check"
                    checked={selected.includes(p.nim)}
                    onChange={() => toggle(p.nim)}
                    aria-label={`Pilih ${p.nama}`}
                  />
                </td>
                <td className="font-medium whitespace-nowrap text-stone-900">{p.nama}</td>
                <td className="font-mono text-[13px]">{p.nim}</td>
                <td className="whitespace-nowrap">{p.divisi}</td>
                {!compact && <td className="text-right tabular-nums">{p.angkatan}</td>}
                <td><StatusMark status={p.status} /></td>
                <td><button className="btn btn-ghost btn-sm">Tinjau</button></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <p className="font-medium text-stone-700">Tidak ada pendaftar yang cocok</p>
                  <p className="mt-1 text-[13px] text-stone-500">Coba kata kunci lain atau reset filter.</p>
                  <button className="btn btn-secondary btn-sm mt-4" onClick={() => { setQ(""); setFilter(""); }}>
                    Reset filter
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-stone-200 px-4 py-2.5 text-[13px] text-stone-500">
        <p>
          Menampilkan <span className="tabular-nums text-stone-700">1–{rows.length}</span> dari{" "}
          <span className="tabular-nums text-stone-700">248</span>
        </p>
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm px-2" disabled aria-label="Halaman sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="btn btn-ghost btn-sm px-2" aria-label="Halaman berikutnya">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   09 Contoh form
   ──────────────────────────────────────────────────────────── */
function FormExample() {
  const [nim, setNim] = useState("13012304");
  const nimInvalid = nim.length > 0 && !/^\d{10}$/.test(nim);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="card overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        if (nimInvalid) return;
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 p-5">
        <div>
          <h3 className="font-serif text-2xl font-medium tracking-tight">Tambah anggota panitia</h3>
          <p className="mt-1 text-sm text-stone-500">Data ini dipakai untuk ID card dan sertifikat.</p>
        </div>
        <DataContoh />
      </div>

      <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fx-nama" className="field-label">Nama lengkap</label>
          <input id="fx-nama" className="input" defaultValue="Aisyah Rahmawati" required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fx-nim" className="field-label">NIM</label>
          <input
            id="fx-nim"
            inputMode="numeric"
            className="input font-mono"
            value={nim}
            onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))}
            aria-invalid={nimInvalid}
            aria-describedby="fx-nim-msg"
          />
          {nimInvalid ? (
            <p id="fx-nim-msg" className="field-error">NIM harus 10 digit. Sekarang {nim.length} digit.</p>
          ) : (
            <p id="fx-nim-msg" className="field-hint">10 digit, tanpa spasi.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fx-email" className="field-label">Email kampus</label>
          <input id="fx-email" type="email" className="input" placeholder="nama@student.telkomuniversity.ac.id" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fx-divisi" className="field-label">Divisi</label>
          <select id="fx-divisi" className="input" defaultValue="Acara & Teknis">
            {DIVISI.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fx-peran" className="field-label">Peran</label>
          <select id="fx-peran" className="input" defaultValue="Staf">
            <option>Koordinator</option>
            <option>Wakil koordinator</option>
            <option>Staf</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fx-wa" className="field-label">
            No. WhatsApp <span className="font-normal text-stone-400">(opsional)</span>
          </label>
          <input id="fx-wa" type="tel" className="input" placeholder="08xx xxxx xxxx" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="fx-catatan" className="field-label">
            Catatan <span className="font-normal text-stone-400">(opsional)</span>
          </label>
          <textarea id="fx-catatan" className="input" placeholder="Misal: berhalangan hadir saat technical meeting" />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-stone-700 sm:col-span-2">
          <input type="checkbox" defaultChecked className="check mt-0.5" />
          Anggota sudah menyatakan bersedia tidak menjadi peserta lomba
        </label>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-stone-200 bg-stone-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-end">
        {saved && (
          <p role="status" className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Tersimpan
          </p>
        )}
        <button type="button" className="btn btn-secondary">Batal</button>
        <button type="submit" className="btn btn-primary" disabled={nimInvalid}>Simpan anggota</button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────
   10 Contoh dashboard
   ──────────────────────────────────────────────────────────── */
function DashboardExample() {
  const [active, setActive] = useState("Ringkasan");
  const menu = [
    { label: "Ringkasan", icon: LayoutDashboard },
    { label: "Pendaftar", icon: Users, count: 131 },
    { label: "Divisi", icon: Layers },
    { label: "Agenda", icon: CalendarDays },
    { label: "Dokumen", icon: FileText },
  ];
  const stats = [
    { label: "Total pendaftar", value: 248, note: "+18 minggu ini" },
    { label: "Diterima", value: 96, note: "39% dari total" },
    { label: "Menunggu review", value: 131, note: "Perlu ditinjau", warn: true },
    { label: "Ditolak", value: 21, note: "8% dari total" },
  ];
  const kuota = [
    { divisi: "Acara & Teknis", isi: 34, kuota: 40 },
    { divisi: "Kesekretariatan", isi: 15, kuota: 20 },
    { divisi: "Broadcasting & IT", isi: 25, kuota: 25 },
    { divisi: "Pubdok & Desain", isi: 22, kuota: 30 },
  ];
  const agenda = [
    { tgl: "17", bln: "Okt", judul: "Wawancara gelombang 2", info: "08.00 · Gedung TULT lt. 6" },
    { tgl: "20", bln: "Okt", judul: "Pengumuman panitia", info: "19.00 · Instagram & portal" },
    { tgl: "24", bln: "Okt", judul: "Rapat perdana", info: "13.00 · Masjid Syamsul Ulum" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-mtq-canvas shadow-sm">
      <div className="flex min-h-[640px]">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
          <div className="flex h-14 items-center gap-2.5 border-b border-stone-200 px-4">
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-full object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">MTQ Tel-U 2026</p>
              <p className="text-[11px] text-stone-500">Portal Kepanitiaan</p>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-2">
            {menu.map((m) => {
              const on = active === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => setActive(m.label)}
                  className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition ${
                    on ? "bg-mtq-crimson-50 font-medium text-mtq-crimson-dark" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {on && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-mtq-crimson" />}
                  <m.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{m.label}</span>
                  {m.count && <span className="font-mono text-[11px] text-stone-400">{m.count}</span>}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-stone-200 p-2">
            <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-100">
              <Settings className="h-4 w-4" /> Pengaturan
            </button>
            <div className="mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mtq-forest text-[11px] font-semibold text-white">
                FA
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">Fadhil A.</p>
                <p className="truncate text-[11px] text-stone-500">Sekretaris umum</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-5">
            <p className="text-sm text-stone-500">
              Panitia <span className="text-stone-300">/</span> <span className="text-stone-900">{active}</span>
            </p>
            <div className="flex items-center gap-2">
              <DataContoh />
              <button className="btn btn-ghost btn-sm px-2" aria-label="Notifikasi">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-serif text-3xl font-medium tracking-tight">Ringkasan pendaftaran</h3>
                <p className="mt-1 text-sm text-stone-500">Pendaftaran panitia ditutup dalam 4 hari.</p>
              </div>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4" /> Tambah anggota
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 xl:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white p-4">
                  <p className="text-[13px] text-stone-500">{s.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{s.value}</p>
                  <p className={`mt-1 text-xs ${s.warn ? "font-medium text-amber-700" : "text-stone-400"}`}>{s.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              {/* Kuota */}
              <div className="card p-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold">Kuota per divisi</h4>
                  <p className="text-xs text-stone-400">diterima / kuota</p>
                </div>
                <ul className="mt-4 space-y-4">
                  {kuota.map((k) => {
                    const pct = Math.round((k.isi / k.kuota) * 100);
                    const full = k.isi >= k.kuota;
                    return (
                      <li key={k.divisi}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-stone-700">{k.divisi}</span>
                          <span className="tabular-nums text-stone-500">
                            {full && <span className="mr-2 text-xs font-medium text-emerald-700">Penuh</span>}
                            {k.isi}/{k.kuota}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full ${full ? "bg-emerald-600" : "bg-mtq-crimson"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Agenda */}
              <div className="card p-4">
                <h4 className="font-semibold">Agenda terdekat</h4>
                <ul className="mt-3 divide-y divide-stone-100">
                  {agenda.map((a) => (
                    <li key={a.judul} className="flex items-center gap-3 py-2.5">
                      <div className="w-11 shrink-0 rounded-md border border-stone-200 text-center">
                        <p className="border-b border-stone-200 bg-stone-50 text-[10px] font-medium text-mtq-crimson">{a.bln}</p>
                        <p className="py-0.5 text-base font-semibold tabular-nums">{a.tgl}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.judul}</p>
                        <p className="truncate text-xs text-stone-500">{a.info}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <h4 className="font-semibold">Pendaftar terbaru</h4>
                <button className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline">
                  Lihat semua
                </button>
              </div>
              <PendaftarTable compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   11 Publikasi
   ──────────────────────────────────────────────────────────── */
function Publikasi() {
  return (
    <Section
      id="publikasi"
      no={11}
      title="Elemen publikasi"
      desc="Diturunkan dari poster. Khusus halaman publik (open recruitment, landing). Jangan dipakai di dashboard atau form internal."
    >
      <div className="card space-y-6 p-6">
        <p className="poster-wordmark select-none text-5xl font-extrabold tracking-tight">MTQ Tel-U 2026</p>
        <div className="flex flex-wrap gap-2">
          {["Poin TAK", "Tidak dipungut biaya", "Merchandise panitia", "Pengalaman dan relasi", "Disupervisi langsung oleh dosen"].map(
            (b) => (
              <span key={b} className="poster-pill-dashed-light">{b}</span>
            ),
          )}
        </div>
        <div className="flex gap-2">
          <span className="h-8 w-16 rounded-md bg-mtq-orange" title="#E05315" />
          <span className="h-8 w-16 rounded-md bg-mtq-amber" title="#F28522" />
          <p className="self-center text-[13px] text-stone-500">Oranye & amber poster</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-stone-500">
        <Code>poster-wordmark</Code> · <Code>poster-pill-dashed-light</Code> · <Code>tab-pill-light</Code>
      </p>
    </Section>
  );
}
