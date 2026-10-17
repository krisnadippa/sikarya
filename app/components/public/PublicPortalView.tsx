"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Wallet,
  Landmark,
  Sparkles,
  HeartHandshake,
  Coins,
  Package,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  Info,
  Layers,
  MapPin,
  TrendingUp,
  Receipt,
  Tv,
} from "lucide-react";
import { DashboardKPISummary, PuniaDonation, Section, Transaction } from "@/app/types";

interface PublicPortalViewProps {
  summary: DashboardKPISummary;
  sections: Section[];
  transactions: Transaction[];
  puniaList: PuniaDonation[];
  onViewReceipt: (tx: Transaction) => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  summary,
  sections,
  transactions,
  puniaList,
  onViewReceipt,
}) => {
  // Navigation tabs: section code or "punia"
  const [activeTab, setActiveTab] = useState<string>("KAS-01");
  const [puniaSearch, setPuniaSearch] = useState<string>("");
  const [puniaTypeFilter, setPuniaTypeFilter] = useState<string>("all");
  const [txSearch, setTxSearch] = useState<string>("");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Active section for current tab
  const activeSection = useMemo(() => {
    return sections.find((s) => s.section_code === activeTab) || sections[0];
  }, [sections, activeTab]);

  // Filtered transactions for active tab
  const filteredTransactions = useMemo(() => {
    if (activeTab === "punia") return [];

    let list = transactions.filter((t) => t.section_id === activeSection?.id);

    if (txTypeFilter !== "all") {
      list = list.filter((t) => t.type === txTypeFilter);
    }

    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.ref_no.toLowerCase().includes(q) ||
          t.date.includes(q)
      );
    }

    return list;
  }, [transactions, activeSection, activeTab, txTypeFilter, txSearch]);

  // Filtered Punia list
  const filteredPunia = useMemo(() => {
    let list = puniaList;

    if (puniaTypeFilter !== "all") {
      list = list.filter((p) => p.donation_type === puniaTypeFilter);
    }

    if (puniaSearch.trim()) {
      const q = puniaSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.donor_name.toLowerCase().includes(q) ||
          (p.goods_name && p.goods_name.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }, [puniaList, puniaTypeFilter, puniaSearch]);

  // Calculated punia totals
  const puniaMoneyTotal = useMemo(() => {
    return puniaList.reduce((acc, p) => {
      return p.donation_type === "money" && p.amount_money ? acc + Number(p.amount_money) : acc;
    }, 0);
  }, [puniaList]);

  const puniaGoodsCount = useMemo(() => {
    return puniaList.filter((p) => p.donation_type === "goods").length;
  }, [puniaList]);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* TOP NAVBAR (DESKTOP & MOBILE RESPONSIVE) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo_hitam.png"
              alt="Logo SIKARYA Pura Dalem Metra"
              width={56}
              height={46}
              className="h-11 sm:h-12 w-auto object-contain shrink-0"
              priority
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  SIKARYA PURA DALEM METRA
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Portal Transparansi Keuangan & Dana Punia Krama Desa Adat
              </p>
            </div>
          </div>

          {/* Right Status Badge & Kiosk Link */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terbuka & Transparan</span>
            </span>
            <Link
              href="/kiosk"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-700 bg-white hover:bg-amber-50/60 px-3 py-1.5 rounded-full border border-slate-200 hover:border-amber-300 shadow-2xs transition-all"
              title="Buka Layar TV Kiosk"
            >
              <Tv className="w-3.5 h-3.5 text-amber-600" />
              <span>TV Kiosk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER & KPI METRICS */}
      <section className="bg-gradient-to-b from-white to-slate-100 border-b border-slate-200 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Introduction */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Keterbukaan Publik & Akuntabilitas Penuh</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ringkasan Kas Karya & Donasi Umat
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                Seluruh alokasi dana, realisasi pengeluaran setiap seksi, dan catatan punia krama dapat dipantau langsung secara terbuka oleh seluruh umat.
              </p>
            </div>

            <div className="text-left md:text-right text-xs text-slate-500 font-mono">
              <span className="block">Desa Adat Metra &bull; Karya Mamungkah 2026</span>
              <span className="text-[11px] text-slate-400">Database Neon PostgreSQL &bull; Real-time</span>
            </div>
          </div>

          {/* 4-COLUMN KPI CARDS (RESPONSIVE: 1 col on mobile, 2 on tablet, 4 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Grand Total Cash */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Grand Total Kas</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatRupiah(summary.grand_total_cash)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Kas Umum: {formatRupiah(summary.total_general_balance)}</span>
                <span>Seksi: {formatRupiah(summary.total_sections_balance)}</span>
              </div>
            </div>

            {/* Card 2: Total Punia Umat */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Total Punia Umat</span>
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 tabular-nums">
                  {formatRupiah(puniaMoneyTotal || summary.total_punia_money)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{puniaGoodsCount} Donasi Barang Logistik</span>
                <span className="font-mono text-emerald-600 font-semibold">{puniaList.length} Pemunia</span>
              </div>
            </div>

            {/* Card 3: Total Pemasukan Kas */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Total Penerimaan</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
                  {formatRupiah(summary.total_income_all)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Alokasi kas masuk & donasi dana karya
              </div>
            </div>

            {/* Card 4: Total Pengeluaran Kas */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Total Realisasi Biaya</span>
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-700 tabular-nums">
                  {formatRupiah(summary.total_expense_all)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Belanja kebutuhan upakara & logistik seksi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* TABS SELECTOR (HORIZONTAL SCROLLABLE ON MOBILE, PILLS ON DESKTOP) */}
        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {sections.map((sec) => {
              const isSelected = activeTab === sec.section_code;
              const isKas = sec.section_code === "KAS-01";

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.section_code)}
                  className={`px-3 sm:px-4 py-2 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {isKas ? <Landmark className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  <span>{sec.section_name}</span>
                </button>
              );
            })}

            {/* Punia Tab */}
            <button
              onClick={() => setActiveTab("punia")}
              className={`px-3 sm:px-4 py-2 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "punia"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Verifikasi Dana Punia Krama</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-800 text-white ml-1">
                {puniaList.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT: SECTIONS TRANSACTIONS (KAS UMUM & SEKSI-SEKSI) */}
        {activeTab !== "punia" && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-0">
            {/* Table / Section Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    {activeSection?.section_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Buku Kas: {activeSection?.section_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeSection?.description || "Daftar catatan mutasi kas transparan karya."}
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari transaksi / no ref..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-48 sm:w-56"
                  />
                </div>

                {/* Type Filter Buttons */}
                <div className="inline-flex rounded border border-slate-200 bg-white p-0.5 text-xs">
                  <button
                    onClick={() => setTxTypeFilter("all")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      txTypeFilter === "all"
                        ? "bg-slate-900 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setTxTypeFilter("income")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      txTypeFilter === "income"
                        ? "bg-emerald-700 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => setTxTypeFilter("expense")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      txTypeFilter === "expense"
                        ? "bg-red-700 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE VIEW (Visible on tablet & desktop >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                    <th className="py-3 px-4 whitespace-nowrap">No. Referensi</th>
                    <th className="py-3 px-4">Deskripsi / Uraian Keperluan</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Jenis</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Nominal (IDR)</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Saldo Kas</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Bukti Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <Receipt className="w-8 h-8 text-slate-300" />
                          <span className="text-xs font-medium">Tidak ada transaksi yang cocok.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isIncome = tx.type === "income";

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                              {tx.ref_no}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900 max-w-md">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                isIncome
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              <span>{isIncome ? "Masuk" : "Keluar"}</span>
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap font-mono text-xs ${
                              isIncome ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {isIncome ? "+ " : "- "}
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap text-slate-900">
                            {formatRupiah(tx.balance)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {tx.receipt_file_url ? (
                              <button
                                onClick={() => onViewReceipt(tx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Bukti</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (Visible only on mobile < 768px) */}
            <div className="md:hidden divide-y divide-slate-200 p-3 space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded text-slate-400 text-xs">
                  Tidak ada transaksi yang cocok.
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === "income";

                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {tx.ref_no}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isIncome
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {isIncome ? "+ Masuk" : "- Keluar"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-900 font-semibold leading-snug">
                        {tx.description}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">{tx.date}</span>
                          <span
                            className={`font-bold tabular-nums font-mono ${
                              isIncome ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {isIncome ? "+ " : "- "}
                            {formatRupiah(tx.amount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">Saldo Kas</span>
                          <span className="font-bold tabular-nums text-slate-900 font-mono">
                            {formatRupiah(tx.balance)}
                          </span>
                        </div>
                      </div>

                      {tx.receipt_file_url && (
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="w-full mt-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Bukti Kwitansi E-File</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Menampilkan <strong>{filteredTransactions.length}</strong> transaksi terverifikasi
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
                Pura Dalem Desa Adat Metra
              </span>
            </div>
          </div>
        )}

        {/* TAB CONTENT: DANA PUNIA KRAMA (SEARCH & DONATIONS TABLE) */}
        {activeTab === "punia" && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-0">
            {/* Header & Search Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/50 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Buku Induk & Verifikasi Dana Punia Krama
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Setiap rupiah donasi dana dan wewantenan logistik tercatat secara sah dan transparan demi pertanggungjawaban karya suci pura.
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ketik nama donatur / keluarga / banjar untuk verifikasi..."
                    value={puniaSearch}
                    onChange={(e) => setPuniaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium shadow-xs"
                  />
                </div>

                <div className="inline-flex rounded border border-slate-300 bg-white p-0.5 text-xs shrink-0">
                  <button
                    onClick={() => setPuniaTypeFilter("all")}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      puniaTypeFilter === "all"
                        ? "bg-slate-900 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setPuniaTypeFilter("money")}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      puniaTypeFilter === "money"
                        ? "bg-emerald-700 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Dana Tunai (Uang)
                  </button>
                  <button
                    onClick={() => setPuniaTypeFilter("goods")}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      puniaTypeFilter === "goods"
                        ? "bg-blue-700 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Wewantenan (Barang)
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE VIEW FOR PUNIA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                    <th className="py-3 px-4">Nama Donatur / Krama / Banjar</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Bentuk Punia</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Nominal / Rincian Logistik</th>
                    <th className="py-3 px-4">Catatan / Peruntukan</th>
                    <th className="py-3 px-4 whitespace-nowrap">Petugas Posko</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredPunia.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <HeartHandshake className="w-8 h-8 text-slate-300" />
                          <span className="text-xs font-medium">Data punia tidak ditemukan. Periksa ejaan nama.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPunia.map((p) => {
                      const isMoney = p.donation_type === "money";

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {p.date}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {p.donor_name}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                isMoney
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {isMoney ? <Coins className="w-3 h-3 text-emerald-700" /> : <Package className="w-3 h-3 text-blue-700" />}
                              <span>{isMoney ? "Dana Tunai" : "Wewantenan"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                            {isMoney && p.amount_money ? (
                              <span className="text-emerald-700 text-sm">
                                {formatRupiah(p.amount_money)}
                              </span>
                            ) : (
                              <span className="text-slate-900">
                                {p.goods_quantity} {p.goods_name}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {p.notes || "-"}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {p.staff?.full_name || p.staff?.username || "Petugas Loket"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW FOR PUNIA */}
            <div className="md:hidden divide-y divide-slate-200 p-3 space-y-3">
              {filteredPunia.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded text-slate-400 text-xs">
                  Data punia tidak ditemukan. Periksa ejaan nama.
                </div>
              ) : (
                filteredPunia.map((p) => {
                  const isMoney = p.donation_type === "money";

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {p.donor_name}
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            isMoney
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {isMoney ? "Dana Tunai" : "Wewantenan"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-mono">{p.date}</span>
                        <div className="font-bold font-mono text-sm">
                          {isMoney && p.amount_money ? (
                            <span className="text-emerald-700">{formatRupiah(p.amount_money)}</span>
                          ) : (
                            <span className="text-slate-900">{p.goods_quantity} {p.goods_name}</span>
                          )}
                        </div>
                      </div>

                      {p.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          {p.notes}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-400 font-mono text-right pt-0.5">
                        Tervalidasi posko: {p.staff?.username || "Petugas Loket"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Punia Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Total <strong>{filteredPunia.length}</strong> entri punia terdaftar
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                Audit Publik Terbuka
              </span>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_putih.png"
              alt="Logo SIKARYA"
              width={48}
              height={40}
              className="h-10 w-auto object-contain shrink-0"
            />
            <div>
              <div className="font-bold text-slate-200 text-sm">
                Panitia Karya Pura Dalem Desa Adat Metra
              </div>
              <div className="text-[11px] text-slate-400">
                Kecamatan Tembuku, Kabupaten Bangli, Bali &bull; Karya Mamungkah 2026
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Audit Publik Terbuka</span>
            <span>&bull;</span>
            <span>Akuntabel</span>
            <span>&bull;</span>
            <span>Real-time Neon Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
