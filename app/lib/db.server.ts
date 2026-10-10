// app/lib/db.server.ts
// Helper terpusat untuk mengakses Cloudflare D1 Database binding di seluruh loader & action

/**
 * Mendapatkan instance D1Database dari Cloudflare Workers environment.
 * Mengembalikan undefined jika berjalan di local dev tanpa D1 binding aktif.
 */
export async function getDb(request?: Request): Promise<D1Database | undefined> {
  try {
    const cf = await import("cloudflare:workers");
    return cf.env?.DB;
  } catch {
    return undefined;
  }
}
