import React, { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { GirihPattern } from "../components/girih-pattern";

export function meta() {
  return [
    { title: "Masuk Panitia · MTQ Tel-U 2026" },
    {
      name: "description",
      content: "Portal masuk resmi panitia MTQ Telkom University 2026.",
    },
  ];
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    }, 600);
  };

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
        {import.meta.env.DEV && (
          <Link
            to="/styleguide"
            className="absolute right-6 top-6 rounded-md border border-dashed border-stone-300 px-2 py-1 font-mono text-[11px] text-stone-500 hover:border-stone-400 hover:text-stone-700"
          >
            dev: styleguide
          </Link>
        )}

        <div className="w-full max-w-[380px]">
          <p className="text-sm font-medium text-mtq-crimson">Portal Kepanitiaan</p>
          <h1 className="mt-2 font-serif text-[2.1rem] font-medium leading-tight tracking-tight text-stone-900">
            Assalamu&apos;alaikum, Panitia.
          </h1>
          <p className="mt-2 text-[15px] text-stone-500">
            Masuk dengan akun panitia yang sudah terdaftar.
          </p>

          {loginSuccess && (
            <div
              role="status"
              className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Login berhasil! Siap disambungkan ke D1 database.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-sm font-medium text-stone-700">
                Email Telkom atau NIM
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@telkomuniversity.ac.id atau NIM"
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
                    alert("Tautan reset sandi akan dikirim ke email panitia.");
                  }}
                  className="text-sm text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline"
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
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-stone-400 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-mtq-crimson"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-stone-600">
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
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full disabled:opacity-80"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Memverifikasi…" : "Masuk"}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-stone-400 lg:hidden">
            © 2026 MTQ Telkom University
          </p>
        </div>
      </main>
    </div>
  );
}
