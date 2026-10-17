"use client";

import React from "react";
import {
  Landmark,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  HeartHandshake,
  Package,
  Wallet,
} from "lucide-react";
import { DashboardKPISummary } from "@/app/types";

interface KPICardsProps {
  summary: DashboardKPISummary;
  selectedSectionId?: number | null;
  onSelectSection?: (id: number | null) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  summary,
  selectedSectionId = null,
  onSelectSection,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Kas Gabungan */}
        <div className="bg-white border border-gray-200 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span>Total Saldo Kas (Grand Total)</span>
            <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
              {formatRupiah(summary.grand_total_cash)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-mono">
              <span>Kas Umum + Seluruh Seksi</span>
            </div>
          </div>
        </div>

        {/* Kas Umum Utama */}
        <div className="bg-white border border-gray-200 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span>Kas Umum (Induk)</span>
            <Landmark className="w-4 h-4 text-gray-700 shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
              {formatRupiah(summary.total_general_balance)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between font-mono">
              <span>Kode: KAS-01</span>
              <span className="text-emerald-700 font-medium">Aktif</span>
            </div>
          </div>
        </div>

        {/* Alokasi Seksi-Seksi */}
        <div className="bg-white border border-gray-200 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span>Total Kas Seksi-Seksi</span>
            <Layers className="w-4 h-4 text-gray-700 shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
              {formatRupiah(summary.total_sections_balance)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between font-mono">
              <span>4 Seksi Pelaksana</span>
              <span className="text-gray-700">Tersinkron</span>
            </div>
          </div>
        </div>

        {/* Dana Punia Terhimpun */}
        <div className="bg-white border border-gray-200 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span>Dana Punia Terhimpun</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700 tabular-nums tracking-tight">
              {formatRupiah(summary.total_punia_money)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 font-mono">
              <Package className="w-3.5 h-3.5 text-gray-500" />
              <span>{summary.total_punia_goods_count} Punia Berupa Barang/Upakara</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Flow & Section Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Arus Kas Global (Pemasukan & Pengeluaran) */}
        <div className="lg:col-span-4 bg-gray-50 border border-gray-200 p-3.5 rounded flex items-center justify-around">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white border border-gray-200 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Total Pemasukan</div>
              <div className="text-sm font-bold text-gray-900 tabular-nums">
                {formatRupiah(summary.total_income_all)}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-300"></div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white border border-gray-200 flex items-center justify-center text-red-700">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Total Pengeluaran</div>
              <div className="text-sm font-bold text-gray-900 tabular-nums">
                {formatRupiah(summary.total_expense_all)}
              </div>
            </div>
          </div>
        </div>

        {/* Seksi Allocations Quick Bar */}
        <div className="lg:col-span-8 bg-white border border-gray-200 p-2.5 rounded flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2 shrink-0">
            Alokasi Seksi:
          </span>
          <div className="flex items-center gap-2 flex-1">
            {summary.section_summaries.map((sec) => {
              const isSelected = selectedSectionId === sec.section_id;
              return (
                <button
                  key={sec.section_id}
                  onClick={() => onSelectSection && onSelectSection(isSelected ? null : sec.section_id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs cursor-pointer transition-colors shrink-0 ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-900 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-mono text-[10px] text-gray-500">{sec.section_code}</span>
                  <span className="truncate max-w-[120px]">{sec.section_name}</span>
                  <span className="font-bold tabular-nums font-mono text-[11px] text-gray-900 pl-1 border-l border-gray-200">
                    {formatRupiah(sec.current_balance)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
