"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Layers,
  ArrowRightLeft,
  FileText,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Section, Transaction, User } from "@/app/types";

export type ReportPeriodType = "daily" | "weekly" | "monthly" | "all";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  sections: Section[];
  currentUser: User | null;
  lockedSectionId?: number | null; // For Bendahara Seksi who can only see their own section
  initialPeriod?: ReportPeriodType;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  sections,
  currentUser,
  lockedSectionId = null,
  initialPeriod = "daily",
}) => {
  const [periodType, setPeriodType] = useState<ReportPeriodType>(initialPeriod);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(lockedSectionId);

  // Date filters (safe for Next.js prerendering)
  const [todayStr, setTodayStr] = useState<string>("2026-10-16");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-16");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [startDate, setStartDate] = useState<string>("2026-10-09");
  const [endDate, setEndDate] = useState<string>("2026-10-16");

  React.useEffect(() => {
    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      const start = d.toISOString().split("T")[0];

      setTodayStr(today);
      setSelectedDate(today);
      setSelectedMonth(today.substring(0, 7));
      setStartDate(start);
      setEndDate(today);
    } catch {
      // fallback
    }
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Determine active section filter
  const activeSectionId = lockedSectionId !== null ? lockedSectionId : selectedSectionId;
  const currentSection = sections.find((s) => s.id === activeSectionId);

  // Filter transactions based on period and section
  const { filteredTransactions, periodLabel } = useMemo(() => {
    let list = [...transactions];

    // Filter by Section
    if (activeSectionId !== null) {
      list = list.filter((t) => t.section_id === activeSectionId);
    }

    let label = "";

    // Filter by Period
    if (periodType === "daily") {
      list = list.filter((t) => t.date === selectedDate);
      label = `Laporan Harian (${formatDateIndo(selectedDate)})`;
    } else if (periodType === "weekly") {
      list = list.filter((t) => t.date >= startDate && t.date <= endDate);
      label = `Laporan Mingguan (${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)})`;
    } else if (periodType === "monthly") {
      list = list.filter((t) => t.date.startsWith(selectedMonth));
      const [year, month] = selectedMonth.split("-");
      const monthDate = new Date(Number(year), Number(month) - 1, 1);
      const monthName = monthDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      label = `Laporan Bulanan (${monthName})`;
    } else {
      label = "Laporan Akhir / Keseluruhan Karya (Akumulatif)";
    }

    // Sort by date ascending for clean chronological ledger
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);

    return { filteredTransactions: list, periodLabel: label };
  }, [transactions, activeSectionId, periodType, selectedDate, selectedMonth, startDate, endDate]);

  // Compute financial metrics
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSurplus = totalIncome - totalExpense;

  // Running balance calculation
  let runningBal = 0;
  const transactionsWithRunningBalance = filteredTransactions.map((tx) => {
    if (tx.type === "income") {
      runningBal += Number(tx.amount);
    } else {
      runningBal -= Number(tx.amount);
    }
    return {
      ...tx,
      computedRunningBalance: runningBal,
    };
  });

  // Section Progress Breakdown (for Bendahara Umum view)
  const sectionBreakdown = useMemo(() => {
    if (activeSectionId !== null) return [];
    return sections
      .filter((s) => !s.section_code.includes("KAS"))
      .map((sec) => {
        const secTxs = filteredTransactions.filter((t) => t.section_id === sec.id);
        const inc = secTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
        const exp = secTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
        const bal = inc - exp;
        const progressPct = inc > 0 ? Math.min(100, Math.round((exp / inc) * 100)) : 0;
        return {
          section: sec,
          income: inc,
          expense: exp,
          balance: bal,
          progressPct,
        };
      });
  }, [sections, filteredTransactions, activeSectionId]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      "No",
      "Tanggal",
      "No. Kwitansi / Ref",
      "Seksi / Unit",
      "Uraian Transaksi",
      "Jenis",
      "Pemasukan (IDR)",
      "Pengeluaran (IDR)",
      "Saldo Berjalan (IDR)",
      "Kode E-File Bukti",
    ];

    const rows = transactionsWithRunningBalance.map((tx, idx) => {
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
        tx.computedRunningBalance,
        `"${eFileName}"`,
      ].join(",");
    });

    // Summary row
    rows.push("");
    rows.push(`"","","","TOTAL PENERIMAAN","",,"${totalIncome}",,"",""`);
    rows.push(`"","","","TOTAL PENGELUARAN","",,,"${totalExpense}","",""`);
    rows.push(`"","","","SALDO AKHIR PERIODE","",,,"${netSurplus}","",""`);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = periodLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kas_${sanitizedTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Direct PDF Download of the exact popup document view
  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-report-area");
    if (!element) return;

    setIsDownloadingPdf(true);

    // Save previous styles to restore after capture
    const prevOverflow = element.style.overflow;
    const prevMaxHeight = element.style.maxHeight;
    const prevHeight = element.style.height;

    const parent = element.parentElement;
    const prevParentMaxHeight = parent?.style.maxHeight;
    const prevParentHeight = parent?.style.height;
    const prevParentOverflow = parent?.style.overflow;

    // Temporarily expand element and parent so full content is rendered and measurable
    element.style.overflow = "visible";
    element.style.maxHeight = "none";
    element.style.height = "auto";
    if (parent) {
      parent.style.maxHeight = "none";
      parent.style.height = "auto";
      parent.style.overflow = "visible";
    }

    try {
      // Allow browser layout to recalculate full height
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById("printable-report-area");
          if (clonedEl) {
            clonedEl.style.overflow = "visible";
            clonedEl.style.maxHeight = "none";
            clonedEl.style.height = "auto";
            let curr: HTMLElement | null = clonedEl.parentElement;
            while (curr) {
              curr.style.overflow = "visible";
              curr.style.maxHeight = "none";
              curr.style.height = "auto";
              curr = curr.parentElement;
            }
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      let pageIndex = 1;
      while (heightLeft > 0) {
        position = -(pageIndex * pageHeight);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageIndex++;
      }

      const sanitizedTitle = periodLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`Laporan_Kas_${sanitizedTitle}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      // Revert styles back to scrollable modal
      element.style.overflow = prevOverflow;
      element.style.maxHeight = prevMaxHeight;
      element.style.height = prevHeight;
      if (parent) {
        parent.style.maxHeight = prevParentMaxHeight || "";
        parent.style.height = prevParentHeight || "";
        parent.style.overflow = prevParentOverflow || "";
      }
      setIsDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white border border-gray-300 rounded shadow-2xl max-w-5xl w-full flex flex-col max-h-[95vh] print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gray-900 text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                Pusat Cetak & Unduh Laporan Keuangan
              </h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                Laporan Kas Resmi Panitia Karya Pura Dalem Metra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh ke format Microsoft Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
              title="Download langsung berkas PDF resmi"
            >
              {isDownloadingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Mengunduh...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 shrink-0" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Configuration Toolbar (Hidden when printing) */}
        <div className="p-4 border-b border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs print:hidden">
          {/* Period Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Periode Laporan
            </label>
            <div className="inline-flex rounded border border-gray-200 bg-gray-50 p-0.5 w-full">
              <button
                type="button"
                onClick={() => setPeriodType("daily")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "daily" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("weekly")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "weekly" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("monthly")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "monthly" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("all")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "all" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Akhir
              </button>
            </div>
          </div>

          {/* Dynamic Date Pickers */}
          {periodType === "daily" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Pilih Tanggal Laporan
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {periodType === "weekly" && (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {periodType === "monthly" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Pilih Bulan & Tahun
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {periodType === "all" && (
            <div className="flex items-center text-gray-500 text-xs italic pt-4">
              Semua data transaksi karya dari awal hingga penutupan.
            </div>
          )}

          {/* Section Filter (Only if not locked to specific section) */}
          {lockedSectionId === null ? (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Filter Seksi / Kas
              </label>
              <select
                value={selectedSectionId ?? ""}
                onChange={(e) =>
                  setSelectedSectionId(e.target.value === "" ? null : Number(e.target.value))
                }
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="">Semua Seksi & Kas Induk (Konsolidasi)</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.section_code} - {s.section_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Seksi Terpilih (Terkunci)
              </label>
              <div className="p-1.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-semibold truncate">
                {currentSection?.section_code} - {currentSection?.section_name}
              </div>
            </div>
          )}
        </div>

        {/* Printable Document Area */}
        <div id="printable-report-area" className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 bg-white text-gray-900">
          {/* Document Letterhead (KOP RESMI) */}
          <div className="border-b-2 border-gray-900 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo_hitam.png"
                alt="Logo SIKARYA"
                width={70}
                height={70}
                className="h-16 w-auto object-contain shrink-0"
                priority
              />
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-wider text-gray-900 uppercase leading-snug">
                  PANITIA KARYA PURA DALEM DESA ADAT METRA
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-gray-700 tracking-tight">
                  SISTEM INFORMASI & AKUNTABILITAS KAS KARYA (SIKARYA)
                </h2>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  Desa Adat Metra, Tembuku, Bangli • Berita Acara & Pembukuan Transaksi Sah
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono shrink-0 hidden sm:block">
              <div className="font-bold text-gray-800">DOKUMEN KAS RESMI</div>
              <div className="text-gray-500">Tercetak: {formatDateIndo(todayStr)}</div>
              <div className="text-gray-500">Ref: DOK-SIKARYA-METRA</div>
            </div>
          </div>

          {/* Report Title & Metadata Header */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded print:bg-transparent print:border-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded print:border print:border-gray-300">
                  {periodType.toUpperCase()} REPORT
                </span>
                <h2 className="text-base font-black text-gray-900 mt-1">
                  {periodLabel}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Entitas Laporan:{" "}
                  <strong>
                    {currentSection
                      ? `${currentSection.section_code} - ${currentSection.section_name}`
                      : "Konsolidasi Seluruh Seksi & Buku Kas Umum"}
                  </strong>
                </p>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-gray-500">Jumlah Transaksi:</span>{" "}
                <strong className="text-gray-900">{filteredTransactions.length} Baris</strong>
              </div>
            </div>
          </div>

          {/* Financial Summary Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3 bg-white border border-gray-200 rounded print:border-gray-300">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Total Penerimaan
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-700 mt-0.5">
                {formatRupiah(totalIncome)}
              </div>
              <span className="text-[9px] text-gray-400 font-mono">
                {filteredTransactions.filter((t) => t.type === "income").length} Bukti Masuk
              </span>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded print:border-gray-300">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Total Pengeluaran
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-red-700 mt-0.5">
                {formatRupiah(totalExpense)}
              </div>
              <span className="text-[9px] text-gray-400 font-mono">
                {filteredTransactions.filter((t) => t.type === "expense").length} Nota Belanja
              </span>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded print:border-gray-300">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Surplus / Defisit Periode
              </span>
              <div
                className={`text-sm sm:text-base font-black font-mono mt-0.5 ${
                  netSurplus >= 0 ? "text-blue-700" : "text-amber-700"
                }`}
              >
                {formatRupiah(netSurplus)}
              </div>
              <span className="text-[9px] text-gray-400 font-mono">Penerimaan - Belanja</span>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded print:border-gray-300">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                E-File Bukti Terlampir
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-gray-900 mt-0.5">
                100% Sah
              </div>
              <span className="text-[9px] text-gray-400 font-mono">Standar Kode PRD</span>
            </div>
          </div>

          {/* Section Progress Breakdown (Only for Bendahara Umum consolidated view) */}
          {sectionBreakdown.length > 0 && (
            <div className="border border-gray-200 rounded p-4 bg-gray-50/50 print:bg-white print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Grafik & Progres Penyerapan Anggaran Tiap Seksi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {sectionBreakdown.map((sb) => (
                  <div key={sb.section.id} className="p-2.5 bg-white border border-gray-200 rounded">
                    <div className="flex justify-between font-bold text-[11px] text-gray-800">
                      <span>{sb.section.section_name}</span>
                      <span className="font-mono text-gray-600">{sb.progressPct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${sb.progressPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 flex justify-between">
                      <span>Belanja: {formatRupiah(sb.expense)}</span>
                      <span>Sisa: {formatRupiah(sb.balance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Transaction Table */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase text-[10px] tracking-wider print:bg-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-24">Tanggal</th>
                  <th className="py-2.5 px-3 w-28">No. Kwitansi</th>
                  <th className="py-2.5 px-3 w-32">Seksi / Unit</th>
                  <th className="py-2.5 px-3">Uraian Transaksi</th>
                  <th className="py-2.5 px-3 w-28 text-right">Pemasukan</th>
                  <th className="py-2.5 px-3 w-28 text-right">Pengeluaran</th>
                  <th className="py-2.5 px-3 w-28 text-right">Saldo</th>
                  <th className="py-2.5 px-3 w-36 text-center print:hidden">Kode E-File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {transactionsWithRunningBalance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500 italic">
                      Tidak ada data transaksi yang tercatat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  transactionsWithRunningBalance.map((tx, idx) => {
                    const eFileName =
                      tx.receipt_file_url?.split("/").pop() ||
                      `${tx.section?.section_code || "BU"}_${tx.id}_${tx.ref_no}_${tx.date.replace(/-/g, "_")}.png`;

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="py-2 px-3 text-center font-mono text-gray-500 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[11px] text-gray-900 whitespace-nowrap">
                          {tx.ref_no}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-gray-700 font-medium">
                          {tx.section?.section_name || "Kas Umum"}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-gray-900">
                          {tx.description}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 text-[11px] whitespace-nowrap">
                          {tx.type === "income" ? formatRupiah(tx.amount) : "-"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-red-700 text-[11px] whitespace-nowrap">
                          {tx.type === "expense" ? formatRupiah(tx.amount) : "-"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 text-[11px] whitespace-nowrap">
                          {formatRupiah(tx.computedRunningBalance)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-gray-500 truncate max-w-[140px] print:hidden" title={eFileName}>
                          {eFileName}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-400 bg-gray-50 font-bold text-xs print:bg-transparent">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-gray-700">
                    Total Periode Ini:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                    {formatRupiah(totalIncome)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-800">
                    {formatRupiah(totalExpense)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-900">
                    {formatRupiah(netSurplus)}
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification & Signatures Section (Sah untuk Cetak Fisik) */}
          <div className="pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-gray-500 font-mono mb-16">
                Mengetahui & Menyetujui,<br />
                <strong>Ketua Panitia / Bendahara Umum</strong>
              </p>
              <div className="border-b border-gray-400 w-48 mx-auto"></div>
              <p className="font-bold text-gray-900 mt-1">I Wayan Sujana</p>
              <p className="text-[10px] text-gray-500 font-mono">Bendahara Umum Panitia</p>
            </div>

            <div>
              <p className="text-gray-500 font-mono mb-16">
                Metra, {formatDateIndo(todayStr)}<br />
                <strong>Penanggung Jawab Pembukuan</strong>
              </p>
              <div className="border-b border-gray-400 w-48 mx-auto"></div>
              <p className="font-bold text-gray-900 mt-1">
                {currentUser?.full_name || "Bendahara Pengampu"}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                {currentSection ? currentSection.section_name : "Karya Pura Dalem Metra"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
