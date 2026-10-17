"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingDown,
  FileSpreadsheet,
  ArrowDownLeft,
  Receipt,
  FileText,
  CheckCircle2,
  Lock,
  Printer,
  Download,
  FileDown,
  ChevronDown,
  Building2,
} from "lucide-react";
import { Section, Transaction, User } from "@/app/types";
import { ApiClient, TransactionInput } from "@/app/lib/api";
import {
  initialSections,
  initialTransactions,
  initialUsers,
} from "@/app/lib/mock-data";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { TransactionTable } from "@/app/components/admin/TransactionTable";
import { TransactionModal } from "@/app/components/admin/TransactionModal";
import { ReceiptModal } from "@/app/components/admin/ReceiptModal";
import { ReportModal } from "@/app/components/admin/ReportModal";

export default function DashboardSeksiPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Default section for Bendahara Seksi: Seksi Yadnya (SK-01)
  const [assignedSection, setAssignedSection] = useState<Section>(
    initialSections.find((s) => s.section_code === "SK-01") || initialSections[1]
  );

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user || (user.role !== "bendahara_seksi" && user.role !== "super_admin" && user.role !== "bendahara_umum")) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    let activeSec = assignedSection;
    if (user.section_id) {
      const sec = initialSections.find((s) => s.id === user.section_id);
      if (sec) {
        activeSec = sec;
        setAssignedSection(sec);
      }
    }
    refreshData(activeSec.id);
  }, [router]);

  const refreshData = async (targetSecId?: number) => {
    const activeSecId = targetSecId ?? assignedSection.id;
    const [sec, txData] = await Promise.all([
      ApiClient.getSections(),
      ApiClient.getTransactions({ section_id: activeSecId }),
    ]);
    if (sec) setSections(sec);
    if (txData) setTransactions(txData.items);
  };

  useEffect(() => {
    refreshData();
  }, [assignedSection]);

  const handleSaveTransaction = async (data: TransactionInput) => {
    const finalSecId =
      currentUser?.role === "bendahara_seksi" && currentUser.section_id
        ? currentUser.section_id
        : assignedSection.id;

    data.section_id = finalSecId;
    data.type = "expense";
    await ApiClient.createTransaction(data);
    await refreshData(finalSecId);
  };

  const handleDeleteExpense = async (tx: Transaction) => {
    // Only allow deleting manual expenses
    if (tx.type === "expense") {
      await ApiClient.deleteTransaction(tx.id);
      await refreshData();
    }
  };

  // Section switch helper (Strictly for super_admin and bendahara_umum; bendahara_seksi is locked)
  const handleSwitchDemoSection = (secId: number) => {
    if (currentUser?.role === "bendahara_seksi") return;
    const sec = sections.find((s) => s.id === secId);
    if (sec) {
      setAssignedSection(sec);
    }
  };

  // Calculate current section financial stats
  const sectionTxs = transactions.filter((t) => t.section_id === assignedSection.id);
  let totalIncome = 0;
  let totalExpense = 0;
  sectionTxs.forEach((t) => {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const currentBalance = sectionTxs.length > 0 ? sectionTxs[0].balance : totalIncome - totalExpense;

  return (
    <DashboardLayout
      pageTitle={`Buku Kas ${assignedSection.section_name}`}
      pageSubtitle={`Kode Seksi: ${assignedSection.section_code} • RBAC Terisolasi`}
    >
      <div className="space-y-6">
        {/* Banner with Scope Explanation & Section Switcher */}
        <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-700 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Ledger {assignedSection.section_name} ({assignedSection.section_code})
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-xl">
              Hak akses dibatasi khusus seksi ini. Pemasukan dari Bendahara Umum terkunci otomatis (read-only). Kelola belanja seksi dengan lampiran bukti nota E-File sah.
            </p>
          </div>

          {/* Controls Bar: Full-width on mobile (left to right borders), unified h-9.5 inline row on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            {/* If bendahara_seksi, strictly display locked section badge - cannot switch */}
            {currentUser?.role === "bendahara_seksi" ? (
              <div className="flex items-center bg-white border border-gray-300 rounded-md h-9.5 px-3 gap-2 shadow-xs w-full sm:w-auto min-w-0">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium text-gray-500 font-mono shrink-0">
                  Seksi Anda:
                </span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {assignedSection.section_code} - {assignedSection.section_name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded ml-auto sm:ml-2 shrink-0">
                  <Lock className="w-3 h-3 text-emerald-600" /> Terkunci
                </span>
              </div>
            ) : (
              /* For Super Admin & Bendahara Umum: Interactive Switcher */
              <div className="relative flex items-center bg-white border border-gray-300 rounded-md h-9.5 px-3 gap-2 shadow-xs hover:border-gray-400 transition-colors w-full sm:w-auto min-w-0 overflow-hidden">
                <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-[11px] font-medium text-gray-500 font-mono shrink-0">
                  Pilih Seksi:
                </span>
                <span className="text-xs font-bold text-gray-900 truncate flex-1 min-w-0">
                  {assignedSection.section_code} - {assignedSection.section_name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />

                <select
                  value={assignedSection.id}
                  onChange={(e) => handleSwitchDemoSection(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Pilih Seksi"
                >
                  {sections
                    .filter((s) => !s.section_code.includes("KAS"))
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.section_code} - {sec.section_name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Action Buttons Group: 50/50 grid on mobile, horizontal auto-width on desktop */}
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="h-9.5 w-full sm:w-auto justify-center px-2.5 sm:px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-[0.98]"
                title="Unduh Laporan Seksi Harian, Mingguan, Bulanan (PDF / Excel)"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Unduh Laporan</span>
              </button>

              <button
                onClick={() => setIsTxModalOpen(true)}
                className="h-9.5 w-full sm:w-auto justify-center px-2.5 sm:px-4 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-[0.98]"
                title="Catat Nota Pengeluaran Seksi Baru"
              >
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">+ Pengeluaran</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded border border-gray-200 bg-white">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Saldo Kas Seksi Saat Ini
            </div>
            <div className="text-xl font-bold font-mono text-gray-900">
              Rp {currentBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Sisa anggaran siap pakai di seksi
            </p>
          </div>

          <div className="p-4 rounded border border-gray-200 bg-white">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Dana Masuk (Penyaluran BU)</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700">
              Rp {totalIncome.toLocaleString("id-ID")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Auto-Ledger Sync dari Kas Induk
            </p>
          </div>

          <div className="p-4 rounded border border-gray-200 bg-white">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Pengeluaran Seksi
            </div>
            <div className="text-xl font-bold font-mono text-red-700">
              Rp {totalExpense.toLocaleString("id-ID")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Realisasi belanja upakara / operasional
            </p>
          </div>

          <div className="p-4 rounded border border-gray-200 bg-white">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Status Nota E-File
            </div>
            <div className="text-xl font-bold font-mono text-blue-700">
              100% Terlampir
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">
              Auto-Rename Standar PRD
            </p>
          </div>
        </div>

        {/* Section Transaction Ledger Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-gray-700 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 truncate">
                Daftar Pembukuan: {assignedSection.section_name}
              </h3>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Lembar Laporan Seksi"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Rekap Seksi</span>
              </button>
              <div className="text-xs text-gray-500 font-mono">
                {sectionTxs.length} Transaksi
              </div>
            </div>
          </div>

          <TransactionTable
            transactions={sectionTxs}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onDeleteTransaction={handleDeleteExpense}
            isSeksiView={true}
          />
        </div>
      </div>

      {/* Transaction Modal (Strictly Expense for this section) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        sections={sections}
        currentUser={currentUser || ApiClient.getCurrentUser()}
        defaultSectionId={assignedSection.id}
        initialType="expense"
        isAllocation={false}
      />

      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* Official Section Multi-Period Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          transactions={transactions}
          sections={sections}
          currentUser={currentUser || ApiClient.getCurrentUser()}
          lockedSectionId={assignedSection.id}
        />
      )}
    </DashboardLayout>
  );
}
