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
      router.push("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  return (
    <DashboardLayout
      pageTitle="Loket Kasir Dana Punia"
      pageSubtitle="Posko Penerimaan & Pencatatan Sah Krama Pura Dalem Metra"
    >
      <PuniaForm currentUser={currentUser} />
    </DashboardLayout>
  );
}
