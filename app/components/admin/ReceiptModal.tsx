"use client";

import React, { useState } from "react";
import { X, FileText, Download, ShieldCheck, ExternalLink, Calendar, Hash, Camera, ZoomIn } from "lucide-react";
import { Transaction } from "@/app/types";

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [activeTab, setActiveTab] = useState<"photo" | "receipt">("receipt");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const hasRealPhoto = Boolean(
    transaction?.receipt_file_url &&
      (transaction.receipt_file_url.startsWith("data:image/") ||
        transaction.receipt_file_url.includes("/receipt") ||
        transaction.receipt_file_url.startsWith("http"))
  );

  React.useEffect(() => {
    if (hasRealPhoto) {
      setActiveTab("photo");
    } else {
      setActiveTab("receipt");
    }
  }, [transaction?.id, hasRealPhoto]);

  if (!transaction) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Derive standardized filename according to PRD format
  const fileName =
    (transaction.receipt_file_url &&
    !transaction.receipt_file_url.startsWith("data:") &&
    !transaction.receipt_file_url.includes("/receipt")
      ? transaction.receipt_file_url.split("/").pop()
      : null) ||
    `${transaction.section?.section_code || "BU"}_${transaction.id}_${transaction.ref_no}_${transaction.date.replace(/-/g, "_")}.jpg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded max-w-2xl w-full flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Bukti Kwitansi Digital (E-File)
              </h3>
              <p className="text-xs font-mono text-gray-500">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch if real photo exists */}
        {hasRealPhoto && (
          <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("photo")}
              className={`pb-2 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "photo"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto Fisik Nota / Kwitansi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("receipt")}
              className={`pb-2 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "receipt"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lembar Digital Terverifikasi</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata Card */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">No. Referensi</span>
              <span className="font-mono font-bold text-gray-900">{transaction.ref_no}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Tanggal Transaksi</span>
              <span className="font-medium text-gray-900">{transaction.date}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Jenis & Nilai</span>
              <span
                className={`font-bold tabular-nums ${
                  transaction.type === "income" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {transaction.type === "income" ? "+ " : "- "}
                {formatRupiah(transaction.amount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Seksi Penanggung</span>
              <span className="font-medium text-gray-900">{transaction.section?.section_name || "-"}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Uraian Transaksi</span>
            <p className="text-xs text-gray-800 bg-white border border-gray-200 p-2.5 rounded">
              {transaction.description}
            </p>
          </div>

          {/* Photo View Tab */}
          {hasRealPhoto && activeTab === "photo" && (
            <div className="space-y-2">
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex flex-col items-center justify-center relative group">
                <img
                  src={transaction.receipt_file_url!}
                  alt="Bukti Nota Asli"
                  loading="lazy"
                  className="max-h-80 w-auto object-contain rounded border border-gray-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer bg-white px-3 py-1 rounded border border-gray-200 shadow-2xs"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Perbesar Foto</span>
                </button>
              </div>
            </div>
          )}

          {/* Visual Receipt Canvas Representation */}
          {(!hasRealPhoto || activeTab === "receipt") && (
            <div className="border border-gray-300 rounded p-6 bg-white flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-full border-b border-dashed border-gray-300 pb-4 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  PANITIA KARYA PURA DALEM DESA ADAT METRA
                </div>
                <div className="text-[11px] text-gray-500">
                  Tanda Bukti Transaksi Elektronik & Keuangan Panitia
                </div>
              </div>

              <div className="w-full py-4 space-y-2 text-left text-xs font-mono">
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">KODE ARSIP:</span>
                  <span className="text-gray-900 font-bold">{fileName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">PENANGGUNG JAWAB:</span>
                  <span className="text-gray-900">
                    {transaction.user?.full_name || transaction.user?.username || "Bendahara"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">NOMINAL DISAHKAN:</span>
                  <span className="text-gray-900 font-bold">{formatRupiah(transaction.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">SALDO BERJALAN:</span>
                  <span className="text-gray-900 font-bold">{formatRupiah(transaction.balance)}</span>
                </div>
              </div>

              <div className="w-full pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-dashed border-gray-300">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Terverifikasi Sistem Sikarya & Hash Integritas</span>
                </div>
                <span className="font-mono">Pura Dalem Metra 2026</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 font-mono">
            {hasRealPhoto ? "Foto asli terkompresi & terarsip di cloud database" : "Format: kode_bendahara_id_transaksi_no_transaksi_tgl_bln_th"}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox */}
      {isZoomed && hasRealPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 flex items-center gap-1 text-xs"
            >
              <X className="w-5 h-5" />
              <span>Tutup</span>
            </button>
            <img
              src={transaction.receipt_file_url!}
              alt="Bukti Nota Full"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded shadow-2xl bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
