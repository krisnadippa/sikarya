"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Download,
  Calendar,
  HeartHandshake,
  Coins,
  PackageCheck,
  FileSpreadsheet,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { PuniaDonation, User } from "@/app/types";

export type PuniaPeriodType = "daily" | "weekly" | "monthly" | "all";

interface PuniaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  puniaList: PuniaDonation[];
  currentUser: User | null;
}

export const PuniaReportModal: React.FC<PuniaReportModalProps> = ({
  isOpen,
  onClose,
  puniaList,
  currentUser,
}) => {
  const [periodType, setPeriodType] = useState<PuniaPeriodType>("daily");
  const [tipeFilter, setTipeFilter] = useState<"all" | "money" | "goods">("all");

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

  const formatRupiah = (val: number | string | null | undefined) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      const parts = dateStr.split("T")[0].split("-");
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

  const { filteredList, periodLabel } = useMemo(() => {
    let list = [...puniaList];

    // Filter by Type
    if (tipeFilter !== "all") {
      list = list.filter((p) => p.donation_type === tipeFilter);
    }

    let label = "";

    // Filter by Date
    if (periodType === "daily") {
      list = list.filter((p) => p.date === selectedDate);
      label = `Laporan Dana Punia Harian (${formatDateIndo(selectedDate)})`;
    } else if (periodType === "weekly") {
      list = list.filter((p) => {
        const tgl = p.date.split("T")[0];
        return tgl >= startDate && tgl <= endDate;
      });
      label = `Laporan Dana Punia Mingguan (${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)})`;
    } else if (periodType === "monthly") {
      list = list.filter((p) => p.date.startsWith(selectedMonth));
      const [year, month] = selectedMonth.split("-");
      const monthDate = new Date(Number(year), Number(month) - 1, 1);
      const monthName = monthDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      label = `Laporan Dana Punia Bulanan (${monthName})`;
    } else {
      label = "Laporan Rekapitulasi Akhir Seluruh Dana Punia Karya";
    }

    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);

    return { filteredList: list, periodLabel: label };
  }, [puniaList, tipeFilter, periodType, selectedDate, selectedMonth, startDate, endDate]);

  const totalUang = filteredList
    .filter((p) => p.donation_type === "money")
    .reduce((sum, p) => sum + Number(p.amount_money || 0), 0);

  const totalDonaturUang = filteredList.filter((p) => p.donation_type === "money").length;
  const totalDonaturBarang = filteredList.filter((p) => p.donation_type === "goods").length;

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

    const rows = filteredList.map((p, idx) => {
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

    rows.push("");
    rows.push(`"","","","TOTAL DANA PUNIA UANG","","",${totalUang},"","",""`);
    rows.push(`"","","","TOTAL DONATUR BARANG","","","${totalDonaturBarang} Item","","",""`);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = periodLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Punia_${sanitizedTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Direct PDF Download of the exact popup document view
  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-punia-area");
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
          const clonedEl = clonedDoc.getElementById("printable-punia-area");
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
      pdf.save(`Laporan_Punia_${sanitizedTitle}.pdf`);
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
        {/* Control Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-purple-700 text-white flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                Pusat Cetak & Laporan Rekap Dana Punia
              </h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                Laporan Harian, Mingguan, Bulanan & Rekap Akhir Punia Karya
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs print:hidden">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Periode
            </label>
            <div className="inline-flex rounded border border-gray-200 bg-gray-50 p-0.5 w-full">
              <button
                type="button"
                onClick={() => setPeriodType("daily")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "daily" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600"
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("weekly")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "weekly" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600"
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("monthly")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "monthly" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("all")}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  periodType === "all" ? "bg-white text-gray-900 font-bold shadow-xs" : "text-gray-600"
                }`}
              >
                Akhir
              </button>
            </div>
          </div>

          {periodType === "daily" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          )}

          {periodType === "weekly" && (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Dari
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Sampai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          {periodType === "monthly" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Pilih Bulan
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Bentuk Punia
            </label>
            <select
              value={tipeFilter}
              onChange={(e) => setTipeFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-purple-600"
            >
              <option value="all">Semua Punia (Uang & Barang)</option>
              <option value="money">Khusus Dana Punia Uang</option>
              <option value="goods">Khusus Punia Wastra & Barang</option>
            </select>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-punia-area" className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 bg-white text-gray-900">
          {/* Letterhead */}
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
                <h2 className="text-xs sm:text-sm font-bold text-purple-900 tracking-tight">
                  SEKSI DANA PUNIA & KONTRIBUSI UMAT (LOKET RESMI)
                </h2>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  Desa Adat Metra, Tembuku, Bangli • Berita Acara Rekapitulasi Sumbangan Sah
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono shrink-0 hidden sm:block">
              <div className="font-bold text-gray-800">REKAP PUNIA RESMI</div>
              <div className="text-gray-500">Tercetak: {formatDateIndo(todayStr)}</div>
            </div>
          </div>

          {/* Title Header */}
          <div className="bg-purple-50/60 border border-purple-200 p-4 rounded print:bg-transparent print:border-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-2 py-0.5 rounded print:border print:border-gray-300">
                  REKAP DANA PUNIA
                </span>
                <h2 className="text-base font-black text-gray-900 mt-1">
                  {periodLabel}
                </h2>
              </div>
              <div className="text-right text-xs font-mono">
                Total Tercatat: <strong>{filteredList.length} Donasi</strong>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Total Dana Punia Uang
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-purple-800 mt-0.5">
                {formatRupiah(totalUang)}
              </div>
              <span className="text-[9px] text-gray-400 font-mono">
                {totalDonaturUang} Transaksi Donasi
              </span>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Total Punia Barang / Upakara
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-gray-900 mt-0.5">
                {totalDonaturBarang} Item
              </div>
              <span className="text-[9px] text-gray-400 font-mono">Wastra, Dupa, Natura</span>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                Status Verifikasi
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-700 mt-0.5">
                100% Terverifikasi
              </div>
              <span className="text-[9px] text-gray-400 font-mono">Kwitansi Sah Panitia</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase text-[10px] tracking-wider print:bg-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-24">Tanggal</th>
                  <th className="py-2.5 px-3 w-24">ID Ref</th>
                  <th className="py-2.5 px-3">Nama Donatur / Krama</th>
                  <th className="py-2.5 px-3 w-28 text-center">Bentuk</th>
                  <th className="py-2.5 px-3 text-right">Nominal / Rincian</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3 w-28 text-center">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                      Tidak ada data punia yang tercatat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <td className="py-2 px-3 text-center font-mono text-gray-500 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[11px] text-purple-900 whitespace-nowrap">
                        PN-{p.id.toString().padStart(4, "0")}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900 text-[11px]">
                        {p.donor_name}
                      </td>
                      <td className="py-2 px-3 text-center text-[10px] font-bold">
                        {p.donation_type === "money" ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">UANG</span>
                        ) : (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">BARANG</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[11px]">
                        {p.donation_type === "money" ? (
                          <span className="text-emerald-700">{formatRupiah(p.amount_money)}</span>
                        ) : (
                          <span className="text-gray-800 font-sans font-medium">
                            {p.goods_name} {p.goods_quantity ? `(${p.goods_quantity})` : ""}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-gray-600">
                        {p.notes || "-"}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-gray-600">
                        {p.staff?.full_name || p.staff?.username || "Petugas"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-400 bg-gray-50 font-bold text-xs print:bg-transparent">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-gray-700">
                    Total Dana Punia Uang:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-900 text-sm">
                    {formatRupiah(totalUang)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-gray-500 font-mono mb-16">
                Mengetahui,<br />
                <strong>Ketua Panitia Karya</strong>
              </p>
              <div className="border-b border-gray-400 w-48 mx-auto"></div>
              <p className="font-bold text-gray-900 mt-1">I Wayan Sujana</p>
              <p className="text-[10px] text-gray-500 font-mono">Ketua Panitia Karya</p>
            </div>

            <div>
              <p className="text-gray-500 font-mono mb-16">
                Metra, {formatDateIndo(todayStr)}<br />
                <strong>Koordinator / Petugas Punia</strong>
              </p>
              <div className="border-b border-gray-400 w-48 mx-auto"></div>
              <p className="font-bold text-gray-900 mt-1">
                {currentUser?.full_name || "I Made Sujana"}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">Panitia Dana Punia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
