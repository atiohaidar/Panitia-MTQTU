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

export type EventType = "PLENO" | "DIVISI";
export type TargetAudience = "ALL" | "DIVISION" | "LEADERS" | "CUSTOM";
export type EventStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type AttendanceStatus = "HADIR" | "IZIN" | "SAKIT" | "ALPHA";

export interface AttendanceCounts {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface CommitteeEvent {
  id: string;
  title: string;
  type: EventType;
  divisionId: string | null;
  divisionName?: string;
  targetAudience?: TargetAudience;
  customMemberIds?: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string | null; // HH:mm
  location: string;
  description?: string | null;
  createdBy: string;
  createdByName?: string;
  status: EventStatus;
  createdAt: string;
  attendanceCounts?: AttendanceCounts;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  memberName?: string;
  memberNim?: string;
  memberDivisionId?: string;
  memberDivisionName?: string;
  memberRole?: CommitteeRole;
  status: AttendanceStatus;
  notes?: string | null;
  recordedBy: string;
  recordedByName?: string;
  recordedAt: string;
}
