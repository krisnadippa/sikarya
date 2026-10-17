"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Coins,
  PackageCheck,
  CheckCircle2,
  Printer,
  Calendar,
  User as UserIcon,
  Receipt,
  RotateCcw,
  FileText,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import { PuniaDonation, User } from "@/app/types";
import { ApiClient } from "@/app/lib/api";

interface PuniaFormProps {
  currentUser: User | null;
  onDonationCreated?: (donation: PuniaDonation) => void;
}

export const PuniaForm: React.FC<PuniaFormProps> = ({
  currentUser,
  onDonationCreated,
}) => {
  // Tab state: "money" or "goods"
  const [activeTab, setActiveTab] = useState<"money" | "goods">("money");

  // Form inputs
  const [donorName, setDonorName] = useState("Hamba Tuhan");
  const [amountMoney, setAmountMoney] = useState<number | "">(100000);
  const [goodsName, setGoodsName] = useState("");
  const [goodsQuantity, setGoodsQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("2026-10-15");

  // Shift & Printable state
  const [shiftList, setShiftList] = useState<PuniaDonation[]>([]);
  const [lastSavedEntry, setLastSavedEntry] = useState<PuniaDonation | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftReportDate, setShiftReportDate] = useState("15/10/2026");
  const [shiftReportTime, setShiftReportTime] = useState("12:00:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const now = new Date();
      setDate(now.toISOString().split("T")[0]);
      setShiftReportDate(now.toLocaleDateString("id-ID"));
      setShiftReportTime(now.toLocaleTimeString("id-ID"));
    } catch {}

    loadInitialShiftEntries();
  }, []);

  const loadInitialShiftEntries = async () => {
    const data = await ApiClient.getPuniaDonations();
    if (data) {
      const seen = new Set<number>();
      const unique = data.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      setShiftList(unique.slice(0, 10));
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmountMoney(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "money" && (!amountMoney || Number(amountMoney) <= 0)) return;
    if (activeTab === "goods" && (!goodsName || !goodsQuantity)) return;

    setIsSubmitting(true);
    const newDonation = await ApiClient.createPunia({
      donor_name: donorName.trim() || "Hamba Tuhan",
      donation_type: activeTab,
      date: date,
      amount_money: activeTab === "money" ? Number(amountMoney) : undefined,
      goods_name: activeTab === "goods" ? goodsName : undefined,
      goods_quantity: activeTab === "goods" ? goodsQuantity : undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);

    setLastSavedEntry(newDonation);
    setIsReceiptModalOpen(true);
    setShiftList((prev) => [newDonation, ...prev.filter((p) => p.id !== newDonation.id)]);
    if (onDonationCreated) onDonationCreated(newDonation);

    // Reset for next donor
    setDonorName("Hamba Tuhan");
    if (activeTab === "money") {
      setAmountMoney(100000);
    } else {
      setGoodsName("");
      setGoodsQuantity("");
    }
    setNotes("");
  };

  // Shift Totals Calculation
  let totalShiftCash = 0;
  let totalShiftGoods = 0;
  shiftList.forEach((item) => {
    if (item.donation_type === "money" && item.amount_money) {
      totalShiftCash += Number(item.amount_money) || 0;
    } else if (item.donation_type === "goods") {
      totalShiftGoods += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Shift Action */}
      <div className="bg-white border border-gray-200 p-4 md:p-6 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              Loket Point-of-Sale (POS) Dana Punia
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Catat kontribusi donasi umat secara cepat dengan kwitansi instan, lalu cetak Berita Acara Shift saat jam jaga berakhir.
          </p>
        </div>

        {/* Action Button: Cetak Berita Acara Shift */}
        <button
          type="button"
          onClick={() => {
            try {
              const now = new Date();
              setShiftReportDate(now.toLocaleDateString("id-ID"));
              setShiftReportTime(now.toLocaleTimeString("id-ID"));
            } catch {}
            setIsShiftModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-none"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Berita Acara Shift</span>
        </button>
      </div>

      {/* Main Grid: Form Left, Shift Log Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: POS Fast Entry Form */}
        <div className="lg:col-span-5 bg-white border border-gray-200 p-5 md:p-6 rounded space-y-5">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("money")}
              className={`py-2 px-3 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-2 ${
                activeTab === "money"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Punia Uang (Rp)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("goods")}
              className={`py-2 px-3 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-2 ${
                activeTab === "goods"
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Punia Barang</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Donor Name & Date */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Pemunia / Krama
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Contoh: Hamba Tuhan / I Ketut Wirata"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Biarkan <strong>"Hamba Tuhan"</strong> jika pemunia tidak ingin menyebut nama.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal Pencatatan
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Money Tab Specifics */}
            {activeTab === "money" ? (
              <div className="space-y-3 pt-1 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nominal Punia (IDR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono font-bold text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={amountMoney}
                      onChange={(e) =>
                        setAmountMoney(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      min="1000"
                      step="1000"
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                {/* Quick-select flat buttons */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Pilihan Cepat (Quick Select)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[50000, 100000, 250000, 500000, 1000000, 2500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmount(amt)}
                        className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                          amountMoney === amt
                            ? "bg-emerald-600 text-white font-bold border-emerald-600"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {amt >= 1000000 ? `Rp ${amt / 1000000} Jt` : `Rp ${amt / 1000} Rb`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Goods Tab Specifics */
              <div className="space-y-3 pt-1 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Barang / Komoditas
                  </label>
                  <input
                    type="text"
                    value={goodsName}
                    onChange={(e) => setGoodsName(e.target.value)}
                    placeholder="Contoh: Beras Suci Bramah / Dupa Cendana"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah / Volume & Satuan
                  </label>
                  <input
                    type="text"
                    value={goodsQuantity}
                    onChange={(e) => setGoodsQuantity(e.target.value)}
                    placeholder="Contoh: 10 Sak @ 50 Kg / 200 Kotak"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan / Peruntukan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Banjar Metra Kaja / Pawon Suci"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan & Terbitkan Kwitansi"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Shift Ledger Readout */}
        <div className="lg:col-span-7 bg-white border border-gray-200 p-5 md:p-6 rounded space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Riwayat Donasi Inputan Shift Ini
              </h3>
              <p className="text-xs text-gray-500">
                Menampilkan donasi yang tercatat oleh akun kasir Anda pada sesi ini.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-700">
                Kas: Rp {totalShiftCash.toLocaleString("id-ID")}
              </span>
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-xs font-mono font-bold text-blue-700">
                {totalShiftGoods} Barang
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Donatur</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Jenis</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Nilai / Rincian</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shiftList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Belum ada donasi yang dicatat pada shift ini.
                    </td>
                  </tr>
                ) : (
                  shiftList.map((item, index) => (
                    <tr key={`shift-punia-${item.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 font-mono text-gray-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {item.donor_name}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {item.donation_type === "money" ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            Uang
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            Barang
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                        {item.donation_type === "money" && item.amount_money
                          ? `Rp ${(Number(item.amount_money) || 0).toLocaleString("id-ID")}`
                          : `${item.goods_name || "-"} (${item.goods_quantity || "-"})`}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setLastSavedEntry(item);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          Cetak
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kwitansi Modal */}
      {isReceiptModalOpen && lastSavedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-gray-900">
                  Kwitansi Dana Punia Terbit
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-mono"
              >
                [Tutup]
              </button>
            </div>

            <div className="border border-gray-200 p-4 rounded bg-gray-50 text-xs font-mono space-y-2">
              <div className="text-center border-b border-gray-200 pb-2">
                <Image
                  src="/logo_hitam.png"
                  alt="Logo SIKARYA"
                  width={56}
                  height={44}
                  className="h-10 w-auto object-contain mx-auto mb-1.5"
                />
                <div className="font-bold text-gray-900">KARYA PURA DALEM DESA ADAT METRA</div>
                <div className="text-[10px] text-gray-500">Tanda Terima Dana Punia</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Ref: PN-{String(lastSavedEntry.id).padStart(4, "0")}
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal:</span>
                  <span className="font-semibold text-gray-900">{lastSavedEntry.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pemunia:</span>
                  <span className="font-semibold text-gray-900">{lastSavedEntry.donor_name}</span>
                </div>
                {lastSavedEntry.donation_type === "money" ? (
                  <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-gray-200">
                    <span>Nominal:</span>
                    <span>Rp {(Number(lastSavedEntry.amount_money) || 0).toLocaleString("id-ID")}</span>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Barang: </span>
                    <span className="font-bold text-gray-900">
                      {lastSavedEntry.goods_name} ({lastSavedEntry.goods_quantity})
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-end text-[10px] text-gray-500">
                <div>Kasir: {currentUser?.full_name || "I Made Sujana"}</div>
                <div className="border border-dashed border-gray-300 px-2 py-0.5 font-bold text-gray-600">
                  LOKET SAH
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Berita Acara Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Berita Acara Rekapitulasi Shift Kasir
                </h3>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-mono"
              >
                [Tutup]
              </button>
            </div>

            <div className="border border-gray-200 p-4 rounded bg-gray-50 text-xs font-mono space-y-3">
              <div className="text-center border-b border-gray-200 pb-2">
                <div className="font-bold text-gray-900">BERITA ACARA SERAH TERIMA DANA PUNIA</div>
                <div className="text-[10px] text-gray-500">Panitia Karya Pura Dalem Desa Adat Metra</div>
                <div className="text-[10px] text-gray-400">
                  Tanggal: {shiftReportDate} • Pukul: {shiftReportTime}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Petugas Jaga:</span>
                  <span className="font-bold text-gray-900">
                    {currentUser?.full_name || "I Made Sujana"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transaksi:</span>
                  <span className="font-semibold text-gray-900">{shiftList.length} Orang Donatur</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1.5 border-t border-gray-200">
                  <span>Total Kas Masuk Fisik:</span>
                  <span>Rp {totalShiftCash.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-700">
                  <span>Total Donasi Barang:</span>
                  <span>{totalShiftGoods} Entri Barang</span>
                </div>
              </div>

              {/* Signature Blocks */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 text-center text-[10px] text-gray-600">
                <div>
                  <div>Petugas Kasir (Penyetor)</div>
                  <div className="h-10"></div>
                  <div className="font-bold text-gray-900 underline">
                    ({currentUser?.full_name || "I Made Sujana"})
                  </div>
                </div>
                <div>
                  <div>Panitia Utama (Penerima)</div>
                  <div className="h-10"></div>
                  <div className="font-bold text-gray-900 underline">
                    (Ni Luh Putu Sintya)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Berita Acara Shift</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
