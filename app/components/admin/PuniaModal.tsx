"use client";

import React, { useState } from "react";
import { X, HeartHandshake, AlertCircle } from "lucide-react";
import { PuniaType } from "@/app/types";

interface PuniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    donor_name: string;
    donation_type: PuniaType;
    date: string;
    amount_money?: number;
    goods_name?: string;
    goods_quantity?: string;
    notes?: string;
  }) => Promise<void>;
}

export const PuniaModal: React.FC<PuniaModalProps> = ({ isOpen, onClose, onSave }) => {
  const [donorName, setDonorName] = useState("");
  const [donationType, setDonationType] = useState<PuniaType>("money");
  const [date, setDate] = useState("2026-10-15");

  React.useEffect(() => {
    try {
      setDate(new Date().toISOString().split("T")[0]);
    } catch {
      // fallback
    }
  }, []);
  const [amountMoney, setAmountMoney] = useState("");
  const [goodsName, setGoodsName] = useState("");
  const [goodsQuantity, setGoodsQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAmount = parseFloat(amountMoney.replace(/[^0-9]/g, ""));

    if (donationType === "money") {
      if (!cleanAmount || cleanAmount <= 0) {
        setErrorMsg("Masukkan nominal dana punia yang valid.");
        return;
      }
    } else {
      if (!goodsName.trim()) {
        setErrorMsg("Nama barang punia wajib diisi.");
        return;
      }
      if (!goodsQuantity.trim()) {
        setErrorMsg("Jumlah / kuantitas barang punia wajib diisi.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        donor_name: donorName.trim(),
        donation_type: donationType,
        date,
        amount_money: donationType === "money" ? cleanAmount : undefined,
        goods_name: donationType === "goods" ? goodsName.trim() : undefined,
        goods_quantity: donationType === "goods" ? goodsQuantity.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      setDonorName("");
      setAmountMoney("");
      setGoodsName("");
      setGoodsQuantity("");
      setNotes("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan data punia ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden select-none">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Catat Dana Punia Umat</h3>
              <p className="text-xs text-gray-500">Pura Dalem Desa Adat Metra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nama Lengkap Donatur / Krama / Keluarga <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: I Nyoman Dharma Wiguna & Keluarga"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Bentuk Punia <span className="text-red-600">*</span>
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value as PuniaType)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="money">Dana Tunai / Transfer (Money)</option>
                <option value="goods">Barang / Wewantenan (Goods)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tanggal Penerimaan <span className="text-red-600">*</span>
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

          {donationType === "money" ? (
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nominal Punia (IDR) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="5000"
                placeholder="Contoh: 5000000"
                value={amountMoney}
                onChange={(e) => setAmountMoney(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-bold tabular-nums text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Barang / Upakara <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beras Suci Bramah"
                  value={goodsName}
                  onChange={(e) => setGoodsName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Jumlah / Satuan <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 500 Kg (10 Sak)"
                  value={goodsQuantity}
                  onChange={(e) => setGoodsQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Catatan / Peruntukan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Punia Sekeluarga untuk Pawon Suci Upakara"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Punia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
