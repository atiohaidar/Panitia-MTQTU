// app/types/panitia.ts
// Tipe data bersama untuk ekosistem kepanitiaan MTQ Tel-U 2026

export type CommitteeRole =
  | "SUPER_ADMIN"
  | "KETUA_PELAKSANA"
  | "SEKRETARIS"
  | "BENDAHARA"
  | "SC"
  | "KETUA_DIVISI"
  | "ANGGOTA";

export interface Division {
  id: string;
  name: string;
  description: string;
  colorBadge: string;
}

export interface CommitteeMember {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string;
  divisionId: string;
  role: CommitteeRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string;
  divisionId: string;
  divisionName?: string;
  role: string | CommitteeRole;
  isActive: boolean;
}
