"use client";

import React, { useState, useEffect } from "react";
import { PublicPortalView } from "@/app/components/public/PublicPortalView";
import { ReceiptModal } from "@/app/components/admin/ReceiptModal";
import { ApiClient } from "@/app/lib/api";
import {
  initialKPISummary,
  initialPuniaDonations,
  initialSections,
  initialTransactions,
} from "@/app/lib/mock-data";
import { DashboardKPISummary, PuniaDonation, Section, Transaction } from "@/app/types";

export default function PublicPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [puniaList, setPuniaList] = useState<PuniaDonation[]>(initialPuniaDonations);
  const [kpiSummary, setKpiSummary] = useState<DashboardKPISummary>(initialKPISummary);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [sec, txData, kpi, punia] = await Promise.all([
        ApiClient.getSections(),
        ApiClient.getTransactions(),
        ApiClient.getKPISummary(),
        ApiClient.getPuniaDonations(),
      ]);
      if (sec) setSections(sec);
      if (txData) setTransactions(txData.items);
      if (kpi) setKpiSummary(kpi);
      if (punia) setPuniaList(punia);
    };
    fetchData();
  }, []);

  return (
    <>
      <PublicPortalView
        summary={kpiSummary}
        sections={sections}
        transactions={transactions}
        puniaList={puniaList}
        onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
      />
      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </>
  );
}
