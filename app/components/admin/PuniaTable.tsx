"use client";

import React, { useState, useMemo } from "react";
import {
  HeartHandshake,
  Search,
  Package,
  Plus,
  Coins,
  Calendar,
  CheckCircle2,
  Download,
} from "lucide-react";
import { PuniaDonation } from "@/app/types";

interface PuniaTableProps {
  puniaList: PuniaDonation[];
  onOpenNewPunia?: () => void;
}

export const PuniaTable: React.FC<PuniaTableProps> = ({
  puniaList,
  onOpenNewPunia,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const filteredPunia = useMemo(() => {
    return puniaList.filter((p) => {
      if (typeFilter !== "all" && p.donation_type !== typeFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const donorMatch = p.donor_name.toLowerCase().includes(query);
        const goodsMatch = p.goods_name?.toLowerCase().includes(query);
        const notesMatch = p.notes?.toLowerCase().includes(query);
        if (!donorMatch && !goodsMatch && !notesMatch) return false;
      }
      return true;
    });
  }, [puniaList, typeFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      "No",
      "Tanggal",
      "ID Ref",
      "Nama Donatur / Krama",
      "Bentuk Punia",
      "Nominal Tunai (IDR)",
      "Nama Barang",
      "Jumlah Barang",
      "Catatan / Peruntukan",
      "Petugas Loket",
    ];

    const rows = filteredPunia.map((p, idx) => {
      return [
        idx + 1,
        `"${p.date}"`,
        `"PN-${p.id.toString().padStart(4, "0")}"`,
        `"${p.donor_name.replace(/"/g, '""')}"`,
        `"${p.donation_type === "money" ? "Uang Tunai" : "Barang / Upakara"}"`,
        p.donation_type === "money" ? (p.amount_money || 0) : 0,
        `"${(p.goods_name || "-").replace(/"/g, '""')}"`,
        `"${(p.goods_quantity || "-").replace(/"/g, '""')}"`,
        `"${(p.notes || "-").replace(/"/g, '""')}"`,
        `"${p.staff?.full_name || p.staff?.username || "Petugas Loket"}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daftar_Punia_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama donatur / barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 sm:inline-flex rounded border border-gray-200 bg-gray-50 p-0.5 text-xs w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors text-center ${
                typeFilter === "all"
                  ? "bg-white text-gray-900 font-semibold border border-gray-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter("money")}
              className={`px-2.5 py-1 rounded transition-colors text-center ${
                typeFilter === "money"
                  ? "bg-emerald-700 text-white font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Uang (Rp)
            </button>
            <button
              onClick={() => setTypeFilter("goods")}
              className={`px-2.5 py-1 rounded transition-colors text-center ${
                typeFilter === "goods"
                  ? "bg-blue-700 text-white font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Barang
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh data donasi saat ini ke format Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Unduh CSV</span>
          </button>
          <span className="text-xs text-gray-500 font-mono">
            Total <strong>{filteredPunia.length}</strong> Donasi
          </span>
          {onOpenNewPunia && (
            <button
              onClick={onOpenNewPunia}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Punia</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
              <th className="py-2.5 px-3">Nama Donatur / Krama</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Bentuk Punia</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Nominal / Rincian Barang</th>
              <th className="py-2.5 px-3">Catatan / Peruntukan</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Petugas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPunia.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <HeartHandshake className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-medium">Tidak ada data punia yang cocok</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPunia.map((punia) => {
                const isMoney = punia.donation_type === "money";

                return (
                  <tr key={punia.id} className="hover:bg-gray-50 transition-colors text-gray-900">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                      {punia.date}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {punia.donor_name}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          isMoney
                            ? "bg-emerald-700 text-white"
                            : "bg-blue-700 text-white"
                        }`}
                      >
                        {isMoney ? <Coins className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                        <span>{isMoney ? "Dana Tunai" : "Barang"}</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap">
                      {isMoney && punia.amount_money ? (
                        <span className="text-emerald-700 font-mono text-sm">
                          {formatRupiah(punia.amount_money)}
                        </span>
                      ) : (
                        <span className="text-gray-900 font-mono">
                          {punia.goods_quantity} {punia.goods_name}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">
                      {punia.notes || "-"}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {punia.staff?.username || "Panitia Punia"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Terbuka untuk Verifikasi Publik (Public Auditability)</span>
        </div>
        <div className="font-mono text-[11px]">Panitia Punia Karya Metra 2026</div>
      </div>
    </div>
  );
};
