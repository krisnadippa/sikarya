"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);

  const processImageFile = async (file: File) => {
    setSelectedFile(file);
    if (!file.type.startsWith("image/")) {
      setImagePreviewUrl(null);
      setCompressedDataUrl(null);
      return;
    }

    setIsCompressing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.75);
            setImagePreviewUrl(compressed);
            setCompressedDataUrl(compressed);
          } else {
            setImagePreviewUrl(rawDataUrl);
            setCompressedDataUrl(rawDataUrl);
          }
          setIsCompressing(false);
        };
        img.onerror = () => {
          setImagePreviewUrl(rawDataUrl);
          setCompressedDataUrl(rawDataUrl);
          setIsCompressing(false);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      setIsCompressing(false);
    }
  };

  const handleClearPhoto = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setCompressedDataUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

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
  const ext = selectedFile ? selectedFile.name.split(".").pop() : "jpg";
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

      // Prefer compressed base64 photo if taken, or fallback to standardized receipt path
      const finalReceiptUrl = compressedDataUrl || (selectedFile ? `/uploads/receipts/${autoReceiptNamePreview}` : `/uploads/receipts/${autoReceiptNamePreview}`);

      await onSave({
        section_id: finalSectionId,
        date,
        type,
        amount: numAmount,
        description: description.trim(),
        target_section_id: canPerformAutoSync && enableAutoSync ? targetSectionId : null,
        receipt_file_url: finalReceiptUrl,
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

          {/* Upload / Foto Bukti Kwitansi (Direct Camera + Gallery) */}
          <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Bukti Fisik E-File (Foto Nota / Kwitansi)</span>
              </label>
              <span className="text-[10px] font-mono text-gray-500">Kamera HP / Berkas</span>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            {/* If no image selected yet */}
            {!imagePreviewUrl && !selectedFile ? (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span className="truncate">Foto Kamera Langsung</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">Pilih dari Galeri</span>
                </button>
              </div>
            ) : (
              /* Image preview and actions */
              <div className="bg-white border border-gray-200 rounded p-2.5 space-y-2">
                <div className="flex items-center gap-3">
                  {imagePreviewUrl ? (
                    <div className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview Nota"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {isCompressing ? "Mengompresi foto..." : "Foto Nota Terlampir"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-700 font-medium truncate mt-0.5">
                      {selectedFile?.name || "Foto Kamera"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : ""}
                      {compressedDataUrl ? " • Teroptimasi SiKarya" : ""}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      title="Foto Ulang Kamera"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      title="Hapus Foto"
                      className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

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
