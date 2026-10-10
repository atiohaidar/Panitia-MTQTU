# Portal Kepanitiaan MTQ Telkom University 2026

Platform internal kepanitiaan Musabaqah Tilawatil Qur'an (MTQ) Telkom University 2026. Dibangun dengan **React Router v8**, **Cloudflare Workers**, dan **Cloudflare D1 (SQLite Database)** dengan sistem desain resmi bernuansa Islami modern.

---

## 🔑 Kredensial Akun Super Admin

Gunakan akun resmi berikut untuk masuk ke portal kepanitiaan:

| Field | Detail |
| :--- | :--- |
| **NIM** | `1301220001` |
| **Email Kampus** | `admin@telkomuniversity.ac.id` |
| **Kata Sandi (Password)** | `mtq2026-admin` *(atau `mtq2026-0001`)* |
| **Peran (Role)** | `SUPER_ADMIN` |
| **Divisi** | Badan Pengurus Harian (BPH) |

> 💡 **Catatan:** Anda dapat login menggunakan **NIM** maupun **Email**. Setelah login, kata sandi akun dapat diubah sewaktu-waktu melalui menu **Pengaturan / Ganti Kata Sandi** di pojok kiri bawah sidebar.

---

## 🏛️ Struktur Divisi Standar (D1 Database)

Database saat ini telah dibersihkan dari akun-akun demo tiruan, dan hanya menyisakan akun Super Admin serta 5 divisi utama kepanitiaan MTQ:

1. **Badan Pengurus Harian (BPH)** — Ketua Pelaksana, Sekretaris, Bendahara, dan pimpinan inti.
2. **Divisi Acara** — Rundown, teknis perlombaan, gladi resik, dan tata panggung.
3. **Divisi PDD** — Publikasi, Desain Grafis, Dokumentasi visual & media sosial.
4. **Broadcasting & IT** — Sistem aplikasi, live streaming YouTube, audio-visual studio.
5. **Divisi Logistik & Konsumsi** — Pengadaan aset perlengkapan, konsumsi panitia, dan kafilah.

*(Super Admin dapat menambah, mengedit, atau menyesuaikan divisi kapan saja di menu **Divisi**).*

---

## 🚀 Memulai Aplikasi (Local Development)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Migrasi Database D1 Lokal
```bash
npx wrangler d1 migrations apply DB --local
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser di **`http://localhost:5173`**.

---

## 📋 Fitur Utama Sistem

- **Sistem Autentikasi Nyata (Real Auth Guard):**
  - Session cookie terenkripsi HMAC-SHA256 (`__mtq_session`).
  - Proteksi rute `/admin/*` yang otomatis me-redirect ke login jika belum terautentikasi.
- **Dashboard Ringkasan (Design System Styleguide):**
  - Tampilan persis referensi *Contoh: dashboard* di styleguide MTQ Tel-U 2026.
  - Kartu metrik 4-kolom, kuota per divisi dengan visual progress bar, dan agenda terdekat.
- **Manajemen Panitia (Data Panitia):**
  - Pencarian cepat (NIM, Nama, Email), filter divisi, dan filter peran.
  - Input anggota panitia satuan via modal.
  - Reset kata sandi per panitia.
- **Batch Spreadsheet Importer (Modal Pintar):**
  - Copy baris data langsung dari Google Sheets atau Excel (`NIM | Nama | Divisi | Role | WhatsApp`).
  - Tombol **"Import spreadsheet"** terletak di dalam halaman Panitia (bukan di sidebar).
  - Dilengkapi fitur parsing cerdas dan pratinjau validasi visual sebelum disimpan permanen ke database D1.
- **Struktur Divisi:**
  - Tambah, ubah deskripsi, dan pantau daftar panitia di masing-masing divisi.

---

## 🛠️ Tech Stack

- **Framework:** React Router v8 (Framework Mode)
- **Runtime:** Cloudflare Workers (`@cloudflare/vite-plugin`)
- **Database:** Cloudflare D1 (SQLite Serverless)
- **Styling:** Vanilla CSS + TailwindCSS tokens (`@theme` MTQ Tel-U)
- **Icons:** Lucide React
- **Typography:** Fraunces (Serif), Geist (Sans), Amiri (Arabic)

---

© 2026 MTQ Telkom University · Musabaqah Tilawatil Qur'an
