"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  PlusCircle,
  ArrowRightLeft,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Printer,
  FileDown,
} from "lucide-react";
import {
  DashboardKPISummary,
  ExpenseDistributionItem,
  Section,
  Transaction,
  User,
} from "@/app/types";
import { ApiClient, TransactionInput } from "@/app/lib/api";
import {
  initialExpenseDistribution,
  initialKPISummary,
  initialSections,
  initialTransactions,
} from "@/app/lib/mock-data";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { KPICards } from "@/app/components/admin/KPICards";
import { TransactionTable } from "@/app/components/admin/TransactionTable";
import { TransactionModal } from "@/app/components/admin/TransactionModal";
import { ReceiptModal } from "@/app/components/admin/ReceiptModal";
import { ReportModal } from "@/app/components/admin/ReportModal";

export default function DashboardUmumPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [kpiSummary, setKpiSummary] = useState<DashboardKPISummary>(initialKPISummary);
  const [expenseDistribution, setExpenseDistribution] =
    useState<ExpenseDistributionItem[]>(initialExpenseDistribution);

  // Modals & form state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [initialTxType, setInitialTxType] = useState<"income" | "expense">("income");
  const [isAllocationMode, setIsAllocationMode] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Filter state
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | null>(null);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user || (user.role !== "bendahara_umum" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    refreshData();
  }, [router]);

  const refreshData = async () => {
    const [sec, txData, kpi, exp] = await Promise.all([
      ApiClient.getSections(),
      ApiClient.getTransactions({ section_id: selectedSectionFilter ?? undefined }),
      ApiClient.getKPISummary(),
      ApiClient.getExpenseDistribution(),
    ]);
    if (sec) setSections(sec);
    if (txData) setTransactions(txData.items);
    if (kpi) setKpiSummary(kpi);
    if (exp) setExpenseDistribution(exp);
  };

  useEffect(() => {
    refreshData();
  }, [selectedSectionFilter]);

  const handleSaveTransaction = async (data: TransactionInput) => {
    await ApiClient.createTransaction(data);
    await refreshData();
  };

  const handleDeleteTransaction = async (tx: Transaction) => {
    await ApiClient.deleteTransaction(tx.id);
    await refreshData();
  };

  const kasUmumSection = sections.find((s) => s.section_code === "KAS-01") || sections[0];

  return (
    <DashboardLayout
      pageTitle="Buku Kas Induk & Penyaluran"
      pageSubtitle="Kas Umum Panitia Karya Pura Dalem Metra (KAS-01)"
    >
      <div className="space-y-6">
        {/* Banner with CRUD Quick Actions */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-bold text-gray-900">
                Pusat Pembukuan Kas Umum
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl">
              Bendahara Umum berwenang mencatat penerimaan kas utama, pengeluaran kas induk, serta mendistribusikan dana ke seksi dengan sinkronisasi buku kas otomatis (Auto-Ledger Sync).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setInitialTxType("income");
                setIsAllocationMode(false);
                setIsTxModalOpen(true);
              }}
              className="justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Pemasukan</span>
            </button>

            <button
              onClick={() => {
                setInitialTxType("expense");
                setIsAllocationMode(false);
                setIsTxModalOpen(true);
              }}
              className="justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
            >
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Pengeluaran</span>
            </button>

            <button
              onClick={() => {
                setInitialTxType("expense");
                setIsAllocationMode(true);
                setIsTxModalOpen(true);
              }}
              className="justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Alokasi Seksi</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="justify-center px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
              title="Cetak & Unduh Laporan Harian, Mingguan, Bulanan & Rekap Akhir"
            >
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Unduh Laporan</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards summary={kpiSummary} />

        {/* Section Balances Grid */}
        <div className="bg-white border border-gray-200 p-5 rounded">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Status Saldo Seluruh Seksi (Ringkasan Konsolidasi)
              </h3>
              <p className="text-[11px] text-gray-500">
                Pilih seksi di bawah ini untuk memfilter tabel transaksi ledger.
              </p>
            </div>
            {selectedSectionFilter !== null && (
              <button
                onClick={() => setSelectedSectionFilter(null)}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Reset Filter (Tampilkan Semua)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {sections.map((sec) => {
              const summary = kpiSummary.section_summaries.find((s) => s.section_id === sec.id);
              const balance = summary ? summary.current_balance : 0;
              const isSelected = selectedSectionFilter === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() =>
                    setSelectedSectionFilter(isSelected ? null : sec.id)
                  }
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-gray-500">
                    <span className="font-semibold text-gray-700">{sec.section_code}</span>
                    <span>{summary?.transaction_count || 0} Trx</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {sec.section_name}
                  </div>
                  <div className="text-xs font-mono font-bold mt-2 text-gray-900">
                    Rp {balance.toLocaleString("id-ID")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Ledger Table with CRUD Actions */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-gray-700 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 truncate">
                Buku Kas Transaksi Ledger (Terverifikasi)
              </h3>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Lembar Laporan Sah"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Rekap Kas</span>
              </button>
              <div className="text-xs text-gray-500 font-mono">
                Total: {transactions.length} Baris
              </div>
            </div>
          </div>

          <TransactionTable
            transactions={transactions}
            sections={sections}
            selectedSectionId={selectedSectionFilter}
            onSelectSection={setSelectedSectionFilter}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        sections={sections}
        currentUser={currentUser || ApiClient.getCurrentUser()}
        defaultSectionId={kasUmumSection.id}
        initialType={initialTxType}
        isAllocation={isAllocationMode}
      />

      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* Official Multi-Period Report Modal (Harian, Mingguan, Bulanan, Akhir) */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          transactions={transactions}
          sections={sections}
          currentUser={currentUser || ApiClient.getCurrentUser()}
        />
      )}
    </DashboardLayout>
  );
}
