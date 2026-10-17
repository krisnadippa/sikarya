"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TvKioskView } from "@/app/components/kiosk/TvKioskView";
import { ApiClient } from "@/app/lib/api";
import {
  initialExpenseDistribution,
  initialKPISummary,
  initialPuniaDonations,
  initialTransactions,
} from "@/app/lib/mock-data";
import {
  DashboardKPISummary,
  ExpenseDistributionItem,
  PuniaDonation,
  Transaction,
} from "@/app/types";

export default function KioskPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [puniaList, setPuniaList] = useState<PuniaDonation[]>(initialPuniaDonations);
  const [kpiSummary, setKpiSummary] = useState<DashboardKPISummary>(initialKPISummary);
  const [expenseDistribution, setExpenseDistribution] =
    useState<ExpenseDistributionItem[]>(initialExpenseDistribution);

  useEffect(() => {
    const fetchData = async () => {
      const [txData, kpi, exp, punia] = await Promise.all([
        ApiClient.getTransactions(),
        ApiClient.getKPISummary(),
        ApiClient.getExpenseDistribution(),
        ApiClient.getPuniaDonations(),
      ]);
      if (txData) setTransactions(txData.items);
      if (kpi) setKpiSummary(kpi);
      if (exp) setExpenseDistribution(exp);
      if (punia) setPuniaList(punia);
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <TvKioskView
        summary={kpiSummary}
        expenseDistribution={expenseDistribution}
        transactions={transactions}
        puniaList={puniaList}
        onExitKiosk={() => router.push("/")}
      />
    </div>
  );
}
