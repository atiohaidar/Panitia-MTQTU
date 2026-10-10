// app/routes/logout.ts
// Handler aksi logout resmi panitia

import { redirect } from "react-router";
import { createLogoutResponse } from "../lib/auth.server";

export async function action() {
  return createLogoutResponse("/");
}

export async function loader() {
  return createLogoutResponse("/");
}
