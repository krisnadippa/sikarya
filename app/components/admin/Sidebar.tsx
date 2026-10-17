"use client";

import React from "react";
import Image from "next/image";
import {
  Landmark,
  Layers,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Video,
  HeartHandshake,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedSectionId,
  onSelectSection,
}) => {
  const seksiItems = [
    { id: 1, code: "KAS-01", name: "Kas Umum Panitia", icon: Landmark },
    { id: 2, code: "SK-01", name: "Seksi Yadnya", icon: Sparkles },
    { id: 3, code: "SK-02", name: "Seksi Sarana & Prasarana", icon: Wrench },
    { id: 4, code: "SK-03", name: "Seksi Konsumsi", icon: UtensilsCrossed },
    { id: 5, code: "SK-04", name: "Seksi Publikasi & Dokumentasi", icon: Video },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-200" suppressHydrationWarning>
        <div className="flex items-center gap-2.5" suppressHydrationWarning>
          <Image
            src="/logo_hitam.png"
            alt="Logo SIKARYA"
            width={44}
            height={36}
            className="h-9 w-auto object-contain shrink-0"
            priority
          />
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">
              SIKARYA METRA
            </h1>
            <p className="text-[11px] text-gray-500 font-mono mt-1">
              Pura Dalem Desa Adat Metra
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Buku Kas & Ledger
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                onSelectTab("ledger");
                onSelectSection(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                activeTab === "ledger" && selectedSectionId === null
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Seluruh Transaksi</span>
              </div>
            </button>

            {seksiItems.map((seksi) => {
              const Icon = seksi.icon;
              const isSelected = activeTab === "ledger" && selectedSectionId === seksi.id;
              return (
                <button
                  key={seksi.id}
                  onClick={() => {
                    onSelectTab("ledger");
                    onSelectSection(seksi.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="truncate">{seksi.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {seksi.code}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Dana Punia & Umat
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab("punia")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                activeTab === "punia"
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>Daftar Dana Punia</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Keamanan & Arsitektur
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                activeTab === "security"
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-green-700" />
              <span>Cybersecurity Audit Log</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-600">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">Neon Postgres</span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-600"></span>
        </div>
        <p className="text-[10px] text-gray-500 font-mono">
          SSL Enforced | Fast-Pool Active
        </p>
      </div>
    </aside>
  );
};
