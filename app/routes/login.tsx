import React, { useState } from "react";
import { Link, Form, useActionData, useNavigation, redirect } from "react-router";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { GirihPattern } from "../components/girih-pattern";
import { authenticateUser, getUser, createLoginResponse } from "../lib/auth.server";

export function meta() {
  return [
    { title: "Masuk Panitia · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Portal masuk resmi panitia MTQ Telkom University 2026.",
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

  // Jika user sudah login, arahkan langsung ke dashboard
  const user = await getUser(request, db);
  if (user) {
    throw redirect("/admin");
  }

  return { isD1Ready: Boolean(db) };
}

export async function action({ request }: { request: Request }) {
  let db: D1Database | undefined;
  try {
    const cf = await import("cloudflare:workers");
    db = cf.env?.DB;
  } catch {
    db = undefined;
  }

  const formData = await request.formData();
  const identifier = (formData.get("identifier") as string) || "";
  const password = (formData.get("password") as string) || "";

  if (!identifier.trim() || !password.trim()) {
    return { error: "NIM / Email dan kata sandi wajib diisi." };
  }

  if (db) {
    const user = await authenticateUser(db, identifier, password);
    if (!user) {
      return {
        error: "NIM / Email atau kata sandi tidak cocok. Silakan periksa kembali.",
      };
    }
    return createLoginResponse(user.id, "/admin");
  } else {
    // Fallback autentikasi jika DB lokal belum terhubung
    if (
      (identifier === "1301220001" || identifier === "admin@telkomuniversity.ac.id") &&
      (password === "mtq2026-admin" || password === "mtq2026-0001")
    ) {
      return createLoginResponse("usr-1", "/admin");
    }
    return {
      error: "NIM / Email atau kata sandi tidak cocok. Silakan periksa kembali.",
    };
  }
}

export default function LoginPage() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const inputClass = "input h-11 px-3.5 text-[15px]";

  return (
    <div className="grid min-h-dvh bg-white text-stone-900 lg:grid-cols-[1.1fr_1fr]">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-mtq-crimson px-6 py-6 text-white sm:px-10 lg:px-14 lg:py-12">
        <div className="text-white/[0.13]">
          <GirihPattern />
        </div>

        <div className="relative flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo MTQTU"
            className="h-11 w-11 shrink-0 rounded-full bg-white object-contain p-0.5"
          />
          <div className="leading-tight">
            <p className="font-semibold">MTQ Tel-U 2026</p>
            <p className="text-sm text-white/70">Musabaqah Tilawatil Qur&apos;an</p>
          </div>
        </div>

        <figure className="relative my-16 hidden max-w-md lg:block">
          <blockquote>
            <p
              lang="ar"
              dir="rtl"
              className="font-arabic text-right text-5xl leading-[1.6] text-white"
            >
              وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ
            </p>
            <p className="mt-6 font-serif text-2xl italic leading-snug text-white/90">
              &ldquo;Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan
              dan takwa.&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/60">
            QS. Al-Mā&apos;idah [5]: 2
          </figcaption>
        </figure>

        <p className="relative hidden text-sm text-white/60 lg:block">
          © 2026 MTQ Telkom University
        </p>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[390px]">
          <p className="text-sm font-medium text-mtq-crimson">Portal Kepanitiaan</p>
          <h1 className="mt-2 font-serif text-[2.1rem] font-medium leading-tight tracking-tight text-stone-900">
            Assalamu&apos;alaikum, Panitia.
          </h1>
          <p className="mt-2 text-[15px] text-stone-500">
            Masuk dengan akun panitia yang terdaftar di sistem.
          </p>

          {/* Alert Error jika login gagal */}
          {actionData?.error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {actionData.error}
              </div>
            </div>
          )}

          <Form method="post" className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-sm font-medium text-stone-700">
                NIM
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="masukan nim"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                  Kata sandi
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Silakan hubungi Super Admin untuk mereset kata sandi Anda.");
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 hover:underline"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className={`${inputClass} pr-11 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-stone-600 pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="check"
              />
              Ingat saya di perangkat ini
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg w-full disabled:opacity-80 mt-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Memverifikasi ke D1..." : "Masuk"}
            </button>
          </Form>

          <div className="mt-8 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
            <Link to="/styleguide" className="hover:text-stone-800 transition">
              Lihat Styleguide
            </Link>
            <Link to="/mockups" className="hover:text-stone-800 transition">
              Galeri Mockup
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            © 2026 MTQ Telkom University
          </p>
        </div>
      </main>
    </div>
  );
}
