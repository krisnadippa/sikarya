"use client";

import React from "react";
import { CheckCircle2, X, Eye, FileText, ArrowRight } from "lucide-react";

export interface SuccessDetailItem {
  label: string;
  value: string;
  isHighlight?: boolean;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  details?: SuccessDetailItem[];
  onViewReceipt?: () => void;
  primaryButtonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Transaksi Berhasil Disimpan!",
  subtitle = "Data telah tercatat sah dan diperbarui secara otomatis ke dalam pembukuan kas.",
  details = [],
  onViewReceipt,
  primaryButtonText = "Selesai & Lanjutkan",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Top Highlight Banner */}
        <div className="h-1.5 w-full bg-emerald-500" />

        <div className="p-6 text-center space-y-4">
          {/* Animated Success Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subtitle}</p>
          </div>

          {/* Details Card */}
          {details.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2 text-left text-xs">
              {details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-1.5 last:pb-0"
                >
                  <span className="text-gray-500">{item.label}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      item.isHighlight ? "text-emerald-700 font-bold" : "text-gray-900 font-mono"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            {onViewReceipt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewReceipt();
                }}
                className="flex-1 py-2.5 px-3 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Bukti / Kwitansi</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>{primaryButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
