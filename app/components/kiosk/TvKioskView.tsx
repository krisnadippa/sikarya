"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Landmark,
  Tv,
  Coins,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  ChevronRight,
  Pause,
  Play,
  RotateCw,
} from "lucide-react";
import {
  DashboardKPISummary,
  ExpenseDistributionItem,
  PuniaDonation,
  Transaction,
} from "@/app/types";

interface TvKioskViewProps {
  summary: DashboardKPISummary;
  expenseDistribution: ExpenseDistributionItem[];
  transactions: Transaction[];
  puniaList: PuniaDonation[];
  onExitKiosk?: () => void;
}

export const TvKioskView: React.FC<TvKioskViewProps> = ({
  summary,
  expenseDistribution,
  transactions,
  puniaList,
  onExitKiosk,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const SLIDE_DURATION_MS = 12000; // 12 seconds per slide

  // Digital clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotating slide timer
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 100;
    const progressIncrement = (intervalStep / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((slide) => (slide % 3) + 1);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused]);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Solid flat colors for Pie Chart (strictly NO gradients)
  const solidColors = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DC2626"];

  // Calculate SVG Pie Chart coordinates
  const totalExpense = expenseDistribution.reduce((acc, item) => acc + item.amount, 0) || 1;
  let cumulativeAngle = 0;
  const pieSegments = expenseDistribution.map((item, index) => {
    const percentage = item.amount / totalExpense;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    // SVG arc calculation (center: 150, 150, radius: 110)
    const cx = 150;
    const cy = 150;
    const r = 110;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (startAngle + angle - 90) * (Math.PI / 180);

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.9
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...item,
      percentage: Math.round(percentage * 100),
      pathData,
      color: solidColors[index % solidColors.length],
    };
  });

  return (
    <div className="w-full h-screen bg-white text-gray-900 flex flex-col justify-between overflow-hidden select-none font-sans border border-gray-300">
      {/* Top Slide Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100">
        <div
          className="h-full bg-blue-600 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 1080p Kiosk Header */}
      <header className="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Image
            src="/logo_hitam.png"
            alt="Logo SIKARYA"
            width={72}
            height={58}
            className="h-14 w-auto object-contain shrink-0"
            priority
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              SISTEM INFORMASI KEUANGAN & DANA PUNIA
            </h1>
            <p className="text-xs font-mono text-gray-500">
              PANITIA KARYA PURA DALEM DESA ADAT METRA &bull; LIVE KIOSK DISPLAY
            </p>
          </div>
        </div>

        {/* Center: Slide Indicators */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((slide) => (
            <button
              key={slide}
              onClick={() => {
                setCurrentSlide(slide);
                setProgress(0);
              }}
              className={`px-4 py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
                currentSlide === slide
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Slide {slide}:{" "}
              {slide === 1
                ? "Saldo & Distribusi"
                : slide === 2
                ? "Buku Kas Terkini"
                : "Dana Punia Krama"}
            </button>
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded border border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 cursor-pointer"
            title={isPaused ? "Lanjutkan Slide" : "Jeda Slide"}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-700" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Live Clock & Exit */}
        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 tabular-nums">
              {currentTime}
            </div>
            <div className="text-[10px] text-emerald-700 flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              <span>LIVE BROADCAST</span>
            </div>
          </div>
          {onExitKiosk && (
            <button
              onClick={onExitKiosk}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Tutup TV Mode
            </button>
          )}
        </div>
      </header>

      {/* Main Slide Canvas (16:9 Optimized) */}
      <main className="flex-1 p-8 overflow-hidden bg-white">
        {/* SLIDE 1: Massive Typography Total Balance & Flat Solid Pie Chart */}
        {currentSlide === 1 && (
          <div className="h-full grid grid-cols-12 gap-8 items-center">
            {/* Left Column: Massive Typography */}
            <div className="col-span-6 space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  POSISI TOTAL SALDO KAS PANITIA
                </span>
                <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                  {formatRupiah(summary.grand_total_cash)}
                </div>
                <div className="text-sm text-gray-500 mt-2 font-mono">
                  Dana Kas Induk Panitia & Akumulasi Seksi-Seksi Pelaksana
                </div>
              </div>

              {/* Grid 2x2 Sub balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="text-xs text-gray-500 font-semibold uppercase">Kas Umum (KAS-01)</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums mt-1">
                    {formatRupiah(summary.total_general_balance)}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700">Tersedia</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="text-xs text-gray-500 font-semibold uppercase">Kas Seksi Pelaksana</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums mt-1">
                    {formatRupiah(summary.total_sections_balance)}
                  </div>
                  <span className="text-[11px] font-mono text-gray-600">4 Seksi Aktif</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="text-xs text-gray-500 font-semibold uppercase">Total Pemasukan</div>
                  <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                    {formatRupiah(summary.total_income_all)}
                  </div>
                  <span className="text-[11px] font-mono text-gray-500">Hibah & Punia</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="text-xs text-gray-500 font-semibold uppercase">Total Pengeluaran</div>
                  <div className="text-2xl font-bold text-red-700 tabular-nums mt-1">
                    {formatRupiah(summary.total_expense_all)}
                  </div>
                  <span className="text-[11px] font-mono text-gray-500">Realisasi Anggaran</span>
                </div>
              </div>

              {/* Punia Highlight */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase">
                    Dana Punia Krama Terhimpun
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 tabular-nums font-mono">
                    {formatRupiah(summary.total_punia_money)}
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-800 font-mono">
                  <span className="font-bold">{summary.total_punia_goods_count} Donasi Barang</span>
                  <p className="text-[11px] text-emerald-700">Wewantenan & Upakara</p>
                </div>
              </div>
            </div>

            {/* Right Column: Flat Solid-Colored Pie Chart (Zero Gradients, Zero 3D) */}
            <div className="col-span-6 bg-gray-50 border border-gray-200 p-6 rounded flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Distribusi Realisasi Biaya & Alokasi per Seksi
                  </h3>
                  <p className="text-xs text-gray-500">
                    Bagan Flat Solid (Non-Gradient) Sesuai Standar Akuntansi
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase">Total Realisasi</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {formatRupiah(totalExpense)}
                  </span>
                </div>
              </div>

              {/* Chart & Legend Grid */}
              <div className="grid grid-cols-12 gap-6 items-center my-auto py-4">
                {/* SVG Pie */}
                <div className="col-span-5 flex justify-center">
                  <svg width="220" height="220" viewBox="0 0 300 300" className="drop-none">
                    {pieSegments.map((seg, idx) => (
                      <path
                        key={idx}
                        d={seg.pathData}
                        fill={seg.color}
                        stroke="#ffffff"
                        strokeWidth="3"
                      />
                    ))}
                    {/* Flat Center Circle for Donut appearance */}
                    <circle cx="150" cy="150" r="55" fill="#ffffff" />
                    <text
                      x="150"
                      y="146"
                      textAnchor="middle"
                      className="text-xs font-bold font-mono fill-gray-500 uppercase"
                    >
                      BIAYA
                    </text>
                    <text
                      x="150"
                      y="164"
                      textAnchor="middle"
                      className="text-sm font-bold font-mono fill-gray-900"
                    >
                      100%
                    </text>
                  </svg>
                </div>

                {/* Flat Legend Breakdown */}
                <div className="col-span-7 space-y-2.5">
                  {pieSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 p-2.5 rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="font-semibold text-gray-800 truncate max-w-[180px]">
                          {seg.section_name}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold tabular-nums text-gray-900">
                          {formatRupiah(seg.amount)}
                        </span>
                        <span className="text-gray-500 text-[10px] ml-1.5">
                          ({seg.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-gray-500 border-t border-gray-200 pt-2 flex items-center justify-between">
                <span>Diperbarui Otomatis oleh Sistem Pembukuan Terintegrasi</span>
                <span>Standar Audit Keuangan Pura</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Live Scrolling Dense Data Table of Recent Ledger Transactions */}
        {currentSlide === 2 && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  BUKU MUTASI KAS & LEDGER TRANSAKSI TERAKHIR
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Menampilkan Aliran Kas Masuk, Pengeluaran, dan Auto-Ledger Sinkronisasi
                </p>
              </div>
              <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Tersinkronisasi Real-Time</span>
              </div>
            </div>

            {/* Dense High-Data Density Table */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[11px] sticky top-0">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">No. Referensi</th>
                    <th className="py-3 px-4">Seksi Penanggung</th>
                    <th className="py-3 px-4">Uraian Transaksi</th>
                    <th className="py-3 px-4 text-center">Jenis</th>
                    <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                    <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.slice(0, 10).map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {tx.ref_no}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                          {tx.section?.section_name || "Kas Umum"}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                              isIncome ? "bg-emerald-700 text-white" : "bg-red-700 text-white"
                            }`}
                          >
                            {isIncome ? "Pemasukan" : "Pengeluaran"}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                            isIncome ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isIncome ? "+ " : "- "}
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-gray-900 font-mono whitespace-nowrap">
                          {formatRupiah(tx.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLIDE 3: Live Vertical Scrolling Marquee of Recent Punia Donors */}
        {currentSlide === 3 && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  DAFTAR DANA PUNIA & DONATUR KARYA PURA DALEM
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Suksma atas ketulusan punia para krama, semeton, dan pamedek pura
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded">
                  Total Terhimpun: {formatRupiah(summary.total_punia_money)}
                </span>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded">
                  {summary.total_punia_goods_count} Wewantenan / Barang
                </span>
              </div>
            </div>

            {/* Punia Donor List Container */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-4">
              {puniaList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 font-mono text-sm">
                  Belum ada catatan dana punia yang terdaftar
                </div>
              ) : (
                <div className="space-y-3">
                  {puniaList.map((punia, idx) => {
                    const isMoney = punia.donation_type === "money";
                    return (
                      <div
                        key={punia.id || idx}
                        className="bg-white border border-gray-200 p-4 rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-bold font-mono text-gray-700">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-base font-bold text-gray-900">
                              {punia.donor_name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              Tanggal: {punia.date} &bull; Catatan: {punia.notes || "Punia Karya Suci"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded mb-1 ${
                              isMoney ? "bg-emerald-700 text-white" : "bg-blue-700 text-white"
                            }`}
                          >
                            {isMoney ? "Dana Tunai" : "Wewantenan (Barang)"}
                          </span>
                          <div className="text-lg font-bold tabular-nums text-gray-900 font-mono">
                            {isMoney && punia.amount_money ? (
                              <span className="text-emerald-700">{formatRupiah(punia.amount_money)}</span>
                            ) : (
                              <span>
                                {punia.goods_quantity} {punia.goods_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 1080p Kiosk Footer Marquee Bar */}
      <footer className="px-8 py-3 bg-gray-900 text-white text-xs font-mono flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-yellow-400">PENGUMUMAN PANITIA:</span>
          <span>
            Penyaluran kas dan dana punia dicatat secara akuntabel dan diaudit terbuka untuk krama Desa Adat Metra.
          </span>
        </div>
        <div className="text-gray-400">
          Slide Berpindah Otomatis Tiap 12 Detik &bull; Sikarya Enterprise
        </div>
      </footer>
    </div>
  );
};
