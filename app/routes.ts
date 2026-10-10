import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("logout", "routes/logout.ts"),
  route("styleguide", "routes/styleguide.tsx"),
  route("mockups", "routes/mockups.tsx"),
  layout("routes/admin.tsx", [
    route("admin", "routes/admin.index.tsx"),
    route("admin/panitia", "routes/admin.panitia.tsx"),
    route("admin/divisi", "routes/admin.divisi.tsx"),
  ]),
] satisfies RouteConfig;
