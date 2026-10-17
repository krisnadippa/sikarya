"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Wallet,
  Landmark,
  Sparkles,
  Wrench,
  HeartHandshake,
  Coins,
  Package,
  Calendar,
  FileText,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { DashboardKPISummary, PuniaDonation, Section, Transaction } from "@/app/types";

interface PublicMobileViewProps {
  summary: DashboardKPISummary;
  sections: Section[];
  transactions: Transaction[];
  puniaList: PuniaDonation[];
  onViewReceipt: (tx: Transaction) => void;
}

export const PublicMobileView: React.FC<PublicMobileViewProps> = ({
  summary,
  sections,
  transactions,
  puniaList,
  onViewReceipt,
}) => {
  // Tabs: "kas_umum", "seksi_yadnya", "seksi_sarana", "data_punia"
  const [activeTab, setActiveTab] = useState<string>("kas_umum");
  const [puniaSearch, setPuniaSearch] = useState<string>("");

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Seksi lookup
  const kasUmumSection = sections.find((s) => s.section_code === "KAS-01") || sections[0];
  const seksiYadnya = sections.find((s) => s.section_code === "SK-01") || sections[1];
  const seksiSarana = sections.find((s) => s.section_code === "SK-02") || sections[2];

  // Transactions per tab
  const activeTransactions = useMemo(() => {
    if (activeTab === "kas_umum") {
      return transactions.filter((t) => t.section_id === kasUmumSection?.id);
    }
    if (activeTab === "seksi_yadnya") {
      return transactions.filter((t) => t.section_id === seksiYadnya?.id);
    }
    if (activeTab === "seksi_sarana") {
      return transactions.filter((t) => t.section_id === seksiSarana?.id);
    }
    return [];
  }, [activeTab, transactions, kasUmumSection, seksiYadnya, seksiSarana]);

  // Punia search filter
  const filteredPunia = useMemo(() => {
    if (!puniaSearch.trim()) return puniaList;
    const q = puniaSearch.toLowerCase();
    return puniaList.filter(
      (p) =>
        p.donor_name.toLowerCase().includes(q) ||
        (p.goods_name && p.goods_name.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    );
  }, [puniaList, puniaSearch]);

  return (
    <div className="w-full max-w-md mx-auto bg-white border-x border-gray-200 min-h-screen flex flex-col select-none font-sans">
      {/* Top Mobile Bar */}
      <header className="p-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Image
            src="/logo_hitam.png"
            alt="Logo SIKARYA"
            width={48}
            height={38}
            className="h-9 w-auto object-contain shrink-0"
            priority
          />
          <div>
            <h1 className="text-xs font-bold text-gray-900 leading-tight">
              KARYA PURA DALEM METRA
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">
              Portal Informasi Publik & Dana Punia
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          <span>Transparan</span>
        </div>
      </header>

      {/* Hero Section: Total Kas */}
      <section className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="bg-white border border-gray-200 rounded p-4 text-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Total Kas Terhimpun Saat Ini
          </span>
          <div className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
            {formatRupiah(summary.grand_total_cash)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">
            Kas Umum: {formatRupiah(summary.total_general_balance)} &bull; Seksi:{" "}
            {formatRupiah(summary.total_sections_balance)}
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-left">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Total Pemasukan</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                {formatRupiah(summary.total_income_all)}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Total Pengeluaran</span>
              <span className="text-xs font-bold text-red-700 tabular-nums">
                {formatRupiah(summary.total_expense_all)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Solid Pill-Shaped Tab Navigation */}
      <nav className="p-3 bg-white border-b border-gray-200 sticky top-[61px] z-20 overflow-x-auto">
        <div className="inline-flex rounded-full bg-gray-100 p-1 border border-gray-200 text-xs gap-1 min-w-full justify-between">
          <button
            onClick={() => setActiveTab("kas_umum")}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeTab === "kas_umum"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kas Umum
          </button>
          <button
            onClick={() => setActiveTab("seksi_yadnya")}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeTab === "seksi_yadnya"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Seksi Yadnya
          </button>
          <button
            onClick={() => setActiveTab("seksi_sarana")}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeTab === "seksi_sarana"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Seksi Sarana
          </button>
          <button
            onClick={() => setActiveTab("data_punia")}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeTab === "data_punia"
                ? "bg-emerald-700 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Data Punia
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab !== "data_punia" ? (
          /* Ledger View for Mobile */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-gray-700">
                Mutasi Terverifikasi ({activeTransactions.length})
              </span>
              <span className="font-mono text-[10px]">Pembaruan Terkini</span>
            </div>

            {activeTransactions.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded text-gray-400 text-xs">
                Belum ada transaksi pada seksi ini.
              </div>
            ) : (
              activeTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-white border border-gray-200 rounded space-y-2 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">
                          {tx.ref_no}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {tx.date}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isIncome
                            ? "bg-emerald-700 text-white"
                            : "bg-red-700 text-white"
                        }`}
                      >
                        {isIncome ? "+ Masuk" : "- Keluar"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-900 font-medium leading-snug">
                      {tx.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Nominal:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            isIncome ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isIncome ? "+ " : "- "}
                          {formatRupiah(tx.amount)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Saldo Kas:</span>
                        <span className="font-bold tabular-nums text-gray-900 font-mono">
                          {formatRupiah(tx.balance)}
                        </span>
                      </div>
                    </div>

                    {tx.receipt_file_url && (
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="w-full mt-1 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-medium text-gray-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        <span>Lihat Bukti Kwitansi E-File</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Punia View with Donor Verification Search */
          <div className="space-y-4">
            {/* Search Input for Donors */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Cari & Verifikasi Dana Punia Anda:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ketik nama donatur / keluarga..."
                  value={puniaSearch}
                  onChange={(e) => setPuniaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Setiap rupiah dan barang punia tercatat transparan untuk pertanggungjawaban bersama.
              </p>
            </div>

            {/* Punia Donor List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Ditemukan: {filteredPunia.length} entri</span>
                <span className="font-mono text-[10px]">Tervalidasi Panitia</span>
              </div>

              {filteredPunia.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded text-gray-500 text-xs">
                  Nama donatur tidak ditemukan. Pastikan ejaan sesuai saat mencatat di posko punia.
                </div>
              ) : (
                filteredPunia.map((punia) => {
                  const isMoney = punia.donation_type === "money";
                  return (
                    <div
                      key={punia.id}
                      className="p-3 bg-white border border-gray-200 rounded space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-xs text-gray-900">
                          {punia.donor_name}
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isMoney
                              ? "bg-emerald-700 text-white"
                              : "bg-blue-700 text-white"
                          }`}
                        >
                          {isMoney ? "Dana Tunai" : "Wewantenan"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500 font-mono">
                          {punia.date}
                        </span>
                        <div className="font-bold tabular-nums text-emerald-700">
                          {isMoney && punia.amount_money ? (
                            formatRupiah(punia.amount_money)
                          ) : (
                            <span className="text-gray-900">
                              {punia.goods_quantity} {punia.goods_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {punia.notes && (
                        <p className="text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">
                          {punia.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-gray-700 font-semibold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sistem Informasi Karya Pura Dalem Metra 2026</span>
        </div>
        <div className="text-[10px] font-mono text-gray-400">
          Akuntabel &bull; Transparan &bull; Berkelanjutan
        </div>
      </footer>
    </div>
  );
};
