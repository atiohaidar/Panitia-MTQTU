import React from "react";
import { Link } from "react-router";
import { ArrowLeft, Check, Sparkles, ExternalLink, Smartphone, Layout, Monitor } from "lucide-react";

export function meta() {
  return [
    { title: "Mockup Gallery Opsi Login - MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Galeri perbandingan opsi desain login panitia MTQTU 2026",
    },
  ];
}

export default function MockupsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans">
      {/* Top Bar */}
      <header className="border-b border-stone-200 bg-white/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#c9242b] transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Login</span>
            </Link>
            <span className="text-stone-300">|</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Galeri Opsi Mockup Desain (SVG)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/styleguide"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
            >
              Lihat Styleguide
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="border-b border-stone-200 bg-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c9242b]">
            Design Exploration
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Pilihan Konsep Desain <span className="text-[#c9242b]">Login Panitia</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600">
            Berikut 3 konsep desain SVG yang dibuat khusus berdasarkan kriteria lo: <strong>sederhana, minim distraksi, mobile-friendly di HP, dan mempertahankan card dengan tab kecil menempel di atasnya</strong>.
          </p>
        </div>
      </div>

      {/* Mockup Comparison Grid */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* OPSI 1 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-[#c9242b]">
                  OPSI 1
                </span>
                <span className="text-xs font-semibold text-stone-500">Ultra-Minimal Centered</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3">Tab Tengah Minimalis</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Fokus total pada 2 input (Email & Sandi) dan tombol Masuk. Tab merah menempel persis di tengah atas card.
              </p>

              {/* SVG Image Preview */}
              <div className="mt-4 rounded-2xl border border-stone-200 bg-[#faf8f5] p-2 overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src="/mockups/opsi-1-clean-minimal.svg"
                  alt="Opsi 1 Minimal Centered"
                  className="w-full h-auto object-contain rounded-xl hover:scale-105 transition duration-300"
                />
              </div>

              {/* Highlights */}
              <ul className="mt-4 space-y-1.5 text-xs text-stone-600">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Nol scroll di layar handphone</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Tab "PANITIA MASUK" simetris di tengah</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Form input lega & nyaman untuk jempol</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <a
                href="/mockups/opsi-1-clean-minimal.svg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-[#c9242b] border border-rose-200 bg-rose-50/50 rounded-xl hover:bg-rose-100/70 transition"
              >
                <span>Buka Gambar SVG Penuh</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* OPSI 2 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-[#e05315]">
                  OPSI 2
                </span>
                <span className="text-xs font-semibold text-stone-500">Poster Tab Heritage</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3">Tab Kiri Khas Poster</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Tab merah menempel di sudut kiri atas card (persis seperti kotak "Persyaratan" di poster). Form tetap ringkas.
              </p>

              {/* SVG Image Preview */}
              <div className="mt-4 rounded-2xl border border-stone-200 bg-[#faf8f5] p-2 overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src="/mockups/opsi-2-poster-tab.svg"
                  alt="Opsi 2 Poster Tab Heritage"
                  className="w-full h-auto object-contain rounded-xl hover:scale-105 transition duration-300"
                />
              </div>

              {/* Highlights */}
              <ul className="mt-4 space-y-1.5 text-xs text-stone-600">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Struktur paling otentik menyerupai poster</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Tab "PORTAL MASUK" di kiri atas card</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Satu baris catatan resmi panitia di bawah</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <a
                href="/mockups/opsi-2-poster-tab.svg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-[#e05315] border border-orange-200 bg-orange-50/50 rounded-xl hover:bg-orange-100/70 transition"
              >
                <span>Buka Gambar SVG Penuh</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* OPSI 3 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  OPSI 3
                </span>
                <span className="text-xs font-semibold text-stone-500">Mobile-First Device View</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3">Simulasi Layar Smartphone</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Pratinjau langsung bagaimana card dan tab menempel saat dilihat dari layar handphone pengguna.
              </p>

              {/* SVG Image Preview */}
              <div className="mt-4 rounded-2xl border border-stone-200 bg-[#faf8f5] p-2 overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src="/mockups/opsi-3-compact-mobile.svg"
                  alt="Opsi 3 Mobile View Preview"
                  className="w-full h-auto object-contain rounded-xl hover:scale-105 transition duration-300"
                />
              </div>

              {/* Highlights */}
              <ul className="mt-4 space-y-1.5 text-xs text-stone-600">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Didesain proporsional untuk ukuran layar 360-400px</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Ergonomis: jari jempol mudah menjangkau tombol</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Card kompak tanpa padding mubazir</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <a
                href="/mockups/opsi-3-compact-mobile.svg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50/50 rounded-xl hover:bg-emerald-100/70 transition"
              >
                <span>Buka Gambar SVG Penuh</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
