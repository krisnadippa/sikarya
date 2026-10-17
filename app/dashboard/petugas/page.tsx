"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types";
import { ApiClient } from "@/app/lib/api";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { PuniaForm } from "@/app/components/petugas/PuniaForm";

export default function DashboardPetugasPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user || (user.role !== "petugas_punia" && user.role !== "super_admin" && user.role !== "panitia_punia")) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 font-medium">Memverifikasi otentikasi...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Loket Kasir Dana Punia"
      pageSubtitle="Posko Penerimaan & Pencatatan Sah Krama Pura Dalem Metra"
    >
      <PuniaForm currentUser={currentUser} />
    </DashboardLayout>
  );
}
