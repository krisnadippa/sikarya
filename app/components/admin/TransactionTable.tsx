"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  Link as LinkIcon,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle,
  Lock,
  X,
} from "lucide-react";
import { Section, Transaction } from "@/app/types";

interface TransactionTableProps {
  transactions: Transaction[];
  sections?: Section[];
  selectedSectionId?: number | null;
  onSelectSection?: (id: number | null) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onOpenNewTransaction?: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  isSeksiView?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  sections = [],
  selectedSectionId = null,
  onSelectSection,
  onViewReceipt,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  isSeksiView = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Section Filter
      if (selectedSectionId !== null && tx.section_id !== selectedSectionId) {
        return false;
      }
      // Type Filter
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const refMatch = tx.ref_no.toLowerCase().includes(query);
        const secMatch = tx.section?.section_name.toLowerCase().includes(query);
        if (!descMatch && !refMatch && !secMatch) return false;
      }
      return true;
    });
  }, [transactions, selectedSectionId, typeFilter, searchQuery]);

  const hasActionColumn = Boolean(onEditTransaction || onDeleteTransaction);

  const confirmDelete = () => {
    if (txToDelete && onDeleteTransaction) {
      onDeleteTransaction(txToDelete);
      setTxToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "No",
      "Tanggal",
      "No. Referensi",
      "Seksi / Unit",
      "Uraian Transaksi",
      "Jenis",
      "Pemasukan (IDR)",
      "Pengeluaran (IDR)",
      "Saldo (IDR)",
      "Kode E-File Bukti",
    ];

    const rows = filteredTransactions.map((tx, idx) => {
      const eFileName =
        tx.receipt_file_url?.split("/").pop() ||
        `${tx.section?.section_code || "BU"}_${tx.id}_${tx.ref_no}_${tx.date.replace(/-/g, "_")}.png`;

      return [
        idx + 1,
        `"${tx.date}"`,
        `"${tx.ref_no}"`,
        `"${tx.section?.section_name || "Kas Umum"}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}"`,
        tx.type === "income" ? tx.amount : 0,
        tx.type === "expense" ? tx.amount : 0,
        tx.balance,
        `"${eFileName}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daftar_Transaksi_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
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
              placeholder="Cari uraian transaksi / No. Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          {/* Seksi Selector (if available) */}
          {sections.length > 0 && onSelectSection && (
            <select
              value={selectedSectionId ?? ""}
              onChange={(e) =>
                onSelectSection(e.target.value === "" ? null : Number(e.target.value))
              }
              className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600 cursor-pointer"
            >
              <option value="">Semua Seksi & Kas</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.section_code} - {sec.section_name}
                </option>
              ))}
            </select>
          )}

          {/* Type Filter Buttons */}
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
              onClick={() => setTypeFilter("income")}
              className={`px-2.5 py-1 rounded transition-colors text-center ${
                typeFilter === "income"
                  ? "bg-emerald-700 text-white font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setTypeFilter("expense")}
              className={`px-2.5 py-1 rounded transition-colors text-center ${
                typeFilter === "expense"
                  ? "bg-red-700 text-white font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh data tabel saat ini ke format Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Unduh CSV</span>
          </button>
          <span className="text-xs text-gray-500 font-mono">
            <strong className="text-gray-900">{filteredTransactions.length}</strong> mutasi
          </span>
          {onOpenNewTransaction && (
            <button
              onClick={onOpenNewTransaction}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              + Tambah
            </button>
          )}
        </div>
      </div>

      {/* Dense Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
              <th className="py-2.5 px-3 whitespace-nowrap">No. Referensi</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Seksi</th>
              <th className="py-2.5 px-3">Uraian Transaksi</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Jenis</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Jumlah (IDR)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Saldo Berjalan</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">E-File Bukti</th>
              {hasActionColumn && (
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={hasActionColumn ? 9 : 8} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <FileText className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-medium">Tidak ada transaksi yang cocok dengan filter</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                const isLinked = Boolean(tx.linked_transaction_id);

                // Row originates from BU allocation (for section ledger view)
                const isOriginFromBU =
                  (isSeksiView || tx.section?.section_code !== "KAS-01") &&
                  isIncome &&
                  (isLinked || tx.description.includes("Alokasi dari Kas Umum"));

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors group text-gray-900 ${
                      isOriginFromBU
                        ? "bg-gray-50/70 hover:bg-gray-100/60"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Tanggal */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* No. Ref */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-300 text-[11px]">
                        {tx.ref_no}
                      </span>
                    </td>

                    {/* Seksi */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                        <span className="font-mono text-[10px] text-gray-500 font-bold">
                          {tx.section?.section_code || "KAS"}
                        </span>
                        <span className="truncate max-w-[140px]">
                          {tx.section?.section_name || "Kas Umum"}
                        </span>
                      </span>
                    </td>

                    {/* Deskripsi & Auto-Ledger Sync Indicator */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-0.5 max-w-md">
                        <span className="font-medium text-gray-900">{tx.description}</span>
                        {isLinked && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono rounded">
                              <LinkIcon className="w-2.5 h-2.5" />
                              <span>Auto-Ledger Sync</span>
                            </span>
                            {tx.linked_transaction && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                Taut: {tx.linked_transaction.ref_no} ({tx.linked_transaction.type.toUpperCase()})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Jenis (Solid Badges) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          isIncome
                            ? "bg-emerald-700 text-white"
                            : "bg-red-700 text-white"
                        }`}
                      >
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>

                    {/* Jumlah */}
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                        isIncome ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {isIncome ? "+ " : "- "}
                      {formatRupiah(tx.amount)}
                    </td>

                    {/* Saldo Berjalan */}
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums text-gray-900 whitespace-nowrap font-mono">
                      {formatRupiah(tx.balance)}
                    </td>

                    {/* E-File Bukti Link */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-medium text-gray-700 transition-colors cursor-pointer"
                        title="Lihat Bukti Kwitansi E-File"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        <span className="font-mono text-[10px]">E-File</span>
                      </button>
                    </td>

                    {/* Actions Column (Edit/Delete) */}
                    {hasActionColumn && (
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isOriginFromBU ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200"
                            title="Terkunci: Data alokasi otomatis dari Bendahara Umum tidak dapat diubah oleh seksi"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>Terkunci</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            {onEditTransaction && (
                              <button
                                onClick={() => onEditTransaction(tx)}
                                className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Edit Transaksi"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteTransaction && (
                              <button
                                onClick={() => setTxToDelete(tx)}
                                className="p-1 rounded border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Buku Kas Terintegrasi & Diverifikasi Otomatis (Double-entry Ledger Verified)</span>
        </div>
        <div className="font-mono text-[11px]">
          Pura Dalem Desa Adat Metra &bull; Neon Postgres Async Engine
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Konfirmasi Hapus Transaksi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Apakah Anda yakin ingin menghapus transaksi dengan Ref:{" "}
                  <strong className="font-mono text-gray-900">{txToDelete.ref_no}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono space-y-1">
              <div className="text-gray-700 truncate">{txToDelete.description}</div>
              <div className="font-bold text-gray-900">
                {txToDelete.type === "income" ? "+" : "-"} {formatRupiah(txToDelete.amount)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Ya, Hapus Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
