// app/components/agenda/agenda-filter-bar.tsx
// Toolbar Pencarian & Filter Agenda Pertemuan MTQ Tel-U 2026

import React from "react";
import { Search } from "lucide-react";

interface AgendaFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTypeFilter: string;
  onTypeFilterChange: (value: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onReset: () => void;
}

export function AgendaFilterBar({
  searchQuery,
  onSearchChange,
  selectedTypeFilter,
  onTypeFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  onReset,
}: AgendaFilterBarProps) {
  const isFiltered =
    Boolean(searchQuery) ||
    selectedTypeFilter !== "ALL" ||
    selectedStatusFilter !== "ALL";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
      <div className="relative flex-1">
        <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari nama agenda atau lokasi pertemuan..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-mtq-crimson bg-[#fafaf9]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedTypeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:outline-none focus:border-mtq-crimson"
        >
          <option value="ALL">Semua Tipe Pertemuan</option>
          <option value="PLENO">Rapat Pleno (Semua)</option>
          <option value="DIVISI">Internal Divisi</option>
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:outline-none focus:border-mtq-crimson"
        >
          <option value="ALL">Semua Status</option>
          <option value="ONGOING">Sedang Berlangsung (Live)</option>
          <option value="UPCOMING">Mendatang</option>
          <option value="PAST_DUE">Lewat Jadwal</option>
          <option value="COMPLETED">Selesai & Terekap</option>
        </select>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-stone-500 hover:text-stone-800 transition px-2 font-medium"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
