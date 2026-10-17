"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Lock,
  Building2,
} from "lucide-react";
import { Section, Transaction, User } from "@/app/types";
import { TransactionInput } from "@/app/lib/api";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  currentUser: User;
  onSave: (data: TransactionInput) => Promise<void>;
  defaultSectionId?: number;
  initialType?: "income" | "expense";
  isAllocation?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  sections,
  currentUser,
  onSave,
  defaultSectionId,
  initialType = "expense",
  isAllocation = false,
}) => {
  const initialSecId =
    currentUser.role === "bendahara_seksi" && currentUser.section_id
      ? currentUser.section_id
      : (defaultSectionId || sections[0]?.id || 1);

  const [sectionId, setSectionId] = useState<number>(initialSecId);
  const [date, setDate] = useState<string>("2026-10-15");

  React.useEffect(() => {
    try {
      setDate(new Date().toISOString().split("T")[0]);
    } catch {
      // fallback
    }
  }, []);

  React.useEffect(() => {
    if (currentUser.role === "bendahara_seksi" && currentUser.section_id) {
      setSectionId(currentUser.section_id);
    } else if (defaultSectionId) {
      setSectionId(defaultSectionId);
    }
    if (initialType) setType(initialType);
    if (isAllocation) setEnableAutoSync(true);
  }, [defaultSectionId, initialType, isAllocation, isOpen, currentUser]);

  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [enableAutoSync, setEnableAutoSync] = useState<boolean>(isAllocation);
  const [targetSectionId, setTargetSectionId] = useState<number>(2); // Default: Seksi Yadnya
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeSectionId =
    currentUser.role === "bendahara_seksi" && currentUser.section_id
      ? currentUser.section_id
      : sectionId;

  const selectedSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const isKasUmum = selectedSection?.section_code.includes("KAS");
  const canPerformAutoSync = isKasUmum && type === "expense";

  // Compute Auto-Ref Preview
  const refPrefix = isKasUmum ? "KW" : `${selectedSection.section_code.replace("-", "")}-${type === "expense" ? "NT" : "TR"}`;
  const autoRefPreview = `${refPrefix}-AUTO`;

  // Compute Auto-Receipt Filename Preview according to PRD:
  // Format: kode_bendahara_id_transaksi_no_transaksi_tgl_bln_th.ext
  const userRolePrefix = currentUser.role === "bendahara_umum" ? "BU" : selectedSection.section_code.replace("-", "");
  const dateFormatted = date.split("-").reverse().join("_");
  const ext = selectedFile ? selectedFile.name.split(".").pop() : "png";
  const autoReceiptNamePreview = `${userRolePrefix}_TX_${refPrefix}01_${dateFormatted}.${ext}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Harap masukkan nominal transaksi yang valid (lebih besar dari 0).");
      return;
    }

    if (description.trim().length < 5) {
      setErrorMsg("Uraian transaksi minimal 5 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalSectionId =
        currentUser.role === "bendahara_seksi" && currentUser.section_id
          ? currentUser.section_id
          : (defaultSectionId && !isAllocation ? defaultSectionId : sectionId);

      await onSave({
        section_id: finalSectionId,
        date,
        type,
        amount: numAmount,
        description: description.trim(),
        target_section_id: canPerformAutoSync && enableAutoSync ? targetSectionId : null,
        receipt_file_url: `/uploads/receipts/${autoReceiptNamePreview}`,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden select-none">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Input Transaksi Kas & Mutasi
            </h3>
            <p className="text-xs text-gray-500">
              Sistem Pembukuan Otomatis Karya Pura Dalem Metra
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grid: Seksi & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Seksi Pelaksana Transaksi <span className="text-red-600">*</span>
              </label>
              {currentUser.role === "bendahara_seksi" || (!isAllocation && defaultSectionId) ? (
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-900 font-bold flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {selectedSection.section_code} - {selectedSection.section_name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                    <Lock className="w-3 h-3 text-emerald-700" /> Seksi Resmi
                  </span>
                </div>
              ) : (
                <select
                  value={sectionId}
                  onChange={(e) => {
                    setSectionId(Number(e.target.value));
                    if (!sections.find((s) => s.id === Number(e.target.value))?.section_code.includes("KAS")) {
                      setEnableAutoSync(false);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600 cursor-pointer"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.section_code} - {s.section_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tanggal Transaksi <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Jenis Transaksi (Solid Badges) */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Jenis Mutasi Transaksi <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 px-3 rounded font-bold uppercase text-xs border transition-colors cursor-pointer ${
                  type === "income"
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                + Penerimaan (Income)
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 px-3 rounded font-bold uppercase text-xs border transition-colors cursor-pointer ${
                  type === "expense"
                    ? "bg-red-700 text-white border-red-700"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                - Pengeluaran (Expense)
              </button>
            </div>
          </div>

          {/* Nominal (Amount) */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nominal Transaksi (IDR) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 font-mono">
                Rp
              </span>
              <input
                type="number"
                step="1000"
                min="1000"
                placeholder="Contoh: 15000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-bold tabular-nums focus:outline-none focus:bg-white focus:border-blue-600 text-sm"
                required
              />
            </div>
            {amount && !isNaN(Number(amount)) && (
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                Terbilang: Rp {Number(amount).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Deskripsi / Uraian */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Uraian / Keterangan Transaksi <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembelian Janur Suci, Kelapa Daksina Griya Gede untuk Seksi Yadnya"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600"
              required
            />
          </div>

          {/* AUTO-LEDGER SYNC PANEL: Appears when Kas Umum makes an expense */}
          {canPerformAutoSync && (
            <div className="bg-blue-50/60 border border-blue-200 rounded p-3 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="autoSyncToggle"
                  checked={enableAutoSync}
                  onChange={(e) => setEnableAutoSync(e.target.checked)}
                  className="mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="autoSyncToggle" className="cursor-pointer">
                  <span className="font-bold text-blue-900 block">
                    Alokasikan Otomatis ke Seksi (Auto-Ledger Sync)
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Sistem otomatis membuat mutasi Penerimaan (Income) bertaut pada buku kas seksi pelaksana terkait secara atomik.
                  </span>
                </label>
              </div>

              {enableAutoSync && (
                <div className="pt-2 border-t border-blue-200">
                  <label className="block font-bold text-blue-950 mb-1">
                    Pilih Seksi Tujuan Alokasi:
                  </label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded text-gray-900 font-medium focus:outline-none"
                  >
                    {sections
                      .filter((s) => !s.section_code.includes("KAS"))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.section_code} - {s.section_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Upload Bukti Kwitansi (Auto-Receipt Naming Standard) */}
          <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-gray-500" />
                <span>Upload Bukti E-File (Kwitansi / Nota)</span>
              </label>
              <span className="text-[10px] font-mono text-gray-500">Max 10MB</span>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-gray-600 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-gray-200 file:text-xs file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
            />

            {/* Auto-Naming Preview Notice according to PRD */}
            <div className="bg-white border border-gray-200 p-2 rounded text-[11px] text-gray-600">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">
                Standarisasi Nama Berkas (Auto-Receipt Naming):
              </span>
              <code className="font-mono text-gray-900 font-bold block mt-0.5">
                {autoReceiptNamePreview}
              </code>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-[11px] text-gray-500 font-mono">
              Auto-Ref: {autoRefPreview}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded transition-colors cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
